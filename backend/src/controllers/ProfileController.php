<?php

require_once __DIR__ . '/../models/Profile.php';  // 加载 Profile 模型

class ProfileController {
    private $profileModel;
    private $db;

    public function __construct($db) {
        $this->profileModel = new Profile($db);
        $this->db = $db;  // 初始化数据库连接
    }

    // 返回带有 email 的用户信息
    public function getProfileWithEmail($username) {
        $profile = $this->profileModel->getProfileByUsername($username);

        if ($profile) {
            return json_encode($profile);
        } else {
            return json_encode(['error' => 'Profile not found']);
        }
    }

    // 更新用户每周限制
    public function updateWeeklyLimit($username, $newLimit) {
        $result = $this->profileModel->updateWeeklyLimit($username, $newLimit);

        if ($result) {
            return json_encode(['success' => true]);
        } else {
            return json_encode(['error' => 'Failed to update weekly limit']);
        }
    }

    // 获取用户的身体信息
    public function getBodyInfo($username) {
        if (!$username) {
            http_response_code(400);
            error_log("Error: Username is missing in getBodyInfo request.");
            return json_encode(['error' => 'Username is required']);
        }

        // 打印调试信息，确认 username 是否正确传递
        error_log("Initiating query for body info with username: " . $username);

        // 调用 Profile 模型中的方法来获取 bodyInfo
        $bodyInfo = $this->profileModel->getBodyInfoByUsername($username);

        // 检查查询结果
        if ($bodyInfo) {
            error_log("Body info found for username: " . $username . " - " . json_encode($bodyInfo));

            // 返回实际的用户身体信息，包括爱好信息
            return json_encode([
                'gender' => $bodyInfo['gender'] ?? 'Male',
                'age' => $bodyInfo['age'] ?? 18,
                'height' => $bodyInfo['height'] ?? '',
                'weight' => $bodyInfo['weight'] ?? '',
                'drinkPreference' => $bodyInfo['drinkPreference'] ?? 'beer',
                'hobbies' => $bodyInfo['hobbies'] ?? [] // 添加爱好字段
            ]);
        } else {
            error_log("No body info found for username: " . $username);
            return json_encode([
                'gender' => 'Male',
                'age' => 18,
                'height' => '',
                'weight' => '',
                'drinkPreference' => 'beer',
                'hobbies' => [] // 默认返回空爱好列表
            ]);
        }
    }

    // 更新用户的身体信息
    public function updateBodyInfo($username, $data) {
        if (!$username) {
            http_response_code(400);
            error_log("Error: Username is missing in updateBodyInfo request.");
            return json_encode(['error' => 'Username is required']);
        }

        // 打印更新数据的调试信息
        error_log("Updating body info for username: " . $username . " with data: " . json_encode($data));

        // 如果数据中包含 hobbies 字段，确保它也被正确保存
        if (isset($data['hobbies'])) {
            $update = ['$set' => [
                'gender' => $data['gender'] ?? 'Male',
                'age' => $data['age'] ?? 18,
                'height' => $data['height'] ?? '',
                'weight' => $data['weight'] ?? '',
                'drinkPreference' => $data['drinkPreference'] ?? 'beer',
                'hobbies' => $data['hobbies'] // 添加爱好字段
            ]];
        } else {
            // 构建更新查询，不包含 hobbies 字段
            $update = ['$set' => $data];
        }

        // 执行更新操作
        $result = $this->db->users->updateOne(['username' => $username], $update, ['upsert' => true]);

        // 检查是否成功更新
        if ($result->getModifiedCount() > 0 || $result->getUpsertedCount() > 0) {
            error_log("Successfully updated body info for username: " . $username);
            return json_encode(['success' => true]);
        } else {
            error_log("Failed to update body info for username: " . $username);
            return json_encode(['error' => 'Failed to update body information']);
        }
    }

    // 新增：处理签到请求
    public function checkin($username) {
        if (!$username) {
            http_response_code(400);
            error_log("Error: Username is missing in checkin request.");
            return json_encode(['error' => 'Username is required']);
        }

        // 调用 Profile 模型中的签到逻辑
        $result = $this->profileModel->updateCheckin($username);

        // 返回签到结果
        if (isset($result['message'])) {
            return json_encode($result);
        } else {
            error_log("Failed to update check-in for username: " . $username);
            return json_encode(['error' => 'Failed to update check-in status']);
        }
    }
}
