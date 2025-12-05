<?php

namespace App\Repository;

use App\Service\PdoConnector;
use PDO;

class UserRepository
{
    private PdoConnector $pdoConnector;

    public function __construct(PdoConnector $pdoConnector)
    {
        $this->pdoConnector = $pdoConnector;
    }

    public function findAll(): array
    {
        // Get PDO connection using dependency injection
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->query('SELECT * FROM users ORDER BY id ASC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllUsers(int $limit, int $offset): array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('SELECT * FROM users ORDER BY id ASC LIMIT :limit OFFSET :offset');
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByUsername(string $username): ?array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE username = :username');
        $stmt->execute(['username' => $username]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        // Ensure we return null if no user is found, not false
        return $result === false ? null : $result;
    }

    public function findById(int $id): ?array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        // Ensure we return null if no user is found, not false
        return $result === false ? null : $result;
    }

    public function createUser(string $username, string $password): array
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (:username, :password_hash)');
        $stmt->execute([
            'username' => $username,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT)
        ]);

        $id = (int)$pdo->lastInsertId();
        return $this->findById($id);
    }

    public function verifyPassword(string $username, string $password): bool
    {
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE username = :username');
        $stmt->execute(['username' => $username]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            return password_verify($password, $result['password_hash']);
        }
        
        return false;
    }
}
