<?php

require_once 'Router.php';
require_once 'AuthController.php';
require_once 'CommentController.php';
require_once 'RecettesController.php';
require_once 'LikeController.php';
//require_once 'TpController.php';

session_start(); 

$router = new Router();
$authController = new AuthController(__DIR__ . '/data/users.json');
//$commentController = new CommentController(__DIR__ . '/data/comments.json', $authController);
// Créer l'instance de CommentController avec les arguments nécessaires
$commentController = new CommentController('data/comments.json', $authController);
//$likeController  = new CommentController('data/likes.json', $authController);
//$commentController = new CommentController();
$roleController = new RoleController('data/users.json', $authController);

//$TpController = new TpController('back/TpController.php');

$loginController = new AuthController();
$RecettesController = new RecettesController();
//$router->register('POST', '/register', [$authController, 'handleRegister']);
//§$router->register('POST', '/login', [$authController, 'handleLogin']);
//$router->register('POST', '/logout', [$authController, 'handleLogout']);

//$router->register('POST', '/comment', [$commentController, 'handlePostCommentRequest']);
//$router->register('GET', '/comment', [$commentController, 'handleGetCommentsRequest']);
//$router->register('DELETE', '/comment', [$commentController, 'handleDeleteCommentRequest']);

// Gestion des sessions 
// Essaie 1
 //   $router->register('POST', '/save',[$TpController, 'RegisterRequest']);
 //   $router->register('Get', '/home', [$TpController, 'HomeRequest']);
//    $router->register('Get', '/saved', [$TpController, 'PageRegisterRequest']);


// Connexion et Deconnexion
$router->register('POST', '/auth/login', [$loginController, 'handleLoginRequest']);
$router->register('POST', '/auth/register', [$loginController, 'handleRegister']);
$router->register('POST', '/auth/logout', [$loginController, 'handleLogout']);

//Gestion des Recettes
$router->register('POST', '/recipes',[$RecettesController, 'AjouteRecette']);
$router->register('POST', '/test',[$RecettesController, 'testCokiee']);
$router->register('POST', '/recipes',[$RecettesController, 'testCokiee']);

$router->register('GET', '/recipes', [$RecettesController, 'ConsultRecipe']);
$router->register('DELETE', '/recipes/delete/{recipe_id}', [$RecettesController, 'DeleteRecipeByID']);
$router->register('GET', '/recipes', [$RecettesController, 'searchRecipes']);

//gestion des roles
$router->register('POST', '/roles/request', [$roleController, 'handleRoleRequest']);
$router->register('POST', '/roles/{id}/approve', [$roleController, 'approveRole']);
$router->register('POST', '/roles/{id}/assign', [$roleController, 'assignRole']);



// Comment manager
$router->register('POST','/recipes/{recipe_id}/comments', [$commentController, 'handlePostCommentRequest']);
// Like manager
//$router->register('POST','/recipes/{recipe_id}/like', [$likeController, 'handleAddLike']);




$router->handleRequest();
