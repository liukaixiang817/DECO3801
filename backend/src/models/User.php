<?php

class User {
    private $collection;

    public function __construct($db) {
        // Initialize users collection
        $this->collection = $db->users;
    }

    // Register user
    public function registerUser($data) {
        // Initialize lastReset to current time
        $data['lastReset'] = new MongoDB\BSON\UTCDateTime(time() * 1000);
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);

        // If hobbies doesn't exist, initialize as an empty array
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

    // Submit OOBE data
    public function submitOOBEData($data) {
        $updateResult = $this->collection->updateOne(
            ['username' => $data['username']],
            ['$set' => [
                'age' => $data['age'],
                'gender' => $data['gender'],
                'weeklyLimit' => $data['weeklyLimit'],
                'daysUnderControl' => 0,
                'weeklyLimitUsed' => 0,
                'lastReset' => new MongoDB\BSON\UTCDateTime(time() * 1000), // Initialize lastReset
                'hobbies' => $data['hobbies'], // New hobbies field
                'height' => $data['height'], // New height field
                'weight' => $data['weight'], // New weight field
                'drinkingPreference' => $data['drinkingPreference'] // New drinkingPreference field
            ]]
        );

        if ($updateResult->getModifiedCount() > 0) {
            return true;
        } else {
            throw new Exception('Failed to update OOBE data');
        }
    }

    // Find user by username
    public function findUserByUsername($username) {
        return $this->collection->findOne(['username' => $username]);
    }

    // Find user by email
    public function findUserByEmail($email) {
        $user = $this->collection->findOne(['email' => $email]);

        if ($user) {
            return $user;
        } else {
            return null;
        }
    }

    // Get user information
    public function getUserInfo($username) {
        $user = $this->findUserByUsername($username);

        if ($user) {
            return json_encode([
                'username' => $user['username'],
                'email' => $user['email'],
                'hobbies' => $user['hobbies'] ?? [] // Return user's hobbies
            ]);
        } else {
            http_response_code(404);
            return json_encode(['error' => 'User not found']);
        }
    }

    // Update user information
    public function updateUserInfo($username, $data) {
        error_log("Updating user info in database for username: " . $username);
        error_log("Data being updated: " . json_encode($data));

        $query = ['username' => $username];
        $update = ['$set' => $data];

        if (isset($data['hobbies'])) { // New hobby update
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

    // Delete user
    public function deleteUser($username) {
        $deleteResult = $this->collection->deleteOne(['username' => $username]);

        return $deleteResult->getDeletedCount() > 0;
    }

    // Get or initialize weeklyLimitUsed
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

    // Update weeklyLimitUsed
    public function updateWeeklyLimitUsed($username, $newWeeklyLimitUsed) {
        $this->collection->updateOne(
            ['username' => $username],
            ['$set' => ['weeklyLimitUsed' => $newWeeklyLimitUsed]]
        );
    }

    // Update user history
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

    // Get user history
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
