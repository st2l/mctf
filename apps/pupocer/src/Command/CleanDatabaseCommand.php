<?php

namespace App\Command;

use App\Service\PdoConnector;
use PDO;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class CleanDatabaseCommand extends Command
{
    protected static $defaultName = 'app:clean-db';
    protected static $defaultDescription = 'Cleans database by removing records older than 5 minutes';

    private PdoConnector $pdoConnector;

    public function __construct(PdoConnector $pdoConnector)
    {
        parent::__construct();
        $this->pdoConnector = $pdoConnector;
    }

    protected function configure(): void
    {
        $this
            ->setDescription(self::$defaultDescription)
            ->setAliases(['app:clean']);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $pdo = $this->pdoConnector->getConnection();

        $io->title('Database Cleaner');
        $io->text('Removing records older than 5 minutes...');

        $totalDeleted = 0;

        try {
            $pdo->beginTransaction();

            //  posts 
            $deletedPosts = $this->deleteOldRecords($pdo, 'posts', 'created_at', $io);
            $totalDeleted += $deletedPosts;

            // threads 
            $deletedThreads = $this->deleteOldRecords($pdo, 'threads', 'created_at', $io);
            $totalDeleted += $deletedThreads;

            // users
            $deletedUsers = $this->deleteOldRecords($pdo, 'users', 'created_at', $io);
            $totalDeleted += $deletedUsers;

            // boards 
            // $deletedBoards = $this->deleteOldRecords($pdo, 'boards', 'created_at', $io);
            // $totalDeleted += $deletedBoards;

            $pdo->commit();
            $io->success(sprintf(
                'Database cleaning completed. Total rows deleted: %d (Posts: %d, Threads: %d, Users: %d)',
                $totalDeleted,
                $deletedPosts,
                $deletedThreads,
                $deletedUsers
            ));

            return Command::SUCCESS;
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $io->error(sprintf('Error cleaning database: %s', $e->getMessage()));
            return Command::FAILURE;
        }
    }

    private function deleteOldRecords(PDO $pdo, string $table, string $timestampColumn, SymfonyStyle $io): int
    {
        $sql = sprintf(
            'DELETE FROM %s WHERE %s < DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
            $table,
            $timestampColumn
        );

        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $deletedCount = $stmt->rowCount();

        $io->text(sprintf('  - %s: %d row(s) deleted', $table, $deletedCount));

        return $deletedCount;
    }
}

