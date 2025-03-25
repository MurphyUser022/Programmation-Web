<?php

require_once 'Router.php';
require_once 'AuthController.php';
require_once 'CommentController.php';
//require_once 'TpController.php';

session_start(); // Start the session

$router = new Router();
$authController = new AuthController(__DIR__ . '/data/users.json');
$commentController = new CommentController(__DIR__ . '/data/comments.json', $authController);
//$TpController = new TpController('back/TpController.php');

$loginController = new AuthController();

//$router->register('POST', '/register', [$authController, 'handleRegister']);
//§$router->register('POST', '/login', [$authController, 'handleLogin']);
//$router->register('POST', '/logout', [$authController, 'handleLogout']);

$router->register('POST', '/comment', [$commentController, 'handlePostCommentRequest']);
$router->register('GET', '/comment', [$commentController, 'handleGetCommentsRequest']);
$router->register('DELETE', '/comment', [$commentController, 'handleDeleteCommentRequest']);

// Gestion des sessions 
// Essaie 1
 //   $router->register('POST', '/save',[$TpController, 'RegisterRequest']);
 //   $router->register('Get', '/home', [$TpController, 'HomeRequest']);
//    $router->register('Get', '/saved', [$TpController, 'PageRegisterRequest']);

//Essaie 2

$router->register('POST', '/auth/login', [$loginController, 'handleLoginRequest']);
$router->register('POST', '/auth/register', [$loginController, 'handleRegister']);


//handleRegister


$router->handleRequest();
