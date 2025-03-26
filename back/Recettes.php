<?php 

class Recettes 
{   
private $recipeFile = "data/recipes.json";
    
public function AjouterRecette() {
    $username = $_POST['username'] ?? null;
    $password = $_POST['password'] ?? null;
    $role = $_POST['role'] ?? 'Cuisinier'; 

    $recipes = file_exists($recipeFile) ? json_decode(file_get_contents($recipeFile), true) : [];


    $newRecipe = [
        "name" => $data['name'],
        "nameFR" => $data['nameFR'] ?? "",
        "Author" => $data['username'],
        "Without" => $data['without'] ?? [],
        "ingredients" => $data['ingredients'],
        "timers" => $data['timers'] ?? [],
        "imageURL" => $data['imageURL'] ?? "",
        "originalURL" => $data['originalURL'] ?? ""
    ];

}




}
