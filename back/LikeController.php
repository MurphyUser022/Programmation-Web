<?php

class LikeController {
    private $recipesFile;
    private $likeFile;

    public function __construct($recipesFile, $likeFile) {
        $this->recipesFile = $recipesFile;
        $this->likeFile = $likeFile;
    }
    
    private function loadLikes() {
        if (!file_exists($this->likeFile)) return [];
        return json_decode(file_get_contents($this->likeFile), true) ?? [];
    }

    private function saveLikes($likes) {
        file_put_contents($this->likeFile, json_encode($likes, JSON_PRETTY_PRINT));
    }
	
	private function loadRecipes() {
		if (!file_exists($this->recipesFile)) {
			return []; // Si le fichier n'existe pas encore, renvoie un tableau vide
		}
		$recipes = json_decode(file_get_contents($this->recipesFile), true) ?? [];
	
		// Assure-toi que chaque recette a un champ 'likes'
		foreach ($recipes as &$recipe) {
			if (!isset($recipe['likes'])) {
				$recipe['likes'] = []; // Si le champ 'likes' n'existe pas, on l'initialise comme tableau vide
			}
		}
	
		return $recipes;
	}
	
	private function saveRecipes($recipes) {
		file_put_contents($this->recipesFile, json_encode($recipes, JSON_PRETTY_PRINT)); // Sauvegarde les recettes avec les likes
	}


	public function toggleLike($params) {
		$recipeId = $params['recipe_id'] ?? null;
		$userId = $_COOKIE['user_id'] ?? null;
	
		if (!$recipeId || !$userId) {
			http_response_code(400);
			echo json_encode(["error" => "ID manquant ou utilisateur non connecté"]);
			return;
		}
	
		$recipes = $this->loadRecipes();
		$likes = $this->loadLikes();
	
		// Recherche de la recette
		foreach ($recipes as &$recipe) {
			if ($recipe['id'] == $recipeId) {
	
				// Vérifie si le like existe
				$liked = false;
				foreach ($likes as $i => $like) {
					if ($like['recipe_id'] == $recipeId && $like['user_id'] == $userId) {
						unset($likes[$i]); // supprime le like
						$recipe['likes'] = max(0, $recipe['likes'] - 1);
						$liked = true;
						break;
					}
				}
	
				// Si pas déjà liké → on ajoute
				if (!$liked) {
					$likes[] = ['recipe_id' => $recipeId, 'user_id' => $userId];
					$recipe['likes'] = ($recipe['likes'] ?? 0) + 1;
				}
	
				$this->saveLikes(array_values($likes)); // propre
				$this->saveRecipes($recipes);
	
				echo json_encode([
					"message" => $liked ? "Like retiré" : "Like ajouté",
					"likes" => $recipe['likes']
				]);
				return;
			}
		}
	
		http_response_code(404);
		echo json_encode(["error" => "Recette non trouvée"]);
	}
	
	
	
	
	
}
