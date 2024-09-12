<?php

require_once __DIR__ . '/../models/User.php';

class UserController {
    private $userModel;

    public function __construct($db) {
        $this->userModel = new User($db);
    }

    // 注册用户
    public function register($data) {
        return json_encode($this->userModel->registerUser($data));
    }

    // 提交 OOBE 数据
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
            return json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // 用户登录
    public function login($data) {
        $user = $this->userModel->findUserByUsername($data['username']);
        if ($user && password_verify($data['password'], $user['password'])) {
            return json_encode(['success' => true, 'message' => 'Login successful']);
        } else {
            http_response_code(401);
            return json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    }

    // 获取主页数据
    public function getHomeData($username) {
        $user = $this->userModel->findUserByUsername($username);
        if ($user) {
            $weeklyLimitUsed = $this->userModel->getOrInitializeWeeklyLimitUsed($username);
            $data = [
                'username' => $user['username'],
                'daysUnderControl' => $user['daysUnderControl'] ?? 0,
                'weeklyLimitUsed' => $weeklyLimitUsed,
                'weeklyLimit' => $user['weeklyLimit'] ?? 750,
            ];
            return json_encode($data);
        } else {
            http_response_code(404);
            return json_encode(['message' => 'User not found']);
        }
    }

    // 记录饮酒量
    public function recordDrink($username, $amount) {
        try {
            $user = $this->userModel->findUserByUsername($username);
            if ($user) {
                $newWeeklyLimitUsed = $user['weeklyLimitUsed'] + $amount;
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

    // 获取用户信息
    public function getUserInfo($username) {
        $user = $this->userModel->findUserByUsername($username);
        if ($user) {
            return json_encode([
                'username' => $user['username'],
                'email' => $user['email'],
            ]);
        } else {
            http_response_code(404);
            return json_encode(['error' => 'User not found']);
        }
    }

    public function updateUserInfo($oldUsername, $data) {
        error_log("Updating user info for original username: " . $oldUsername);
        error_log("Data received for update: " . json_encode($data));

        // 如果传递了 newUsername，则表明需要更新用户名
        if (isset($data['newUsername'])) {
            $newUsername = $data['newUsername'];

            // 查找原始用户
            $user = $this->userModel->findUserByUsername($oldUsername);
            if ($user) {
                // 检查新用户名是否已存在
                $existingUser = $this->userModel->findUserByUsername($newUsername);
                if ($existingUser) {
                    return json_encode(['success' => false, 'error' => 'Username already exists']);
                }

                // 更新用户名
                $updateResult = $this->userModel->updateUserInfo($oldUsername, ['username' => $newUsername]);
                if ($updateResult) {
                    return json_encode(['success' => true, 'message' => 'Username updated successfully']);
                } else {
                    error_log("Failed to update username from $oldUsername to $newUsername");
                    return json_encode(['success' => false, 'error' => 'Failed to update username']);
                }
            } else {
                error_log("User not found for username: $oldUsername");
                return json_encode(['success' => false, 'error' => 'User not found']);
            }
        } else {
            // 如果不是更新用户名，则更新其他信息
            $updateResult = $this->userModel->updateUserInfo($oldUsername, $data);
            if ($updateResult) {
                return json_encode(['success' => true, 'message' => 'User info updated successfully']);
            } else {
                error_log("Failed to update user info for username: $oldUsername");
                return json_encode(['success' => false, 'error' => 'Failed to update user info']);
            }
        }
    }

    // 删除用户
    public function deleteUser($username) {
        $result = $this->userModel->deleteUser($username);
        if ($result) {
            return json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } else {
            http_response_code(500);
            return json_encode(['error' => 'Failed to delete user']);
        }
    }

    // 更新用户名
    public function updateUsername($oldUsername, $newUsername) {
        // 查找旧用户
        $user = $this->userModel->findUserByUsername($oldUsername);
        if (!$user) {
            return json_encode(['error' => 'User not found']);
        }

        // 检查新用户名是否已存在
        $existingUser = $this->userModel->findUserByUsername($newUsername);
        if ($existingUser) {
            return json_encode(['error' => 'Username already exists']);
        }

        // 使用旧用户的 _id 来更新用户名
        $updateResult = $this->userModel->updateUserById($user['_id'], ['username' => $newUsername]);

        if ($updateResult) {
            return json_encode(['success' => true, 'message' => 'Username updated successfully']);
        } else {
            return json_encode(['error' => 'Failed to update username']);
        }
    }

    // 克隆用户
    public function cloneUser($username, $newUsername) {
        // 查找现有用户
        $user = $this->userModel->findUserByUsername($username);
        if ($user) {
            unset($user['_id']);
            unset($user['username']);
            $user['username'] = $newUsername;

            // 保留密码哈希
            $result = $this->userModel->registerUser($user);
            if ($result['success']) {
                return json_encode(['success' => true, 'message' => 'User cloned successfully']);
            } else {
                return json_encode(['success' => false, 'message' => 'Failed to clone user']);
            }
        } else {
            http_response_code(404);
            return json_encode(['error' => 'Original user not found']);
        }
    }
}
