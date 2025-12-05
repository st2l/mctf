<?php

namespace App\Repository;

use App\Service\PdoConnector;

class ThreadRepository
{
    private PdoConnector $pdoConnector;

    public function __construct(PdoConnector $pdoConnector)
    {
        $this->pdoConnector = $pdoConnector;
    }

    public function findAll(): array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->query('SELECT id, board_id, op_post_id, title, bumped_at, is_deleted, created_at FROM threads ORDER BY created_at DESC');

        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('SELECT id, board_id, op_post_id, title, bumped_at, is_deleted, created_at FROM threads WHERE id = :id');
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result === false ? null : $result;
    }

    public function findByBoardId(int $boardId): array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('SELECT id, board_id, op_post_id, title, bumped_at, is_deleted, created_at FROM threads WHERE board_id = :board_id AND is_deleted = 0 ORDER BY bumped_at DESC');
        $stmt->execute(['board_id' => $boardId]);

        return $stmt->fetchAll();
    }

    public function createThread(int $boardId, ?string $title, int $opPostId): int
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('
            INSERT INTO threads (board_id, title, op_post_id, bumped_at) 
            VALUES (:board_id, :title, :op_post_id, NOW())
        ');
        $stmt->execute([
            'board_id' => $boardId,
            'title' => $title,
            'op_post_id' => $opPostId
        ]);

        return (int)$pdo->lastInsertId();
    }
}
