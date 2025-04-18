<?php

class RoleController {
    private $usersFile;

    public function __construct($usersFile) {
        $this->usersFile = $usersFile;
    }

    private function loadUsers() {
        if (!file_exists($this->usersFile)) {
            return [];
        }
        return json_decode(file_get_contents($this->usersFile), true) ?? [];
    }


    private function saveUsers($users) {
        file_put_contents($this->usersFile, json_encode($users, JSON_PRETTY_PRINT));
    }

    public function handleRoleRequest() {
        if (!isset($_COOKIE['user_id'])) {
            http_response_code(403);
            echo json_encode(["error" => "Utilisateur non authentifié"]);
            return;
        }

        $userId = $_COOKIE['user_id'];
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['role'])) {
            http_response_code(400);
            echo json_encode(["error" => "Données invalides"]);
            return;
        }

        $users = $this->loadUsers();
        foreach ($users as &$user) {
            if ($user['id'] == $userId) {
                if (in_array($data['role'], $user['role_demande'])) {
                    http_response_code(409);
                    echo json_encode(["error" => "Demande déjà en attente"]);
                    return;
                }
                $user['role_demande'][] = $data['role'];
                $this->saveUsers($users);

                http_response_code(201);
                echo json_encode(["message" => "Demande de rôle soumise"]);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(["error" => "Utilisateur non trouvé"]);
    }

    public function approveRole($params) {
        $userId = is_array($params) ? $params['id'] : $params;
    
        $data = json_decode(file_get_contents("php://input"), true);
        $role = $data['role'] ?? null;
    
        if (!$role) {
            http_response_code(400);
            echo json_encode(["error" => "Aucun rôle fourni"]);
            return;
        }
    
        $users = $this->loadUsers();
    
        foreach ($users as &$user) {
            if ($user['id'] == $userId) {
                if (!isset($user['role']) || !is_array($user['role'])) {
                    $user['role'] = is_string($user['role']) ? [$user['role']] : [];
                }
                if (!isset($user['role_demande']) || !is_array($user['role_demande'])) {
                    $user['role_demande'] = [];
                }
    
                if (in_array($role, $user['role_demande'])) {
                    if (!in_array($role, $user['role'])) {
                        $user['role'][] = $role;
                    }
    
                    $user['role_demande'] = array_values(array_filter(
                        $user['role_demande'],
                        fn($r) => $r !== $role
                    ));
    
                    $this->saveUsers($users);
    
                    http_response_code(200);
                    echo json_encode(["message" => "Rôle '$role' approuvé"]);
                    return;
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Ce rôle n'est pas demandé"]);
                    return;
                }
            }
        }
    
        http_response_code(404);
        echo json_encode(["error" => "Utilisateur non trouvé"]);
    }
    
    
    
    public function rejectRole($params) {
        $userId = is_array($params) ? $params['id'] : $params;
    
        $data = json_decode(file_get_contents("php://input"), true);
        $roleToReject = $data['role'] ?? null;
    
        if (!$roleToReject) {
            http_response_code(400);
            echo json_encode(["error" => "Aucun rôle fourni"]);
            return;
        }
    
        $users = $this->loadUsers();
        foreach ($users as &$user) {
            if ($user['id'] == $userId) {
                if (!in_array($roleToReject, $user['role_demande'])) {
                    http_response_code(404);
                    echo json_encode(["error" => "Demande de rôle non trouvée"]);
                    return;
                }
    
                $user['role_demande'] = array_values(array_filter(
                    $user['role_demande'],
                    fn($r) => $r !== $roleToReject
                ));
                $this->saveUsers($users);
    
                http_response_code(200);
                echo json_encode(["message" => "Rôle refusé"]);
                return;
            }
        }
    
        http_response_code(404);
        echo json_encode(["error" => "Utilisateur non trouvé"]);
    }
    
}
?>
