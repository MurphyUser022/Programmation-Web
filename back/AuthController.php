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
    $this->username = $_POST['username'] ?? null;
    $this->password = $_POST['password'] ?? null;

        if ($this->username && $this->password) {
        $this->stored_users = json_decode(file_get_contents($this->storage), true);
        return $this->login();  
    } else {
        echo "Please provide both username and password";
        return $this->error = "Please provide both username and password."; 
    }
}


	 private function login(){
		foreach ($this->stored_users as $user) {
		   if($user['username'] == $this->username){ 
			  if(password_verify($this->password, $user['password'])){
                 setcookie('pseudo', $this->username, time() + 900 , "/","", false, true); // ici le '/' c'est Pour que le cookie soit accessible depuis n'importe quel chemin
                 setcookie('user_id', $user['id'], time() + 900, "/", "", false, false);
                 setcookie(
                    'role',
                    is_array($user['role']) ? implode(',', $user['role']) : $user['role'],
                    time() + 900,
                    "/", "", false, false  // ⬅️ pas HttpOnly ici
                  );                          
				// echo"Welcome username -->".$this->username." avec pour role --->".$user['role'];
                echo json_encode(["success" => true, "message" => "You are logged in"]);
                exit();
			  }
		   }
		}
        echo json_encode(["success" => false, "message" => "Wrong username or password"]);
        exit();
	 }



public function handleRegister() {
    $username = $_POST['username'] ?? null;
    $password = $_POST['password'] ?? null;
    $role = 'Cuisinier'; 

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
    $userId = str_replace('.', '_', uniqid("rec_", true));
    $newUser = [
        "id" => $userId,
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
        setcookie('pseudo', '', time() - 30);
        setcookie('role', '', time() - 30);
		echo json_encode(['message' => 'Logged out successfully']);
	}

	public function validateAuth(): ?string
	{
		return $_SESSION['user'] ?? null;
	}

	public function getAllUsers() {
        header('Content-Type: application/json');
    
        if (!file_exists($this->storage)) {
            http_response_code(404);
            echo json_encode(["error" => "Fichier users.json non trouvé"]);
            return;
        }
    
        $users = json_decode(file_get_contents($this->storage), true) ?? [];
    
        $usersSansPassword = array_map(function ($user) {
            unset($user['password']);
            return $user;
        }, $users);
    
        echo json_encode($usersSansPassword);
    }

    
    public function getCurrentUserRoles() {
        header("Content-Type: application/json");
    
        if (!isset($_COOKIE['user_id'])) {
            http_response_code(403);
            echo json_encode(["error" => "Utilisateur non authentifié"]);
            return;
        }
    
        $userId = $_COOKIE['user_id'];
    
        if (!file_exists($this->storage)) {
            http_response_code(500);
            echo json_encode(["error" => "Fichier utilisateur introuvable"]);
            return;
        }
    
        $users = json_decode(file_get_contents($this->storage), true);
    
        foreach ($users as $user) {
            if ($user['id'] == $userId) {
                echo json_encode([
                    "username" => $user['username'],
                    "roles" => $user['role'] ?? [],
                    "role_demande" => $user['role_demande'] ?? []
                ]);
                return;
            }
        }
    
        http_response_code(404);
        echo json_encode(["error" => "Utilisateur non trouvé"]);
    }
    
    
}