<?php

class AuthController
{
	private string $filePath;

	public function __construct(string $filePath)
	{
		$this->filePath = $filePath;
	}

	// TODO: Implement the handleRegister method
	public function handleRegister(): void
	{
		// Hints:
		// 1. Check if the request Content-Type is 'application/x-www-form-urlencoded'
		// 2. Get the email and password from the POST data
		// 3. Validate the email and password
		// 4. Check if the email is already registered
		// 5. Hash the password using password_hash
		// 6. Save the user data to the file
		// 7. Return a success message with HTTP status code 201
		// If any error occurs, return an error message with the appropriate HTTP status code
		// Make sure to set the Content-Type header to 'application/json' in the response
		// You can use the json_encode function to encode an array as JSON
		// You can use the http_response_code function to set the HTTP status code
	}

	// TODO: Implement the handleLogin method
	public function handleLogin(): void
	{
		// Hints:
		// 1. Check if the request Content-Type is 'application/x-www-form-urlencoded'
		// 2. Get the email and password from the POST data
		// 3. Validate the email and password
		// 4. Check if the user exists and the password is correct
		// 5. Store the user session
		// 6. Return a success message with HTTP status code 200
		// Additional hints:
		// If any error occurs, return an error message with the appropriate HTTP status code
		// Make sure to set the Content-Type header to 'application/json' in the response
		// You can use the getAllUsers method to get the list of registered users
		// You can use the password_verify function to verify the password
		// You can use the $_SESSION superglobal to store the user session
		// You can use the json_encode function to encode an array as JSON
		// You can use the http_response_code function to set the HTTP status code
	}

	public function handleLogout(): void
	{
		session_destroy(); // Clear session
		http_response_code(200);
		echo json_encode(['message' => 'Logged out successfully']);
	}

	public function validateAuth(): ?string
	{
		return $_SESSION['user'] ?? null;
	}

	private function getAllUsers(): array
	{
		return file_exists($this->filePath) ? json_decode(file_get_contents($this->filePath), true) ?? [] : [];
	}
}
