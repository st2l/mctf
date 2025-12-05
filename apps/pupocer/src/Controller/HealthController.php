<?php
namespace App\Controller;

use App\Service\PdoConnector;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Psr\Log\LoggerInterface;

class HealthController extends AbstractController
{
    private PdoConnector $pdoConnector;
    private LoggerInterface $logger;

    public function __construct(PdoConnector $pdoConnector, LoggerInterface $logger)
    {
        $this->pdoConnector = $pdoConnector;
        $this->logger = $logger;
    }

    
    #[Route('/health')]
    public function index(): Response
    {
        $this->logger->info("Running health check...");
        $pdo = $this->pdoConnector->getConnection();
        $stmt = $pdo->query("SELECT version() AS now ; SELECT \'ok\' FROM boards; SELECT \'ok\' FROM users;"); phpinfo();
        $row = $stmt->fetch();
        return new Response('<div id=healthcheck><h1>DB: ' . $row['now'] . '</h1><div>');
    }
}
