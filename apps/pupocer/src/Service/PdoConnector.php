<?php
namespace App\Service;

use PDO;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;

#[Autoconfigure(lazy: true)]
class PdoConnector
{
    private ?PDO $pdo = null;

    private string $dsn;

    private array $options;

    private ?string $dbUser = null;

    private ?string $dbPass = null;
    public function __construct(string $databaseUrl)
    {
        $parts = parse_url($databaseUrl);

        if ($parts === false || !isset($parts['host'], $parts['path'])) {
            throw new \RuntimeException('Invalid DATABASE_URL');
        }

        $scheme   = $parts['scheme'] ?? 'mysql';
        $host     = $parts['host'];
        $port     = $parts['port'] ?? 3306;
        $dbname   = ltrim($parts['path'], '/');

        $this->dbUser   = $parts['user'] ?? ($_ENV['DATABASE_USER'] ?? null);
        $this->dbPass   = $parts['pass'] ?? ($_ENV['DATABASE_PASSWORD'] ?? null);

        $this->dsn = sprintf(
            '%s:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $scheme,
            $host,
            $port,
            $dbname
        );

        $this->options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => true,
        ];
    }
    public function getConnection(): PDO
    {
        if ($this->pdo === null) {
            $this->pdo = new PDO(
                $this->dsn,
                $this->dbUser,
                $this->dbPass,
                $this->options
            );
        }

        return $this->pdo;
    }
}