<?php

class CommentController
{
	private string $filePath = "data/comments.json";
	private AuthController $authController;

	public function __construct(string $filePath, AuthController $authController)
	{
		$this->filePath = $filePath;
		$this->authController = $authController;
	}


	public function handlePostCommentRequest(array $params): void {
		// L'ID de la recette est dans les paramètres de l'URL
		$recipeId = $params['recipe_id'] ?? null;
		
		// Récupérer l'ID de la recette depuis l'URL
		$message = $_POST['message'] ?? null;
	
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
			'message' => $message,
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

	// Retrieves all comments from the file
	private function getAllComments(): array
	{
		if (!file_exists($this->filePath)) {
			return [];
		}

		$content = file_get_contents($this->filePath);
		return json_decode($content, true) ?? [];
	}

	public function handleGetCommentsRequest(): void
	{
		http_response_code(200);
		header('Content-Type: application/json');
		echo json_encode($this->getAllComments());
	}

	public function handleDeleteCommentRequest(): void
	{
		$email = $this->authController->validateAuth();
  
}





public function GetCommentsByRecipe(array $params): void
{
    $recipeId = $params['id'];

    if (!file_exists($filePath)) {
        http_response_code(200);
        echo json_encode([]);
        return;
    }

    $comments = json_decode(file_get_contents($commentsFile), true);

    $filtered = array_filter($comments, function ($c) use ($recipeId) {
        return $c['recipe_id'] == $recipeId;
    });

    http_response_code(200);
    echo json_encode(array_values($filtered)); // array_values pour réindexer
}



}