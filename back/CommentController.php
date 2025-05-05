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
		$recipeId = $params['id'] ?? null;
		$message = $_POST['message'] ?? null;
		$imagePath = null;
	
		if (!$recipeId || (!$message && empty($_FILES['image']))) {
			http_response_code(400);
			echo json_encode(["error" => "Texte ou image requis."]);
			return;
		}
	
		$userId = $_COOKIE['user_id'] ?? null;
		if (!$userId) {
			http_response_code(401);
			echo json_encode(["error" => "Utilisateur non authentifié"]);
			return;
		}
	
		// Upload de l'image
		if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
			$uploadDir = "uploads/comments/";
			if (!is_dir($uploadDir)) {
				mkdir($uploadDir, 0777, true);
			}
	
			$filename = uniqid("comment_") . "_" . basename($_FILES['image']['name']);
			$targetPath = $uploadDir . $filename;
	
			if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
				$imagePath = $targetPath;
			}
		}
	
		$newComment = [
			'recipe_id' => $recipeId,
			'user_id' => $userId,
			'message' => $message,
			'timestamp' => date('c'),
			'image' => $imagePath
		];
	
		$this->saveComment($newComment);
	
		http_response_code(201);
		echo json_encode(['status' => 'success', 'message' => 'Commentaire enregistré']);
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

	public function handleGetCommentsRequest(array $params): void {
		$recipeId = $params['id'] ?? null;
	
		if (!$recipeId) {
			http_response_code(400);
			echo json_encode(["error" => "ID de recette requis"]);
			return;
		}
	
		$allComments = $this->getAllComments();
	
		$filtered = array_filter($allComments, fn($c) => $c['recipe_id'] == $recipeId);
	
		echo json_encode(array_values($filtered));
	}
		

	public function handleDeleteCommentRequest(): void
	{
		$email = $this->authController->validateAuth();
  
	}

}