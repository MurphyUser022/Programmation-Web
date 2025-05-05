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
	
		$data = json_decode(file_get_contents("php://input"), true);
		$message = $data['message'] ?? null;
	
		if (!$recipeId || !$message) {
			http_response_code(400);
			echo json_encode(["error" => "Recipe ID and message are required."]);
			return;
		}
	
		$userId = $_COOKIE['user_id'] ?? null;
		if (!$userId) {
			http_response_code(401);
			echo json_encode(["error" => "User not authenticated."]);
			return;
		}
	
		$newComment = [
			'recipe_id' => $recipeId,
			'user_id' => $userId,
			'message' => $message,
			'timestamp' => date('c'),
		];
	
		$this->saveComment($newComment);
	
		http_response_code(201);
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