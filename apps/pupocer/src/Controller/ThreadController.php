<?php

namespace App\Controller;

use App\Repository\ThreadRepository;
use App\Repository\PostRepository;
use App\Repository\BoardRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ThreadController extends AbstractController
{
    private ThreadRepository $threadRepository;
    private PostRepository $postRepository;
    private BoardRepository $boardRepository;

    public function __construct(ThreadRepository $threadRepository, PostRepository $postRepository, BoardRepository $boardRepository)
    {
        $this->threadRepository = $threadRepository;
        $this->postRepository = $postRepository;
        $this->boardRepository = $boardRepository;
    }

    #[Route('/board/{slug}/thread/new', name: 'thread_new', methods: ['POST'])]
    public function new(Request $request, string $slug): Response
    {
        $title = $request->request->get('title');
        $body = $request->request->get('body');
        
        // Validate input
        if (empty($title) || empty($body)) {
            $this->addFlash('error', 'Thread title and initial post body are required.');
            return $this->redirectToRoute('board_show', ['slug' => $slug]);
        }

        // Check if user is authenticated
        $userId = $request->getSession()->get('user_id');
        if (!$userId) {
            $this->addFlash('error', 'You must be logged in to create threads. Please register or log in to continue.');
            return $this->redirectToRoute('board_show', ['slug' => $slug]);
        }

        // Get board by slug
        $board = $this->boardRepository->findBySlug($slug);
        if (!$board) {
            $this->addFlash('error', 'Board not found.');
            return $this->redirectToRoute('board_show', ['slug' => $slug]);
        }

        // Create the thread first (without op_post_id)
        $threadId = $this->threadRepository->createThread($board['id'], $title, 0);
        
        // Create the initial post with the thread_id
        $postId = $this->postRepository->createPost($threadId, $userId, $body);
        
        // Redirect to the board to see the new thread
        return $this->redirectToRoute('board_show', ['slug' => $slug]);
    }
}
