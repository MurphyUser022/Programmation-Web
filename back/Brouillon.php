<?php

class TpController
{
	private string $filePath;

	public function __construct(string $filePath)
	{
		$this->filePath = $filePath;
	}

	// TODO: Implement the handleRegister method
	public function HomeRequest(): void
	{


    $filePath = __DIR__ . '/../front/code.html'; // Ajuste selon la structure réelle

    if (file_exists($filePath)) {
        include $filePath;
    } else {
        echo "Erreur : Fichier introuvable ($filePath)";
    }

}


public function PageRegisterRequest():void
{

    $filePath = __DIR__ . '/../front/test.html'; // Ajuste selon la structure réelle

    if (file_exists($filePath)) {
        include $filePath;
    } else {
        echo "Erreur : Fichier introuvable ($filePath)";
    }
}



	// TODO: Implement the handleRegister method
	public function RegisterRequest(): void
	{


// Récupération des données JSON envoyées via la requête POST
$inputData = json_decode(file_get_contents('php://input'), true);

// Vérifier que les données sont bien reçues
if (isset($inputData['first_name'], $inputData['last_name'], $inputData['password'], $inputData['job'])) {
    // Traiter les données (ex : les sauvegarder dans une base de données)
    
    $firstName = $inputData['first_name'];
    $lastName = $inputData['last_name'];
    $password = $inputData['password'];
    $job = $inputData['job'];

}


setcookie('pseudo', $firstName, time() + 60 , "","", false, true);
setcookie('lastName',$lastName, time() + 60 );
setcookie('pwd',$password, time() + 60 );
setcookie('job',$job, time() + 60 );
echo $_COOKIE['age'];
echo",";
echo $_COOKIE['pseudo'];
echo",";
echo $_COOKIE['ville'];
echo",";
echo"<p>";
//echo"<a href="page.php" data-wpel-link="internal" target="_self" rel="follow noopener noreferrer">Aller vers la page</a>";
echo"</p>";

//$myVariable = $firstName;


    if (file_exists($filePath)) {
        include $filePath;
    } else {
        echo "Erreur : Fichier introuvable ($filePath)";
    }

}



}
