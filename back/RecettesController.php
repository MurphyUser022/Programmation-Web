<?php 

class RecettesController 
{   
    private $recipeFile = "data/recipes.json";
    private $stored_recipes;

    public function __construct(){
    }



    public function testCokiee()
    {
           echo'voici le pseudo actu en dans les cookies '.$_COOKIE['pseudo'];
    }

    public function AjouteRecette() {
        // Utilisation de $this->recipeFile au lieu de $recipeFile
        $recipes = file_exists($this->recipeFile) ? json_decode(file_get_contents($this->recipeFile), true) : [];

        // Recup des data
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['name']) || !isset($data['ingredients'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            return;
        }

        if (!isset($_COOKIE['pseudo']))
        {
            echo";)  je viens de del le cokiee c'est un test Sophie , pas de username dans les cookies";
        }
        else
        {
            $recipeId = str_replace('.', '_', uniqid("rec_", true));


        $newRecipe = [
            "id" => $recipeId,
            "name" => $data['name'],
            "nameFR" => $data['nameFR'] ?? "",
            "Author" => $_COOKIE['pseudo'],
            "Without" => $data['without'] ?? [],
            "ingredients" => $data['ingredients'],
            "timers" => $data['timers'] ?? [],
            "imageURL" => $data['imageURL'] ?? "",
            "originalURL" => $data['originalURL'] ?? ""
        ];

        $recipes[] = $newRecipe;

        // Save du ficier JSON
        file_put_contents($this->recipeFile, json_encode($recipes, JSON_PRETTY_PRINT));

        http_response_code(201);
        echo json_encode(["success" => "Recipe added successfully  with id ".$recipeId]);
        }

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
    



    



    
    public function RecipeByID(array $params): void
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
    
}
