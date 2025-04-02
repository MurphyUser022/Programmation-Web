<?php
/*
class LikeController
{
	private string $filePath = "data/likes.json";
	private AuthController $authController;

	public function __construct(string $filePath, AuthController $authController)
	{
		$this->filePath = $filePath;
		$this->authController = $authController;
	}


	public function handleAddLike(array $params): void {
		// L'ID de la recette est dans les paramètres de l'URL
		$recipeId = $params['recipe_id'] ?? null;
		

		if (!$recipeId || !$message) {
			echo "Recipe ID and message are required.";
			return;
		}
	
		// Get user ID from cookies
		$userId = $_COOKIE['user_id'] ?? null;
		if (!$userId) {
			echo "User not authenticated.";
			return;
		}
	
		// Créer le commentaire
		$newComment = [
			'recipe_id' => $recipeId,
			'user_id' => $userId,
			'timestamp' => date('c'),
		];
	
		// Sauvegarder le commentaire
		$this->saveComment($newComment);
	
		// Retourner la réponse
		echo json_encode(['status' => 'success', 'message' => 'Comment saved successfully.']);
	}
	
    

	// Saves a new comment to the file
	private function saveComment(array $comment): void
	{
		$comments = $this->getAllComments();
		$comments[] = $comment;

		file_put_contents($this->filePath, json_encode($comments, JSON_PRETTY_PRINT));
	}

	}
*/