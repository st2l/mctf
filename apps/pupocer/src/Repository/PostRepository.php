<?php

namespace App\Repository;

use App\Service\PdoConnector;

class PostRepository
{
    private $pdoConnector;

    public function __construct(PdoConnector $pdoConnector)
    {
        $this->pdoConnector = $pdoConnector;
    }

    public function findAll(): array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->query('SELECT id, thread_id, user_id, body, created_at FROM posts ORDER BY created_at DESC');

        return $stmt->fetchAll();
    }

    public function findByThreadId(int $threadId): array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('
            SELECT p.id, p.thread_id, p.user_id, p.body, p.created_at, u.username
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.thread_id = :thread_id
            ORDER BY p.created_at ASC
        ');
        $stmt->execute(['thread_id' => $threadId]);

        return $stmt->fetchAll();
    }

    public function createPost(int $threadId, ?int $userId, string $body): int
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('
            INSERT INTO posts (thread_id, user_id, body, created_at) 
            VALUES (:thread_id, :user_id, :body, NOW())
        ');
        $stmt->execute([
            'thread_id' => $threadId,
            'user_id' => $userId,
            'body' => $body
        ]);

        return (int)$pdo->lastInsertId();
    }

    public function createReply(int $threadId, ?int $userId, string $body, ?int $parentPostId = null, bool $isPrivate = false): int
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('
            INSERT INTO posts (thread_id, user_id, body, parent_post_id, is_private, created_at) 
            VALUES (:thread_id, :user_id, :body, :parent_post_id, :is_private, NOW())
        ');
        $stmt->execute([
            'thread_id' => $threadId,
            'user_id' => $userId,
            'body' => $body,
            'parent_post_id' => $parentPostId,
            'is_private' => $isPrivate ? 1 : 0
        ]);

        return (int)$pdo->lastInsertId();
    }

    public function findRepliesByPostId(int $postId, ?int $currentUserId = null): array
    {
        $pdo = $this->pdoConnector->getConnection();
        
        $sql = '
            SELECT p.id, p.thread_id, p.user_id, p.body, p.parent_post_id, p.is_private, p.created_at, u.username
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.parent_post_id = :post_id
        ';
        
        // Enhanced privacy logic for replies
        if ($currentUserId === null) {
            // Not logged in: only show public replies
            $sql .= ' AND p.is_private = 0';
        } else {
            // Logged in: show public replies + private replies where user is involved
            $sql .= ' AND (
                p.is_private = 0 OR 
                p.user_id = :user_id OR
                :post_id IN (
                    SELECT p2.id FROM posts p2 WHERE p2.user_id = :user_id_subquery
                )
            )';
        }
        
        $sql .= ' ORDER BY p.created_at ASC';
        
        $stmt = $pdo->prepare($sql);
        $params = ['post_id' => $postId];
        if ($currentUserId !== null) {
            $params['user_id'] = $currentUserId;
            $params['user_id_subquery'] = $currentUserId;
        }
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }

    public function findThreadWithReplies(int $threadId, ?int $currentUserId = null): array
    {
        $pdo = $this->pdoConnector->getConnection();
        
        $sql = '
            SELECT p.id, p.thread_id, p.user_id, p.body, p.parent_post_id, p.is_private, p.created_at, u.username
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.thread_id = :thread_id
        ';
        
        // Enhanced privacy logic
        if ($currentUserId === null) {
            // Not logged in: only show public posts
            $sql .= ' AND p.is_private = 0';
        } else {
            // Logged in: show public posts + private posts where user is involved
            $sql .= ' AND (
                p.is_private = 0 OR 
                p.user_id = :user_id OR 
                p.parent_post_id IS NULL OR
                p.parent_post_id IN (
                    SELECT p2.id FROM posts p2 WHERE p2.user_id = :user_id_subquery
                )
            )';
        }
        
        $sql .= ' ORDER BY p.created_at ASC';
        
        $stmt = $pdo->prepare($sql);
        $params = ['thread_id' => $threadId];
        if ($currentUserId !== null) {
            $params['user_id'] = $currentUserId;
            $params['user_id_subquery'] = $currentUserId;
        }
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }

    public function findById(int $id, ?int $currentUserId = null): ?array
    {
        $pdo = $this->pdoConnector->getConnection();

        $sql = 'SELECT id, thread_id, user_id, body, parent_post_id, is_private, created_at FROM posts WHERE id = :id';

        $params = ['id' => $id];

        // If user is not logged in, only show public posts
        if ($currentUserId === null) {
            $sql .= ' AND is_private = 0';
        } else {
            // When a user is logged in, also allow access to their private posts
            $sql .= ' AND (is_private = 0 OR user_id = :user_id)';
            $params['user_id'] = $currentUserId;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $result = $stmt->fetch();

        return $result === false ? null : $result;
    }
}
