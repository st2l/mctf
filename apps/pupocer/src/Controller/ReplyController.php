<?php

namespace App\Controller;

use App\Repository\PostRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ReplyController extends AbstractController
{
    private PostRepository $postRepository;

    public function __construct(PostRepository $postRepository)
    {
        $this->postRepository = $postRepository;
    }

    #[Route('/board/{slug}/thread/{threadId}/reply', name: 'reply_submit', methods: ['POST'])]
    public function submit(Request $request, string $slug, int $threadId): Response
    {
        $body = $request->request->get('body');
        $parentPostId = $request->request->get('parent_post_id') ? (int)$request->request->get('parent_post_id') : null;
        $isPrivate = $request->request->get('is_private') ? true : false;
        
        // Validate input
        if (empty($body)) {
            $this->addFlash('error', 'Reply body is required.');
            return $this->redirectToRoute('board_show', ['slug' => $slug]);
        }

        // Check if user is authenticated
        $userId = $request->getSession()->get('user_id');
        if (!$userId) {
            $this->addFlash('error', 'You must be logged in to reply. Please register or log in to continue.');
            return $this->redirectToRoute('board_show', ['slug' => $slug]);
        }

        // Create the reply
        $replyId = $this->postRepository->createReply($threadId, $userId, $body, $parentPostId, $isPrivate);
        
        // Redirect back to the board to see the new reply
        return $this->redirectToRoute('board_show', ['slug' => $slug]);
    }

    #[Route('/board/{slug}/thread/{threadId}/post/{postId}/replies', name: 'reply_view', methods: ['GET'])]
    public function view(Request $request, string $slug, int $threadId, int $postId): Response
    {
        $currentUserId = $request->getSession()->get('user_id');
        
        // Get the original post
        $originalPost = $this->postRepository->findById($postId, $currentUserId);
        if (!$originalPost) {
            throw $this->createNotFoundException('Post not found');
        }

        // Get replies to this post
        $replies = $this->postRepository->findRepliesByPostId($postId, $currentUserId);
        
        return $this->render('reply/view.html.twig', [
            'originalPost' => $originalPost,
            'replies' => $replies,
            'slug' => $slug,
            'threadId' => $threadId,
            'postId' => $postId,
            'currentUserId' => $currentUserId
        ]);
    }
}
