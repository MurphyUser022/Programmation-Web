<?php

class LikeController {
	private $recipesFile;

	public function __construct($recipesFile) {
		$this->recipesFile = $recipesFile;
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

	public function addLike($params) {
        var_dump($params);
		$recipeId = $params['recipe_id'] ?? null;
		if (!$recipeId) {
			http_response_code(400);
			echo json_encode(["error" => "ID de recette manquant"]);
			return;
		}

		if (!isset($_COOKIE['user_id'])) {
			http_response_code(403);
			echo json_encode(["error" => "Utilisateur non authentifié"]);
			return;
		}

		$userId = $_COOKIE['user_id'];
		$recipes = $this->loadRecipes();

		foreach ($recipes as &$recipe) {
			if ($recipe['id'] == $recipeId) {
				if (!isset($recipe['likes']) || !is_array($recipe['likes'])) {
					$recipe['likes'] = [];
				}
				if (!in_array($userId, $recipe['likes'])) {
					$recipe['likes'][] = $userId;
					$this->saveRecipes($recipes);
					http_response_code(200);
					echo json_encode(["message" => "Like ajouté"]);
				} else {
					http_response_code(409);
					echo json_encode(["error" => "Vous avez déjà aimé cette recette"]);
				}
				return;
			}
		}

		http_response_code(404);
		echo json_encode(["error" => "Recette non trouvée"]);
	}

	public function removeLike($params) {
		$recipeId = $params['recipe_id'] ?? null;
		if (!$recipeId) {
			http_response_code(400);
			echo json_encode(["error" => "ID de recette manquant"]);
			return;
		}

		if (!isset($_COOKIE['user_id'])) {
			http_response_code(403);
			echo json_encode(["error" => "Utilisateur non authentifié"]);
			return;
		}

		$userId = $_COOKIE['user_id'];
		$recipes = $this->loadRecipes();

		foreach ($recipes as &$recipe) {
			if ($recipe['id'] == $recipeId) {
				if (!isset($recipe['likes']) || !is_array($recipe['likes'])) {
					$recipe['likes'] = [];
				}

				if (($key = array_search($userId, $recipe['likes'])) !== false) {
					unset($recipe['likes'][$key]);
					$recipe['likes'] = array_values($recipe['likes']);
					$this->saveRecipes($recipes);
					http_response_code(200);
					echo json_encode(["message" => "Like retiré"]);
				} else {
					http_response_code(409);
					echo json_encode(["error" => "Vous n'avez pas aimé cette recette"]);
				}
				return;
			}
		}

		http_response_code(404);
		echo json_encode(["error" => "Recette non trouvée"]);
	}

	public function countLikes($params) {
		$recipeId = $params['recipe_id'] ?? null;
		if (!$recipeId) {
			http_response_code(400);
			echo json_encode(["error" => "ID de recette manquant"]);
			return;
		}

		$recipes = $this->loadRecipes();

		foreach ($recipes as $recipe) {
			if ($recipe['id'] == $recipeId) {
				$likes = isset($recipe['likes']) && is_array($recipe['likes']) ? count($recipe['likes']) : 0;
				http_response_code(200);
				echo json_encode(["recipe_id" => $recipeId, "likes" => $likes]);
				return;
			}
		}

		http_response_code(404);
		echo json_encode(["error" => "Recette non trouvée"]);
	}
}
