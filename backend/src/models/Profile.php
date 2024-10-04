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
                'id' => $profile['_id'],
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

    // 新增：签到逻辑
    public function updateCheckin($username) {
        $query = ['username' => $username];
        $profile = $this->db->users->findOne($query);

        if ($profile) {
            // 当前时间
            $currentTime = new \DateTime();
            // 上一次签到时间
            $lastCheckinTime = isset($profile['lastCheckin']) ? new \DateTime($profile['lastCheckin']) : null;

            // 判断 lastCheckinTime 是否存在
            if ($lastCheckinTime) {
                $today14 = clone $lastCheckinTime;
                $today14->setTime(14, 0, 0);

                // 根据签到时间逻辑进行判断
                if ($lastCheckinTime < $today14) {
                    if ($currentTime < $today14) {
                        // 今日已更新过
                        return ['message' => 'You have already check in today.'];
                    } elseif ($currentTime < $today14->modify('+1 day')) {
                        // 更新 daysUnderControl 并刷新 lastCheckin
                        $newDaysUnderControl = $profile['daysUnderControl'] + 1;
                        $this->db->users->updateOne($query, ['$set' => [
                            'daysUnderControl' => $newDaysUnderControl,
                            'lastCheckin' => $currentTime->format(\DateTime::ISO8601)
                        ]]);
                        return ['message' => 'Successful update', 'daysUnderControl' => $newDaysUnderControl];
                    } else {
                        // 超过一天，重置 daysUnderControl
                        $this->db->users->updateOne($query, ['$set' => [
                            'daysUnderControl' => 1,
                            'lastCheckin' => $currentTime->format(\DateTime::ISO8601)
                        ]]);
                        return ['message' => 'Successful update', 'daysUnderControl' => 1];
                    }
                } else {
                    if ($currentTime < $today14->modify('+1 day')) {
                        // 今日已更新过
                        return ['message' => 'You have already check in today.'];
                    } elseif ($currentTime < $today14->modify('+2 day')) {
                        // 更新 daysUnderControl 并刷新 lastCheckin
                        $newDaysUnderControl = $profile['daysUnderControl'] + 1;
                        $this->db->users->updateOne($query, ['$set' => [
                            'daysUnderControl' => $newDaysUnderControl,
                            'lastCheckin' => $currentTime->format(\DateTime::ISO8601)
                        ]]);
                        return ['message' => 'Successful update', 'daysUnderControl' => $newDaysUnderControl];
                    } else {
                        // 超过两天，重置 daysUnderControl
                        $this->db->users->updateOne($query, ['$set' => [
                            'daysUnderControl' => 1,
                            'lastCheckin' => $currentTime->format(\DateTime::ISO8601)
                        ]]);
                        return ['message' => 'Successful update', 'daysUnderControl' => 1];
                    }
                }
            } else {
                // 如果没有 lastCheckinTime，初始化为当前时间并设置 daysUnderControl 为 1
                $this->db->users->updateOne($query, ['$set' => [
                    'daysUnderControl' => 1,
                    'lastCheckin' => $currentTime->format(\DateTime::ISO8601)
                ]]);
                return ['message' => 'Successful first check-in', 'daysUnderControl' => 1];
            }
        } else {
            return ['message' => 'The user does not exist'];
        }
    }
}
