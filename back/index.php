<?php

require_once 'Router.php';
require_once 'AuthController.php';
require_once 'CommentController.php';
require_once 'RecipeController.php';
require_once 'RoleController.php';

session_start(); 

$router = new Router();
$authController = new AuthController(__DIR__ . '/data/users.json');
$commentController = new CommentController(__DIR__ . '/data/comments.json', $authController);
$recipeController = new RecipeController(__DIR__ . '/data/recipes.json', $authController);
$roleController = new RoleController(__DIR__ . '/data/recipes.json', $authController);

$router->register('POST', '/register', [$authController, 'handleRegister']);
$router->register('POST', '/login', [$authController, 'handleLogin']);
$router->register('POST', '/logout', [$authController, 'handleLogout']);



$router->handleRequest();
