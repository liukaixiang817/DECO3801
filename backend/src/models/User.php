<?php

class User {
    private $collection;

    public function __construct($db) {
        $this->collection = $db->users;
    }

    public function registerUser($data) {
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        $insertResult = $this->collection->insertOne($data);

        if ($insertResult->getInsertedCount() > 0) {
            return ['success' => true, 'message' => 'Registration successful'];
        } else {
            return ['success' => false, 'message' => 'Registration failed'];
        }
    }

    public function submitOOBEData($data) {
        $updateResult = $this->collection->updateOne(
            ['username' => $data['username']],
            ['$set' => [
                'age' => $data['age'],
                'gender' => $data['gender'],
                'weeklyLimit' => $data['weeklyLimit'],
                'daysUnderControl' => 0,
                'weeklyLimitUsed' => 0,
            ]]
        );

        if ($updateResult->getModifiedCount() > 0) {
            return true;
        } else {
            throw new Exception('Failed to update OOBE data');
        }
    }

    public function findUserByUsername($username) {
        return $this->collection->findOne(['username' => $username]);
    }

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

    public function updateWeeklyLimitUsed($username, $newWeeklyLimitUsed) {
        $this->collection->updateOne(
            ['username' => $username],
            ['$set' => ['weeklyLimitUsed' => $newWeeklyLimitUsed]]
        );
    }
}
