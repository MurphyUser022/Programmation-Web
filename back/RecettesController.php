<?php 

class RecettesController 
{   
    private $recipeFile = "data/recipes.json";
    private $stored_recipes;

    public function __construct(){
    }


    public function AjouteRecette() {
        $recipes = file_exists($this->recipeFile) ? json_decode(file_get_contents($this->recipeFile), true) : [];
    
        $data = json_decode(file_get_contents("php://input"), true);
    
        if (!$data || !isset($data['nameFR']) || !isset($data['ingredientsFR']) || !is_array($data['ingredientsFR'])) {
            http_response_code(400);
            echo json_encode(["error" => "Champs requis manquants ou invalides"]);
            return;
        }
    
        if (!isset($_COOKIE['pseudo'])) {
            http_response_code(401);
            echo json_encode(["error" => "Utilisateur non authentifié"]);
            return;
        }
    
        if (isset($data['imageURL']) && !filter_var($data['imageURL'], FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode(["error" => "URL d'image invalide"]);
            return;
        }
    
        // Trouver le plus grand ID numérique existant
        $maxId = 0;
        foreach ($recipes as $r) {
            if (isset($r['id']) && is_numeric($r['id'])) {
                $maxId = max($maxId, (int)$r['id']);
            }
        }
    
        $newId = $maxId + 1;
    
        $newRecipe = [
            "id" => $newId,
            "nameFR" => $data['nameFR'],
            "Author" => $_COOKIE['pseudo'],
            "Sans" => $data['Sans'] ?? [],
            "ingredientsFR" => $data['ingredientsFR'],
            "stepsFR" => $data['stepsFR'] ?? [],
            "timers" => $data['timers'] ?? [],
            "imageURL" => $data['imageURL'] ?? "",
            "statut" => "en_attente"
        ];
    
        $recipes[] = $newRecipe;
        file_put_contents($this->recipeFile, json_encode($recipes, JSON_PRETTY_PRINT));
    
        http_response_code(201);
        echo json_encode([
            "success" => "Recette ajoutée avec succès",
            "id" => $newId
        ]);
    }



    public function ConsultRecipe()
    {

        // load le JSON
        $recipes = json_decode(file_get_contents($this->recipeFile), true);
        echo json_encode($recipes);
        http_response_code(200);
        return;
    }


    public function searchRecipes(array $queryParams): void
    {
        // Vérifie si le paramètre 'search' est dans la query string
        if (isset($queryParams['search'])) {
            $searchTerm = $queryParams['search'];

            //search les recettes depuis le  JSON
            $recipes = json_decode(file_get_contents($this->recipeFile), true);

            // Sort les recettes
            $filteredRecipes = array_filter($recipes, function($recipe) use ($searchTerm) {
                return stripos($recipe['name'], $searchTerm) !== false; // Recherche insensible à la casse
            });


            // Renvoie des recettes filtré
            http_response_code(200);
            echo json_encode(array_values($filteredRecipes)); // Réindexe les résultats
            return;
        }

        // Si aucun paramètre 'search' n'est fourni on retourne toutes les recettes
        $recipes = json_decode(file_get_contents($this->recipeFile), true);
        http_response_code(200);
        echo json_encode($recipes);
    }



    public function DeleteRecipeByID(array $params): void
    {
        $id = $params['recipe_id']; // Récupère l'ID de la recette depuis les paramètres de l'URL

        // Vérifie si le fichier de recettes existe
        if (!file_exists($this->recipeFile)) {
            http_response_code(404);
            echo json_encode(["error" => "No recipes found"]);
            return;
        }
    
        // load des recettes
        $recipes = json_decode(file_get_contents($this->recipeFile), true);
    
        // Cherche l'index de la recette à supprimer
        foreach ($recipes as $index => $recipe) {
            if ($recipe['id'] === $id) {
                // Supprime la recette du tableau
                array_splice($recipes, $index, 1);
    
                // Sauvegarde les recettes mises à jour dans le fichier JSON
                file_put_contents($this->recipeFile, json_encode($recipes, JSON_PRETTY_PRINT));
    
                http_response_code(200);
                echo json_encode(["success" => "Recipe deleted successfully"]);
                return;
            }
        }
    
        // Si aucune recette n'est trouvée
        http_response_code(404);
        echo json_encode(["error" => "Recipe not found"]);
    }
    



    



    
    public function getRecetteById(array $params): void {
        $id = $params['id'] ?? null;
        $lang = $_GET['lang'] ?? 'fr';
    
        $recipes = json_decode(file_get_contents($this->recipeFile), true) ?? [];
    
        foreach ($recipes as $recipe) {
            if ((string)$recipe['id'] === (string)$id) {
                if ($lang === 'en' && isset($recipe['traductions'])) {
                    echo json_encode($recipe['traductions']);
                    return;
                }
                echo json_encode($recipe);
                return;
            }
        }
    
        http_response_code(404);
        echo json_encode(["error" => "Recette introuvable"]);
    }    
    
    public function validerRecette($params) {
        $recipeId = is_array($params) ? ($params['id'] ?? $params['recipe_id'] ?? null) : $params;
    
        if (!$recipeId) {
            http_response_code(400);
            echo json_encode(["error" => "ID de recette manquant"]);
            return;
        }
    
        $recipes = json_decode(file_get_contents($this->recipeFile), true);
        foreach ($recipes as &$recipe) {
            if ((string)$recipe['id'] === (string)$recipeId) {
                $recipe['statut'] = 'validé';
                file_put_contents($this->recipeFile, json_encode($recipes, JSON_PRETTY_PRINT));
                http_response_code(200);
                echo json_encode(["message" => "Recette validée"]);
                return;
            }
        }
    
        http_response_code(404);
        echo json_encode(["error" => "Recette introuvable"]);
    }
    
    public function rejeterRecette($params) {
        $recipeId = is_array($params) ? ($params['id'] ?? $params['recipe_id'] ?? null) : $params;
    
        if (!$recipeId) {
            http_response_code(400);
            echo json_encode(["error" => "ID de recette manquant"]);
            return;
        }
    
        $recipes = json_decode(file_get_contents($this->recipeFile), true);
        foreach ($recipes as $index => $recipe) {
            if ((string)$recipe['id'] === (string)$recipeId) {
                array_splice($recipes, $index, 1);
                file_put_contents($this->recipeFile, json_encode($recipes, JSON_PRETTY_PRINT));
                http_response_code(200);
                echo json_encode(["message" => "Recette refusée et supprimée"]);
                return;
            }
        }
    
        http_response_code(404);
        echo json_encode(["error" => "Recette introuvable"]);
    }
    


    public function RecipeByID2(array $params): void
    {
        $id = (int)$params['recipe_id']; // On cast ici
    
        if (!file_exists($this->recipeFile)) {
            http_response_code(404); // petit correctif : 4004 n’existe pas 😉
            echo json_encode(["error" => "Fichier de recettes introuvable"]);
            return;
        }
    
        $recipes = json_decode(file_get_contents($this->recipeFile), true);
    
        foreach ($recipes as $recipe) {
            if ($recipe['id'] === $id) {
                http_response_code(200);
                echo json_encode($recipe);
                return;
            }
        }
    
        http_response_code(404);
        echo json_encode(["error" => "Recette non trouvée"]);
    }
    


    public function searchRecipesBy(): void {
        $data = json_decode(file_get_contents("php://input"), true);
        $mot = strtolower($data['mot_rechercher'] ?? '');
    
        if (empty($mot)) {
            http_response_code(400);
            echo json_encode(["error" => "Aucun mot-clé fourni."]);
            return;
        }
    
        $recettes = json_decode(file_get_contents($this->recipeFile), true);
        $resultats = [];
    
        foreach ($recettes as $recette) {
            $ingredientsFR = array_column($recette['ingredientsFR'] ?? [], 'name');
            $ingredientsEN = array_column($recette['traductions']['ingredients'] ?? [], 'name');
    
            $textes = array_merge(
                [$recette['nameFR'] ?? '', $recette['traductions']['name'] ?? ''],
                $ingredientsFR,
                $ingredientsEN,
                $recette['stepsFR'] ?? [],
                $recette['traductions']['steps'] ?? [],
                $recette['Sans'] ?? [],
                $recette['traductions']['Without'] ?? []
            );
    
            foreach ($textes as $texte) {
                if (is_string($texte) && stripos($texte, $mot) !== false) {
                    $resultats[] = $recette;
                    break;
                }
            }
        }
    
        http_response_code(200);
        echo json_encode($resultats, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
    
    


    
}

