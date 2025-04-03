<?php

class RoleController {
    private $usersFile;
    private $authController;

    public function __construct($usersFile, $authController) {
        $this->usersFile = $usersFile;
        $this->authController = $authController;
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
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['user_id']) || !isset($data['roles'])) {
            http_response_code(400);
            echo json_encode(["error" => "Données invalides"]);
            return;
        }

        $users = $this->loadUsers();
        $userId = $data['user_id'];
        $role = $data['roles'];

        foreach ($users as &$user) {
            if ($user['id'] == $userId) {
                if (isset($user['role_demande']) && in_array($role, $user['role_demande'])) {
                    http_response_code(409);
                    echo json_encode(["error" => "Demande déjà en attente"]);
                    return;
                }
                $user['role_demande'][] = $role;
                $this->saveUsers($users);

                http_response_code(201);
                echo json_encode(["message" => "Demande de rôle soumise"]);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(["error" => "Utilisateur non trouvé"]);
    }

    public function approveRole($userId) {
        $users = $this->loadUsers();
        foreach ($users as &$user) {
            if ($user['id'] == $userId) {
                if (!isset($user['role_demande']) || empty($user['role_demande'])) {
                    http_response_code(404);
                    echo json_encode(["error" => "Aucune demande de rôle en attente"]);
                    return;
                }
                foreach ($user['role_demande'] as $role) {
                    $user['roles'][] = $role;
                }
                $user['role_demande'] = [];
                $this->saveUsers($users);

                http_response_code(200);
                echo json_encode(["message" => "Rôle(s) approuvé(s)"]);
                return;
            }
        }
        http_response_code(404);
        echo json_encode(["error" => "Utilisateur non trouvé"]);
    }

    
    public function assignRole($userId) {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['role'])) {
            http_response_code(400);
            echo json_encode(["error" => "Données invalides"]);
            return;
        }

        $users = $this->loadUsers();
        $role = $data['roles'];

        foreach ($users as &$user) {
            if ($user['id'] == $userId) {
                if (isset($user['roles']) && in_array($role, $user['roles'])) {
                    http_response_code(409);
                    echo json_encode(["error" => "Utilisateur a déjà ce rôle"]);
                    return;
                }
                $user['roles'][] = $role;
                $this->saveUsers($users);

                http_response_code(201);
                echo json_encode(["message" => "Rôle attribué"]);
                return;
            }
        }
        http_response_code(404);
        echo json_encode(["error" => "Utilisateur non trouvé"]);
    }
}
?>
