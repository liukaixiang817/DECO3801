<?php

require_once __DIR__ . '/../models/User.php';

class UserController {
    private $userModel;

    public function __construct($db) {
        $this->userModel = new User($db);
    }

    public function register($data) {
        return json_encode($this->userModel->registerUser($data));
    }

    public function submitOOBE($data) {
        try {
            if (empty($data['username'])) {
                throw new Exception('Username is missing in the OOBE data submission.');
            }

            $result = $this->userModel->submitOOBEData($data);
            if ($result) {
                return json_encode(['success' => true, 'message' => 'OOBE data submitted']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            error_log("OOBE submission error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit();
        }
    }

    public function login($data) {
        $user = $this->userModel->findUserByUsername($data['username']);
        if ($user && password_verify($data['password'], $user['password'])) {
            return json_encode(['success' => true, 'message' => 'Login successful']);
        } else {
            http_response_code(401);
            return json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    }

    public function getHomeData($username) {
        $user = $this->userModel->findUserByUsername($username);
        if ($user) {
            // 获取或初始化 weeklyLimitUsed
            $weeklyLimitUsed = $this->userModel->getOrInitializeWeeklyLimitUsed($username);

            $data = [
                'username' => $user['username'],
                'daysUnderControl' => $user['daysUnderControl'] ?? 0,
                'weeklyLimitUsed' => $weeklyLimitUsed,
                'weeklyLimit' => $user['weeklyLimit'] ?? 750, // 如果没有设置，默认值为750ml
            ];
            return json_encode($data);
        } else {
            http_response_code(404);
            return json_encode(['message' => 'User not found']);
        }
    }

    public function recordDrink($username, $amount) {
        try {
            $user = $this->userModel->findUserByUsername($username);
            if ($user) {
                $newWeeklyLimitUsed = $user['weeklyLimitUsed'] + $amount;

                // 更新用户的 weeklyLimitUsed
                $this->userModel->updateWeeklyLimitUsed($username, $newWeeklyLimitUsed);

                return json_encode([
                    'success' => true,
                    'weeklyLimitUsed' => $newWeeklyLimitUsed,
                    'message' => 'Drink recorded successfully'
                ]);
            } else {
                http_response_code(404);
                return json_encode(['success' => false, 'message' => 'User not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['success' => false, 'message' => 'Error recording drink: ' . $e->getMessage()]);
        }
    }
}
