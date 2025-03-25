<?php

class AuthController
{
		private $username;
		private $password;
		public $error;
		public $success;
		private $storage = "data/users.json";
		private $stored_users;
		

		public function __construct(){
		}



public function handleLoginRequest() {
    $username = $_POST['username'] ?? null;
    $password = $_POST['password'] ?? null;

    
    if($username && $password) {
        $this->stored_users = json_decode(file_get_contents($this->storage), true);		
        return $this->login();  // Gérer la connexion de l'utilisateur
    } else {
		echo"Please provide both username and password";
        return $this->error = "Please provide both username and password."; 
    }
}



	 private function login(){
		foreach ($this->stored_users as $user) {
		   if($user['username'] == $this->username){
			  if(password_verify($this->password, $user['password'])){
				 // You can set a session and redirect the user to his account.
				 echo"You are loged in";
				 return  $this->success = "You are loged in";
			  }
		   }
		}
		echo"Wrong username or password";
		return $this->error = "Wrong username or password";
	 }



public function handleRegister() {
    // Récupérer les données POST
    $username = $_POST['username'] ?? null;
    $password = $_POST['password'] ?? null;
    $role = $_POST['role'] ?? 'Cuisinier'; 

    // Vérification des champs
    if (!$username || !$password) {
        echo "Please provide both username and password";
        return $this->error = "Please provide both username and password.";
    }

    
    if (file_exists($this->storage)) {
        $this->stored_users = json_decode(file_get_contents($this->storage), true) ?? [];
    } else {
        $this->stored_users = []; 
    }

    foreach ($this->stored_users as $user) {
        if ($user['username'] === $username) {
            echo "Username already exists.";
            return $this->error = "Username already exists.";
        }
    }

    // Hashage du mot de passe
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $newUser = [
        'username' => $username,
        'password' => $hashedPassword,
        'role' => $role
    ];
    
    $this->stored_users[] = $newUser; 
    file_put_contents($this->storage, json_encode($this->stored_users, JSON_PRETTY_PRINT));

    echo "User registered successfully";
    return $this->success = "User registered successfully.";
}





	public function handleLogout(): void
	{
		session_destroy(); 
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
