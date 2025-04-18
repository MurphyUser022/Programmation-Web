<?php

require_once 'Router.php';
require_once 'AuthController.php';
require_once 'CommentController.php';
require_once 'RecettesController.php';
require_once 'RoleController.php';
require_once 'LikeController.php';
require_once 'TraductionController.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Gérer les requêtes de type preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}


session_start(); 

$router = new Router();
$authController = new AuthController();
// Créer l'instance de CommentController avec les arguments nécessaires
$commentController = new CommentController('data/comments.json', $authController);
$roleController = new RoleController('data/users.json', $authController);
$likeController = new LikeController('data/recipes.json', $authController);
$recettesController = new RecettesController('data/recipes.json', $authController);
$traductionController = new TraductionController('data/recipes.json', 'data/users.json',$authController);


// Connexion et Deconnexion
$router->register('POST', '/auth/login', [$authController, 'handleLoginRequest']);
$router->register('POST', '/auth/register', [$authController, 'handleRegister']);
$router->register('POST', '/auth/logout', [$authController, 'handleLogout']);
$router->register('GET', '/users', [$authController, 'getAllUsers']);




//Gestion des Recettes
$router->register('POST', '/recipes',[$recettesController, 'AjouteRecette']);
$router->register('POST', '/test',[$recettesController, 'testCokiee']);
$router->register('POST', '/recipes',[$recettesController, 'testCokiee']);

$router->register('GET', '/recipes', [$recettesController, 'ConsultRecipe']);
$router->register('GET', '/recipes/{recipe_id}', [$recettesController, 'RecipeByID']);
$router->register('DELETE', '/recipes/delete/{recipe_id}', [$recettesController, 'DeleteRecipeByID']);
$router->register('GET', '/recipes', [$recettesController, 'searchRecipes']);

//gestion des roles
$router->register('POST', '/roles/request', [$roleController, 'handleRoleRequest']);
$router->register('POST', '/roles/{id}/approve', function($id) use ($roleController) {
    $roleController->approveRole(['id' => $id]);
});

$router->register('POST', '/roles/{id}/reject', [$roleController, 'rejectRole']);

// gestion des commentaires 
$router->register('POST','/recipes/{id}/Addcomments', [$commentController, 'handlePostCommentRequest']);
$router->register('GET','/recipes/{id}/Getcomments', [$commentController, 'handlePostCommentRequest']);

// gestion des likes
$router->register('POST','/recipes/{recipe_id}/like', [$likeController, 'addLike']);
$router->register('DELETE','/recipes/{recipe_id}/like', [$likeController, 'removeLike']);
$router->register('GET', '/recipes/{recipe_id}/like', [$likeController, 'countLikes']);

// gestion des traductions
$router->register('POST', '/recipes/{id}/traduction', [$traductionController, 'addTraduction']);
$router->register('GET', '/recipes/{id}/traduction/{lang}', [$traductionController, 'getRecettesTraduits']);

$router->handleRequest();
