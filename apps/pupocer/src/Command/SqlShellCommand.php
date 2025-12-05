<?php

namespace App\Command;

use App\Service\PdoConnector;
use PDO;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class SqlShellCommand extends Command
{
    protected static $defaultName = 'app:sqlshell';
    protected static $defaultDescription = 'Execute SQL queries directly against the database';

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
            ->addArgument('query', InputArgument::REQUIRED, 'The SQL query to execute')
            ->addOption('format', 'f', InputOption::VALUE_REQUIRED, 'Output format: json or raw', 'raw');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $pdo = $this->pdoConnector->getConnection();
        $query = $input->getArgument('query');
        $format = $input->getOption('format');

        if (!in_array($format, ['json', 'raw'], true)) {
            $io->error('Invalid format. Use "json" or "raw"');
            return Command::FAILURE;
        }

        try {
            $stmt = $pdo->query($query);

            // Only output for SELECT queries
            if (stripos(trim($query), 'SELECT') === 0) {
                $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (empty($results)) {
                    return Command::SUCCESS;
                }

                if ($format === 'json') {
                    $output->writeln(json_encode($results, JSON_PRETTY_PRINT));
                } else {
                    // Raw format: space-separated
                    $columns = array_keys($results[0]);
                    $io->writeln(implode(' ', $columns));

                    foreach ($results as $row) {
                        $io->writeln(implode(' ', $row));
                    }
                }
            }
            // Non-SELECT queries execute silently with no output

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error(sprintf('Error executing query: %s', $e->getMessage()));
            return Command::FAILURE;
        }
    }
}

