<?php

namespace App\Controller;

use App\Repository\BoardRepository;
use App\Repository\PostRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BoardController extends AbstractController
{
    private BoardRepository $boardRepository;
    private PostRepository $postRepository;


    public function __construct(BoardRepository $boardRepository, PostRepository $postRepository)
    {
        $this->boardRepository = $boardRepository;
        $this->postRepository = $postRepository;
    }


    #[Route('/', name: 'board_list')]
    public function list(Request $request): Response
    {
        $boards = $this->boardRepository->findAll();

        return $this->render('board/list.html.twig', [
            'boards' => $boards
        ]);
    }

    #[Route('/{slug}/', name: 'board_show')]
    public function show(Request $request, string $slug): Response
    {

        $col = $request->query->get('col', 'id,slug,title');

        $func = function ($value) {
            return '`' . str_replace('`', '``', $value) . '`';
        };

        $columns = join(',', array_map($func, explode(',', $col)));
        $board = $this->boardRepository->findBySlug($slug, $columns);
        
        if (!$board) {
            throw $this->createNotFoundException('Board not found');
        }
        
        $currentUserId = $request->getSession()->get('user_id');
        $threads = $this->boardRepository->findThreadsWithPostsBySlug($slug);
        
        foreach ($threads as &$thread) {
            $thread['posts'] = $this->postRepository->findThreadWithReplies($thread['id'], $currentUserId);
        }
        
        return $this->render('board/show.html.twig', [
            'board' => $board,
            'threads' => $threads,
            // 'boards' => $this->boardRepository->findAll(),
            // 'currentUserId' => $currentUserId,
        ]);
    }
}
