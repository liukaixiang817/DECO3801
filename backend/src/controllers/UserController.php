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

    // 苹果登录处理
    public function appleLogin($data) {
        try {
            // 检查请求体中的 code
            if (empty($data['code'])) {
                throw new Exception('Code is missing in the Apple login.');
            }

            $code = $data['code'];
            // 使用 code 从 Apple 获取用户信息（伪代码，需要替换为实际请求）
            $appleUserInfo = $this->getAppleUserInfo($code);

            if (!$appleUserInfo) {
                throw new Exception('Failed to retrieve user info from Apple.');
            }

            $username = $appleUserInfo['username'];
            $email = $appleUserInfo['email'];

            // 检查数据库中是否存在此用户名
            $user = $this->userModel->findUserByUsername($username);

            if ($user) {
                // 用户已存在，直接登录
                return json_encode(['success' => true, 'needsOOBE' => false, 'message' => 'Login successful']);
            } else {
                // 用户不存在，创建新用户
                return json_encode($this->userModel->registerUser(['username' => $username, 'email' => $email]));
            }
        } catch (Exception $e) {
            return json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // 苹果登录回调处理（手动解码 id_token）
    public function appleCallback($data) {
        try {
            // 检查请求体中的 code 和 state
            if (empty($data['code']) || empty($data['state'])) {
                throw new Exception('Code or state is missing in the callback.');
            }

            $code = $data['code'];
            $state = $data['state'];

            // 输出请求的 code 和 state
            error_log('Received code: ' . $code);
            error_log('Received state: ' . $state);

            // Apple Client ID 和重定向 URI
            $clientID = 'soberup.uq'; // 替换为您的 Apple Client ID
            $clientSecret = $this->generateAppleClientSecret(); // 生成 client_secret
            $redirectURI = 'https://login.lkx666.cn/apple-callback'; // 替换为您实际的重定向 URI

            // 输出生成的 client_secret
            error_log('Generated client_secret: ' . $clientSecret);

            // 构造 token 请求数据
            $tokenRequestData = [
                'client_id' => $clientID,
                'client_secret' => $clientSecret,
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $redirectURI,
            ];

            // 输出发送给 Apple 的数据
            error_log('Sending request to Apple with data: ' . print_r($tokenRequestData, true));

            // 使用 cURL 向苹果服务器请求 token
            $ch = curl_init('https://appleid.apple.com/auth/token');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenRequestData));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            // 如果要禁用 SSL 校验，请添加下面的两行代码
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);

            // 检查 cURL 错误
            if (curl_errno($ch)) {
                throw new Exception('cURL Error: ' . curl_error($ch));
            }

            // 输出 Apple 返回的响应
            error_log('Response from Apple: ' . $response);

            curl_close($ch);

            $tokenResponse = json_decode($response, true);

            // 检查是否成功获取 token
            if (!isset($tokenResponse['id_token'])) {
                throw new Exception('Failed to get id_token from Apple. Response: ' . $response);
            }

            // 手动解码 id_token 以获取用户信息
            $idToken = $tokenResponse['id_token'];
            $jwtParts = explode('.', $idToken);

            // 解码 header 和 payload
            $header = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $jwtParts[0])), true);
            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $jwtParts[1])), true);

            // 输出解码后的 header 和 payload
            error_log('Decoded JWT Header: ' . json_encode($header));
            error_log('Decoded JWT Payload: ' . json_encode($payload));

            // 获取用户信息
            $appleUserID = $payload['sub'];
            $email = isset($payload['email']) ? $payload['email'] : null;

            // 输出解码的用户信息
            error_log('Decoded Apple User ID: ' . $appleUserID);
            error_log('Decoded Apple Email: ' . $email);

            // 在数据库中查找用户
            $user = $this->userModel->findUserByUsername($appleUserID);

            if ($user) {
                // 用户已存在，登录成功
                return json_encode(['success' => true, 'username' => $appleUserID]);
            } else {
                // 用户不存在，创建新用户
                $newUser = [
                    'username' => $appleUserID,
                    'email' => $email,
                    'weeklyLimitUsed' => 0,
                    'lastReset' => new MongoDB\BSON\UTCDateTime(time() * 1000),
                ];

                $result = $this->userModel->registerUser($newUser);

                if ($result['success']) {
                    return json_encode(['success' => true, 'username' => $appleUserID]);
                } else {
                    throw new Exception('Failed to create new user.');
                }
            }

        } catch (Exception $e) {
            // 捕获并记录错误
            http_response_code(500);
            error_log("Apple callback error: " . $e->getMessage());
            return json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // 生成 Apple client_secret 的方法
    private function generateAppleClientSecret() {
        $teamID = '6JYKKHR95S'; // 替换为您的 Apple Team ID
        $clientID = 'soberup.uq'; // 替换为您的 Apple Client ID
        $keyID = 'JLVZ497B48'; // 替换为您的 Key ID
        $privateKeyPath = __DIR__ . '/../AuthKey_JLVZ497B48.p8'; // 替换为私钥文件的路径

        // 读取私钥文件
        $privateKey = file_get_contents($privateKeyPath);

        // 确保路径正确并且私钥存在
        if ($privateKey === false) {
            error_log('Private key not found or could not be read.');
            throw new Exception('Private key file could not be read.');
        }

        // 输出私钥路径和内容
        error_log('Private key path: ' . $privateKeyPath);
        error_log('Private key loaded successfully.');

        // Header and payload for the JWT
        $header = [
            'alg' => 'ES256',
            'kid' => $keyID
        ];

        $claims = [
            'iss' => $teamID,
            'iat' => time(),
            'exp' => time() + 3600, // Token 有效期 1 小时
            'aud' => 'https://appleid.apple.com',
            'sub' => $clientID
        ];

        // 输出 header 和 claims
        error_log('JWT Header: ' . json_encode($header));
        error_log('JWT Claims: ' . json_encode($claims));

        // 编码 header 和 payload
        $headerEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($header)));
        $claimsEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($claims)));

        // 输出编码后的 header 和 claims
        error_log('Encoded JWT Header: ' . $headerEncoded);
        error_log('Encoded JWT Claims: ' . $claimsEncoded);

        $signature = '';
        $privateKeyResource = openssl_get_privatekey($privateKey);

        if ($privateKeyResource === false) {
            error_log('Failed to get private key resource.');
            throw new Exception('Invalid private key.');
        }

        // 签名 JWT
        $success = openssl_sign(
            $headerEncoded . '.' . $claimsEncoded,
            $signature,
            $privateKeyResource,
            OPENSSL_ALGO_SHA256
        );

        if (!$success) {
            error_log('Failed to generate signature.');
            throw new Exception('Error signing the JWT.');
        }

        openssl_free_key($privateKeyResource);

        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        // 拼接生成 client_secret
        $clientSecret = $headerEncoded . "." . $claimsEncoded . "." . $base64UrlSignature;

        // 输出生成的 client_secret
        error_log('Generated client_secret: ' . $clientSecret);

        return $clientSecret;
    }

    public function findUserByEmail($email) {
        return $this->userModel->findUserByEmail($email);
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
            // 获取当前时间和上次重置时间
            $currentDateTime = new DateTime();
            $lastResetTime = $user['lastReset']->toDateTime();
            $resetHour = 14; // 14:00

            // 如果当前时间晚于 lastReset 当天的 14:00 或者是次日，则重置 weeklyLimitUsed
            if ($currentDateTime > $lastResetTime->setTime($resetHour, 0)) {
                $this->userModel->updateUserInfoById($user['_id'], [
                    'weeklyLimitUsed' => 0,
                    'lastReset' => new MongoDB\BSON\UTCDateTime(time() * 1000) // 更新为当前时间
                ]);
            }

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

    // 记录饮酒量并更新历史
    public function recordDrink($username, $amount, $type) {
        try {
            $user = $this->userModel->findUserByUsername($username);
            if ($user) {
                $newWeeklyLimitUsed = $user['weeklyLimitUsed'] + $amount;
                $this->userModel->updateWeeklyLimitUsed($username, $newWeeklyLimitUsed);

                // 检查 recordTime, recordValue, recordType 是否存在，不存在则初始化为空数组
                $recordTime = isset($user['recordTime']) ? $user['recordTime']->getArrayCopy() : [];
                $recordValue = isset($user['recordValue']) ? $user['recordValue']->getArrayCopy() : [];
                $recordType = isset($user['recordType']) ? $user['recordType']->getArrayCopy() : [];

                // 更新历史记录
                array_push($recordTime, date('Y-m-d H:i:s'));  // 当前时间
                array_push($recordValue, $amount);  // 饮酒量
                array_push($recordType, $type);  // 饮品类型

                // 更新数据库中的历史记录
                $this->userModel->updateUserHistory($username, $recordTime, $recordValue, $recordType);

                return json_encode([
                    'success' => true,
                    'weeklyLimitUsed' => $newWeeklyLimitUsed,
                    'message' => 'Drink recorded and history updated successfully'
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

    // 获取用户历史记录
    public function getDrinkHistory($username) {
        $user = $this->userModel->findUserByUsername($username);
        if ($user) {
            // 检查历史记录是否存在
            if (isset($user['recordTime'], $user['recordValue'], $user['recordType'])) {
                $history = [
                    'recordTime' => $user['recordTime'],
                    'recordValue' => $user['recordValue'],
                    'recordType' => $user['recordType']
                ];
                return json_encode($history);
            } else {
                return json_encode(['error' => 'No history found for this user']);
            }
        } else {
            http_response_code(404);
            return json_encode(['error' => 'User not found']);
        }
    }

    // 获取用户信息
    public function getUserInfo($username) {
        $user = $this->userModel->findUserByUsername($username);
        if ($user) {
            return json_encode([
                'username' => $user['username'],
                'email' => $user['email'],
                'hobbies' => $user['hobbies'] ?? [] // 返回用户的爱好
            ]);
        } else {
            http_response_code(404);
            return json_encode(['error' => 'User not found']);
        }
    }

    // 更新用户信息
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
