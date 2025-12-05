<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{

    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }
    
    #[Route('/login/', name: 'app_login', methods: ['GET', 'POST'])]
    public function login(Request $request): Response
    {
        if ($request->isMethod('POST')) {
            $username = $request->request->get('username');
            $password = $request->request->get('password');

            $user = $this->userRepository->findByUsername($username);

            if ($user && $this->userRepository->verifyPassword($username, $password)) {
                // Establish session
                $request->getSession()->set('user_id', $user['id']);
                return $this->redirectToRoute('app_profile');
            } else {
                // TODO: Handle invalid credentials
                return $this->render('login.html.twig', [
                    'error' => 'Invalid username or password'
                ]);
            }
        }

        return $this->render('login.html.twig');
    }

    #[Route('/signup/', name: 'app_signup', methods: ['GET', 'POST'])]
    public function signup(Request $request): Response
    {
        if ($request->isMethod('POST')) {
            $username = $request->request->get('username');
            $password = $request->request->get('password');
            $confirmPassword = $request->request->get('confirm_password');

            if ($password !== $confirmPassword) {
                return $this->render('signup.html.twig', [
                    'error' => 'Passwords do not match'
                ]);
            }

            if ($this->userRepository->findByUsername($username)) {
                return $this->render('signup.html.twig', [
                    'error' => 'Username already exists'
                ]);
            }

            $this->userRepository->createUser($username, $password);

            return $this->redirectToRoute('app_login');
        }

        return $this->render('signup.html.twig');
    }

    #[Route('/profile/', name: 'app_profile', methods: ['GET'])]
    public function profile(Request $request): Response
    {
        // Check if user is authenticated
        $userId = $request->getSession()->get('user_id');
        if (!$userId) {
            return $this->redirectToRoute('app_login');
        }

        // Fetch user data
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            // If user not found, logout
            $request->getSession()->invalidate();
            return $this->redirectToRoute('app_login');
        }

        // Render profile template with user data
        return $this->render('profile.html.twig', [
            'username' => $user['username']
        ]);
    }

    #[Route('/logout/', name: 'app_logout', methods: ['GET'])]
    public function logout(Request $request): Response
    {
        // Clear all session data
        $session = $request->getSession();
        $session->clear();
        $session->invalidate();
        
        // Redirect to login page
        return $this->redirectToRoute('app_login');
    }
}
