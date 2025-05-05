<?php

class TraductionController{
    private $recipesFile;
    private $usersFile;

    public function __construct($recipesFile, $usersFile) {
        $this->recipesFile = $recipesFile;
        $this->usersFile = $usersFile;
    }

    private function loadRecipes() {
		if (!file_exists($this->recipesFile)) {
            return [];
        }
        return json_decode(file_get_contents($this->recipesFile), true) ?? [];
	}

    private function saveRecipes($recipes) {
        file_put_contents($this->recipesFile, json_encode($recipes, JSON_PRETTY_PRINT));
    }

    private function getUserRole($userId) {
        $users = json_decode(file_get_contents($this->usersFile), true);
        foreach ($users as $user) {
            if ($user['id'] == $userId) {
                return $user['roles'] ?? [];
            }
        }
        return [];
    }

    public function addTraduction($params) {
        header('Content-Type: application/json'); // ✅ Toujours le mettre

        $recipeId = $params['id'] ?? null;
    
        if (!$recipeId) {
            http_response_code(400);
            echo json_encode(["error" => "ID de recette manquant"]);
            return;
        }
    
        // Vérifie que l'utilisateur est bien connecté
        if (!isset($_COOKIE['user_id'])) {
            http_response_code(403);
            echo json_encode(["error" => "Utilisateur non authentifié"]);
            return;
        }
    
        $userId = $_COOKIE['user_id'];
    
        // Décoder la chaîne des rôles et la transformer en tableau
        $roles = isset($_COOKIE['role']) ? explode(',', urldecode($_COOKIE['role'])) : [];
    
        // 🔍 Debug pour vérifier les rôles
        error_log("DEBUG RÔLES: " . json_encode($roles)); // ✅ Pour vérifier côté serveur
    
        // Mettre tous les rôles en minuscules
        $roles = array_map('strtolower', $roles);
    
        // ✅ Vérifie la présence des rôles exigés
        if (!array_intersect(['traducteur', 'admin'], $roles)) {
            http_response_code(403);
            echo json_encode(["error" => "Accès refusé, rôle traducteur requis"]);
            return;
        }

        

		$data = json_decode(file_get_contents("php://input"), true);
		if (!isset($data['name'], $data['ingredients'], $data['steps'], $data['Without'])) {
			http_response_code(400);
			echo json_encode(["error" => "Données de traduction incomplètes"]);
			return;
		}

		$recipes = $this->loadRecipes();
		foreach ($recipes as &$recipe) {
			if ($recipe['id'] == $recipeId) {
                $existing = $recipe['traductions'] ?? [];

                $recipe['traductions'] = array_merge($existing, array_filter([
                  "name" => $data['name'],
                  "ingredients" => $data['ingredients'],
                  "steps" => $data['steps'],    
                  "Without" => $data['Without']
                ], fn($v) => $v !== null));

                
				$this->saveRecipes($recipes);
				http_response_code(200);
				echo json_encode(["message" => "Traduction ajoutée"]);
				return;
			}
		}

		http_response_code(404);
		echo json_encode(["error" => "Recette non trouvée"]);
    }

    public function getRecettesTraduits($params) {
        
        $recipeId = $params['id'] ?? null;
        $lang = $params['lang'] ?? null;
    
        if (!$recipeId || !$lang) {
            http_response_code(400);
            echo json_encode(["error" => "Paramètres manquants"]);
            return;
        }
    
        $recipes = $this->loadRecipes();
    
        foreach ($recipes as $recipe) {
            if ($recipe['id'] == $recipeId) {
                if ($lang === 'fr') {
                    echo json_encode([
                        "name" => $recipe['nameFR'] ?? $recipe['name'],
                        "ingredients" => $recipe['ingredientsFR'] ?? $recipe['ingredients'],
                        "steps" => $recipe['stepsFR'] ?? $recipe['steps'],
                        "Without" => $recipe['Without']
                    ]);
                } elseif ($lang === 'en' && isset($recipe['traductions'])) {
                    echo json_encode($recipe['traductions']);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Traduction non disponible pour cette langue"]);
                }
                return;
            }
        }
    
        http_response_code(404);
        echo json_encode(["error" => "Recette non trouvée"]);
    }    
}