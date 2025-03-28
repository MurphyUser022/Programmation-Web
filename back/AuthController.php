<?php

class AuthController
{
    private string $filePath;

	public function __construct(string $filePath)
	{
		$this->filePath = $filePath;
	}

	public function handleRegister(): void
	{
		// 1. Check if the request Content-Type is 'application/x-www-form-urlencoded'
		if ($_SERVER['CONTENT_TYPE'] === 'application/x-www-form-urlencoded'){
			
			// 2. Get the email and password from the POST data
			$email = $_POST['email'] ?? '';
			$password = $_POST['password'] ?? '';

			// 3. Validate the email and password
			if(!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
				http_response_code(400);
				echo json_encode(['message' => 'Email ou Mot de passe invalide']);
				return;
			}

			// 4. Check if the email is already registered
			$users = $this->getAllUsers();
			if(array_key_exists($email, $users)) {
				http_response_code(409);
				echo json_encode(['message' => 'Email déjà enregistré']);
				return;
			}

			//5. Hash the password
			$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

			//6. Save the user data to the file
			$users[$email] = ['password' => $hashedPassword];
			file_put_contents($this->filePath, json_encode($users));

			//7. Return a success message
			http_response_code(201);
			echo json_encode(['message' => 'Utilisateur inscrit avec succes']);

		} else {
			http_response_code(415);
		}      
		// If any error occurs, return an error message with the appropriate HTTP status code
		// Make sure to set the Content-Type header to 'application/json' in the response
		// You can use the json_encode function to encode an array as JSON
		// You can use the http_response_code function to set the HTTP status code
	}

	public function handleLogin(): void
	{
		// Hints:
		// 1. Check if the request Content-Type is 'application/x-www-form-urlencoded'
		if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['CONTENT_TYPE'] === 'application/x-www-form-urlencoded'){
		// 2. Get the email and password from the POST data
			$email = $_POST['email'] ?? '';
			$password = $_POST['password'] ?? '';
		// 3. Validate the email and password
			if(!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
				http_response_code(400);
				echo json_encode(['message' => 'Email ou Mot de passe invalide']);
				return;
			}
		// 4. Check if the user exists and the password is correct
			$users = $this->getAllUsers();
			if(array_key_exists($email, $users) && password_verify($password, $users[$email]['password'])) {
				// 5. Store the user session
				$_SESSION['user'] = $email;
				// 6. Return a success message with HTTP status code 200
				http_response_code(200);
				echo json_encode(['message' => 'Connexion réussie']);
			} else {
				http_response_code(401);
				echo json_encode(['message' => 'Identifiants invalides']);
			}
		} else {
			http_response_code(415);
		}      
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
