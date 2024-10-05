<?php

class User {
    private $collection;

    public function __construct($db) {
        // 初始化 users 集合
        $this->collection = $db->users;
    }

    // 注册用户
    public function registerUser($data) {
        // 初始化 lastReset 为当前时间
        $data['lastReset'] = new MongoDB\BSON\UTCDateTime(time() * 1000);
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);

        // 如果 hobbies 不存在，初始化为空数组
        if (!isset($data['hobbies'])) {
            $data['hobbies'] = [];
        }

        $insertResult = $this->collection->insertOne($data);

        if ($insertResult->getInsertedCount() > 0) {
            return ['success' => true, 'message' => 'Registration successful'];
        } else {
            return ['success' => false, 'message' => 'Registration failed'];
        }
    }


    public function updateUserInfoById($id, $data) {
        $result = $this->collection->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($id)],
            ['$set' => $data]
        );

        return $result->getModifiedCount() > 0;
    }

    // 提交 OOBE 数据
    public function submitOOBEData($data) {
        $updateResult = $this->collection->updateOne(
            ['username' => $data['username']],
            ['$set' => [
                'age' => $data['age'],
                'gender' => $data['gender'],
                'weeklyLimit' => $data['weeklyLimit'],
                'daysUnderControl' => 0,
                'weeklyLimitUsed' => 0,
                'lastReset' => new MongoDB\BSON\UTCDateTime(time() * 1000), // 初始化 lastReset
                'hobbies' => $data['hobbies'], // 新增的爱好字段
                'height' => $data['height'], // 新增 height 字段
                'weight' => $data['weight'], // 新增 weight 字段
                'drinkingPreference' => $data['drinkingPreference'] // 新增 drinkingPreference 字段
            ]]
        );

        if ($updateResult->getModifiedCount() > 0) {
            return true;
        } else {
            throw new Exception('Failed to update OOBE data');
        }
    }


    // 通过用户名查找用户
    public function findUserByUsername($username) {
        return $this->collection->findOne(['username' => $username]);
    }
// 根据 email 查找用户
    public function findUserByEmail($email) {
        $user = $this->collection->findOne(['email' => $email]);

        if ($user) {
            return $user;
        } else {
            return null;
        }
    }

    // 获取用户信息
    public function getUserInfo($username) {
        $user = $this->findUserByUsername($username);

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
    public function updateUserInfo($username, $data) {
        error_log("Updating user info in database for username: " . $username);
        error_log("Data being updated: " . json_encode($data));

        $query = ['username' => $username];
        $update = ['$set' => $data];

        if (isset($data['hobbies'])) { // 新增爱好更新
            $update['$set']['hobbies'] = $data['hobbies'];
        }

        $result = $this->collection->updateOne($query, $update);

        if ($result->getModifiedCount() > 0 || $result->getUpsertedCount() > 0) {
            return true;
        } else {
            error_log("No data modified for username: " . $username);
            return false;
        }
    }

    // 删除用户
    public function deleteUser($username) {
        $deleteResult = $this->collection->deleteOne(['username' => $username]);

        return $deleteResult->getDeletedCount() > 0;
    }

    // 获取或初始化 weeklyLimitUsed
    public function getOrInitializeWeeklyLimitUsed($username) {
        $user = $this->findUserByUsername($username);

        if ($user) {
            if (!isset($user['weeklyLimitUsed'])) {
                $this->collection->updateOne(
                    ['username' => $username],
                    ['$set' => ['weeklyLimitUsed' => 0]]
                );
                return 0;
            } else {
                return $user['weeklyLimitUsed'];
            }
        } else {
            throw new Exception('User not found');
        }
    }

    // 更新 weeklyLimitUsed
    public function updateWeeklyLimitUsed($username, $newWeeklyLimitUsed) {
        $this->collection->updateOne(
            ['username' => $username],
            ['$set' => ['weeklyLimitUsed' => $newWeeklyLimitUsed]]
        );
    }

    // 更新用户历史记录
    public function updateUserHistory($username, $recordTime, $recordValue, $recordType) {
        $this->collection->updateOne(
            ['username' => $username],
            ['$set' => [
                'recordTime' => $recordTime,
                'recordValue' => $recordValue,
                'recordType' => $recordType
            ]]
        );
    }

    // 获取用户历史记录
    public function getUserHistory($username) {
        $user = $this->findUserByUsername($username);

        if ($user) {
            return [
                'recordTime' => $user['recordTime'] ?? [],
                'recordValue' => $user['recordValue'] ?? [],
                'recordType' => $user['recordType'] ?? []
            ];
        } else {
            throw new Exception('User not found');
        }
    }
}
