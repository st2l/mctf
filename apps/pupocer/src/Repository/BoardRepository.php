<?php

namespace App\Repository;

use Psr\Log\LoggerInterface;
use App\Service\PdoConnector;

class BoardRepository
{
    private PdoConnector $pdoConnector;
    private LoggerInterface $logger;

    public function __construct(PdoConnector $pdoConnector, LoggerInterface $logger)
    {
        $this->pdoConnector = $pdoConnector;
        $this->logger = $logger;
    }
    public function findAll(): array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->query("SELECT id, slug, title, created_at FROM boards ORDER BY slug ASC");

        return $stmt->fetchAll();
    }

    public function findBySlug(string $slug, string $sanitizedCol = 'id, slug, title'): ?array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare("SELECT $sanitizedCol FROM boards WHERE slug = ?");
        $stmt->execute([$slug]);

        $result = $stmt->fetch();

        return $result === false ? null : $result;
    }

    public function findThreadsWithPostsBySlug(string $slug): array
    {
        $pdo = $this->pdoConnector->getConnection();
        
        // Get threads for the board, ordered by most recently bumped
        $threadsStmt = $pdo->prepare('
            SELECT t.id, t.title, t.bumped_at, t.created_at
            FROM threads t
            INNER JOIN boards b ON t.board_id = b.id
            WHERE b.slug = :slug AND t.is_deleted = 0
            ORDER BY t.bumped_at DESC
        ');
        $threadsStmt->execute(['slug' => $slug]);
        $threads = $threadsStmt->fetchAll();
        
        // Get posts for each thread
        foreach ($threads as &$thread) {
            $postsStmt = $pdo->prepare('
                SELECT p.id, p.body, p.created_at, u.username
                FROM posts p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.thread_id = :thread_id
                ORDER BY p.created_at ASC
            ');
            $postsStmt->execute(['thread_id' => $thread['id']]);
            $thread['posts'] = $postsStmt->fetchAll();
        }
        
        return $threads;
    }
}
