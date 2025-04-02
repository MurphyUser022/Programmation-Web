<?php

class Router{
    private array $routes = [];

	/**
	 * Register a new route
	 */
	public function register(string $method, string $path, callable $handler): void
	{
		        // Remplacer {param} par des groupes dans une expression régulière
        $pattern = preg_replace('/{(\w+)}/', '(?P<$1>[^/]+)', $path);
        $pattern = "#^" . $pattern . "$#"; // Encadrer par des délimiteurs de regex

		
	
		$this->routes[] = [
			'method' => strtoupper($method),
			'path' => $path,
            'pattern' => $pattern,
			'handler' => $handler,
		];
	}

	/**
	 * Handle the incoming request
	 */ 
	public function handleRequest(): void
	{
		// Get the HTTP method and path of the request
		$method = $_SERVER['REQUEST_METHOD'];
		$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
	
		// Extraire les paramètres de la query string si la méthode est GET
		$queryParams = [];
		if ($method === 'GET' && strpos($_SERVER['REQUEST_URI'], '?') !== false) {
			$queryString = parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY);
			parse_str($queryString, $queryParams);
		}
	

		echo "URL : " . $path . "<br>";
		// Set the CORS headers
		header("Access-Control-Allow-Origin: *");
		header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
		header("Access-Control-Allow-Headers: Content-Type, Authorization");
	
		foreach ($this->routes as $route) {
			if ($route['method'] === $method && preg_match($route['pattern'], $path, $matches)) {
				// Si une route correspond, extraire les paramètres nommés de l'URL
	
				
				$params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);


				// Débogage pour vérifier les paramètres de la query string et des URL
				//var_dump($params);
				//var_dump($queryParams);

				// Appel du handler avec les deux sets de paramètres
				call_user_func_array($route['handler'], [$params, $queryParams]);
	
				return;
			}
		}
	
		// Si aucune route n'est trouvée, retourne un code 404
		http_response_code(404);
		echo json_encode(['error' => 'Route not found']);
	}
	
}
