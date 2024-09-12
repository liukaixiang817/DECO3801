<?php

class Profile {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // 根据用户名获取用户信息
    public function getProfileByUsername($username) {
        // 使用 MongoDB 进行查询
        $query = ['username' => $username];  // 确保查询条件和 home.js 的查询逻辑相同
        $profile = $this->db->users->findOne($query);  // 假设集合名为 users

        // 如果找到了 profile 数据，返回相关信息
        if ($profile) {
            return [
                'username' => $profile['username'],
                'email' => $profile['email'],
                'weeklyLimit' => $profile['weeklyLimit'],
                'weeklyLimitUsed' => $profile['weeklyLimitUsed']
            ];
        } else {
            return null;  // 如果没有找到用户，返回 null
        }
    }

    public function getBodyInfoByUsername($username) {
        // 打印调试信息，确认查询参数
        error_log("Querying body info in MongoDB for username: " . $username);

        $query = ['username' => $username];

        // 使用 MongoDB 查询
        $bodyInfo = $this->db->users->findOne($query);

        if ($bodyInfo) {
            error_log("Found body info in MongoDB for username: " . $username);
            return $bodyInfo;
        } else {
            error_log("No body info found in MongoDB for username: " . $username);
            return false;
        }
    }
    // 新增：更新用户的每周限制
    public function updateWeeklyLimit($username, $newLimit) {
        // 使用 MongoDB 更新用户的每周限制
        $query = ['username' => $username];
        $update = ['$set' => ['weeklyLimit' => $newLimit]];

        $result = $this->db->users->updateOne($query, $update);  // 假设集合名为 users

        // 检查是否更新成功
        return $result->getModifiedCount() > 0;
    }
}
