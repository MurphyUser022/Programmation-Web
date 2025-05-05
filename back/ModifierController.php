<?php

class ModifierController {
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



    public function updateRecipe($params) {
        header('Content-Type: application/json');
    
        $recipeId = $params['recipe_id'] ?? null;
        if (!$recipeId) {
            http_response_code(400);
            echo json_encode(["error" => "ID de recette manquant"]);
            return;
        }
    
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['nameFR']) || !isset($data['stepsFR']) || !isset($data['ingredientsFR'])) {
            http_response_code(400);
            echo json_encode(["error" => "Champs requis manquants"]);
            return;
        }
    
        $recipes = $this->loadRecipes();
        $recipeTrouvee = false;
    
        foreach ($recipes as &$recipe) {
            if ($recipe['id'] == $recipeId) {
                $recipe['nameFR'] = $data['nameFR'];
                $recipe['imageURL'] = $data['imageURL'] ?? $recipe['imageURL'];
                $recipe['ingredientsFR'] = $data['ingredientsFR'];
                $recipe['stepsFR'] = $data['stepsFR'];
                $recipe['timers'] = $data['timers'] ?? array_fill(0, count($data['stepsFR']), 0); // par défaut 0        
                $recipe['Sans'] = $data['restrictions'];
                $recipeTrouvee = true;
    

    
                break;
            }
        }
    
        if (!$recipeTrouvee) {
            http_response_code(404);
            echo json_encode(["error" => "Recette non trouvée"]);
            return;
        }
    
        $this->saveRecipesT($recipes);
    
        echo json_encode(["message" => "Recette mise à jour avec succès"]);
    }
    
    
    

    public function testDeleteStepLocal($params) {
        header('Content-Type: application/json');
    
        $recipeId = $params['recipe_id'] ?? null;
        if (!$recipeId) {
            http_response_code(400);
            echo json_encode(["error" => "ID de recette manquant"]);
            return;
        }
    
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['remove']['type'], $data['remove']['index'])) {
            http_response_code(400);
            echo json_encode(["error" => "Paramètres de suppression manquants"]);
            return;
        }
    
        $type = $data['remove']['type'];
        $index = $data['remove']['index'];
    
        $recipes = $this->loadRecipes();
    
        foreach ($recipes as &$recipe) {
            if ($recipe['id'] == $recipeId) {
                $modified = false;
    
                // suppression côté FR
                switch ($type) {
                    case 'step':
                        if (isset($recipe['stepsFR'][$index])) {
                            unset($recipe['stepsFR'][$index]);
                            $recipe['stepsFR'] = array_values($recipe['stepsFR']);
                            $modified = true;
                        }
    
                        if (isset($recipe['timers'][$index])) {
                            unset($recipe['timers'][$index]);
                            $recipe['timers'] = array_values($recipe['timers']);
                        }
    
                        if (isset($recipe['traductions']['steps'][$index])) {
                            unset($recipe['traductions']['steps'][$index]);
                            $recipe['traductions']['steps'] = array_values($recipe['traductions']['steps']);
                        }
                        break;
    
                    case 'ingredient':
                        if (isset($recipe['ingredientsFR'][$index])) {
                            unset($recipe['ingredientsFR'][$index]);
                            $recipe['ingredientsFR'] = array_values($recipe['ingredientsFR']);
                            $modified = true;
                        }
    
                        if (isset($recipe['traductions']['ingredients'][$index])) {
                            unset($recipe['traductions']['ingredients'][$index]);
                            $recipe['traductions']['ingredients'] = array_values($recipe['traductions']['ingredients']);
                        }
                        break;
    
                    case 'restriction':
                        if (isset($recipe['Sans'][$index])) {
                            unset($recipe['Sans'][$index]);
                            $recipe['Sans'] = array_values($recipe['Sans']);
                            $modified = true;
                        }
    
                        if (isset($recipe['traductions']['Without'][$index])) {
                            unset($recipe['traductions']['Without'][$index]);
                            $recipe['traductions']['Without'] = array_values($recipe['traductions']['Without']);
                        }
                        break;
    
                    default:
                        http_response_code(400);
                        echo json_encode(["error" => "Type de suppression invalide"]);
                        return;
                }
    
                if ($modified) {
                    $this->saveRecipesT($recipes);
                    echo json_encode([
                        "message" => "Suppression réussie dans les deux versions",
                        "recette_modifiee" => $recipe
                    ]);
                    return;
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Aucune donnée supprimée"]);
                    return;
                }
            }
        }
    
        http_response_code(404);
        echo json_encode(["error" => "Recette non trouvée"]);
    }
    
    
    

    public function addToBothVersions($params) {
        header('Content-Type: application/json');
    
        $recipeId = $params['recipe_id'] ?? null;
        if (!$recipeId) {
            http_response_code(400);
            echo json_encode(["error" => "ID de recette manquant"]);
            return;
        }
    
        // Décoder les données JSON envoyées
        $data = json_decode(file_get_contents("php://input"), true);
    
        // Vérifier que les données ont bien été décodées et que 'add' existe
        if (!isset($data['add'])) {
            http_response_code(400);
            echo json_encode(["error" => "Données d'ajout manquantes"]);
            return;
        }
    
        $type = $data['add']['type'];
        error_log("Type reçu : " . $type); // Enregistre la valeur du type pour débogage
    
        // Vérification du type de l'ajout
        if (!in_array($type, ['step', 'ingredient', 'restriction'])) {
            http_response_code(400);
            echo json_encode(["error" => "Type d'ajout invalide"]);
            return;
        }
    
        $fr = $data['add']['fr'];
        $en = "En attente de traduction";  // Texte par défaut en anglais
        $timer = $data['add']['timer'] ?? null;
    
        $recipes = $this->loadRecipes();
    
        foreach ($recipes as &$recipe) {
            if ($recipe['id'] == $recipeId) {
                switch ($type) {
                    case 'step':
                        // Ajouter une étape
                        $recipe['stepsFR'][] = $fr;
                        $recipe['timers'][] = $timer ?? 0;
                        $recipe['traductions']['steps'][] = $en;
                        break;
    
                        case 'ingredient':
                            // Vérifier que les informations nécessaires sont présentes
                            if (isset($data['add']['quantity'], $data['add']['name'], $data['add']['ingredientType'])) {
                                $ingredient = [
                                    'quantity' => $data['add']['quantity'],
                                    'name' => $data['add']['name'],
                                    'type' => $data['add']['ingredientType']  // Changer ici pour 'ingredientType'
                                ];
                        
                                $recipe['ingredientsFR'][] = $ingredient;
                                $recipe['traductions']['ingredients'][] = [
                                    'quantity' => "En attente de traduction", /* $data['add']['quantity'], */
                                    'name' => "En attente de traduction",  // Nom en attente de traduction
                                    'type' => "En attente de traduction", /* $data['add']['ingredientType'] */  // Changer ici aussi
                                ];
                            } else {
                                http_response_code(400);
                                echo json_encode(["error" => "Informations sur l'ingrédient manquantes"]);
                                return;
                            }
                            break;
                        
    
                   
                   
                   
                        case 'restriction':
                        // Ajouter une restriction
                        $recipe['Sans'][] = $fr;
                        $recipe['traductions']['Without'][] = $en;
                        break;
    
                  
                  
                  
                        default:
                        http_response_code(400);
                        echo json_encode(["error" => "Type d'ajout invalide"]);
                        return;
                }
    
                // Sauvegarder les modifications dans le fichier
                $this->saveRecipesT($recipes);
    
                // Retourner une réponse avec la recette modifiée
                echo json_encode([
                    "message" => "Ajout effectué avec succès",
                    "recette_modifiee" => [
                        "stepsFR" => $recipe['stepsFR'] ?? null,
                        "ingredientsFR" => $recipe['ingredientsFR'] ?? null,
                        "Sans" => $recipe['Sans'] ?? null,
                        "traductions" => $recipe['traductions']
                    ]
                ]);
                return;
            }
        }
    
        // Si la recette n'est pas trouvée
        http_response_code(404);
        echo json_encode(["error" => "Recette non trouvée"]);
    }
    
    


    
    public function saveRecipesT($recipes) {
        $jsonData = json_encode($recipes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
        $result = file_put_contents($this->recipesFile, $jsonData);
    
        if ($result === false) {
            error_log("❌ Erreur lors de l'écriture dans le fichier JSON: " . $this->recipesFile);
        } else {
            error_log("✅ Fichier JSON mis à jour avec succès (" . $result . " octets)");
        }
    }
    





}

?>
