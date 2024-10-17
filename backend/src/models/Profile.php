<?php

class Profile {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Get user information by username
    public function getProfileByUsername($username) {
        // Use MongoDB for querying
        $query = ['username' => $username];  // Ensure query conditions are the same as in home.js
        $profile = $this->db->users->findOne($query);  // Assume the collection name is 'users'

        // If profile data is found, return relevant information
        if ($profile) {
            return [
                'id' => $profile['_id'],
                'username' => $profile['username'],
                'email' => $profile['email'],
                'weeklyLimit' => $profile['weeklyLimit'],
                'weeklyLimitUsed' => $profile['weeklyLimitUsed']
            ];
        } else {
            return null;  // If user is not found, return null
        }
    }

    public function getBodyInfoByUsername($username) {
        // Print debug information to confirm query parameters
        error_log("Querying body info in MongoDB for username: " . $username);

        $query = ['username' => $username];

        // Use MongoDB query
        $bodyInfo = $this->db->users->findOne($query);

        if ($bodyInfo) {
            error_log("Found body info in MongoDB for username: " . $username);
            return $bodyInfo;
        } else {
            error_log("No body info found in MongoDB for username: " . $username);
            return false;
        }
    }

    // New: Update user's weekly limit
    public function updateWeeklyLimit($username, $newLimit) {
        // Use MongoDB to update user's weekly limit
        $query = ['username' => $username];
        $update = ['$set' => ['weeklyLimit' => $newLimit]];

        $result = $this->db->users->updateOne($query, $update);  // Assume the collection name is 'users'

        // Check if the update was successful
        return $result->getModifiedCount() > 0;
    }

    // New: Check-in logic
    public function updateCheckin($username) {
        $query = ['username' => $username];
        $profile = $this->db->users->findOne($query);

        if ($profile) {
            // Current time
            $currentTime = new \DateTime();
            // Last check-in time
            $lastCheckinTime = isset($profile['lastCheckin']) ? new \DateTime($profile['lastCheckin']) : null;

            // Check if lastCheckinTime exists
            if ($lastCheckinTime) {
                $today14 = clone $lastCheckinTime;
                $today14->setTime(14, 0, 0);

                // Make judgments based on check-in time logic
                if ($lastCheckinTime < $today14) {
                    if ($currentTime < $today14) {
                        // Already updated today
                        return ['message' => 'You have already check in today.'];
                    } elseif ($currentTime < $today14->modify('+1 day')) {
                        // Update daysUnderControl and refresh lastCheckin
                        $newDaysUnderControl = $profile['daysUnderControl'] + 1;
                        $this->db->users->updateOne($query, ['$set' => [
                            'daysUnderControl' => $newDaysUnderControl,
                            'lastCheckin' => $currentTime->format(\DateTime::ISO8601)
                        ]]);
                        return ['message' => 'Successful update', 'daysUnderControl' => $newDaysUnderControl];
                    } else {
                        // More than one day, reset daysUnderControl
                        $this->db->users->updateOne($query, ['$set' => [
                            'daysUnderControl' => 1,
                            'lastCheckin' => $currentTime->format(\DateTime::ISO8601)
                        ]]);
                        return ['message' => 'Successful update', 'daysUnderControl' => 1];
                    }
                } else {
                    if ($currentTime < $today14->modify('+1 day')) {
                        // Already updated today
                        return ['message' => 'You have already check in today.'];
                    } elseif ($currentTime < $today14->modify('+2 day')) {
                        // Update daysUnderControl and refresh lastCheckin
                        $newDaysUnderControl = $profile['daysUnderControl'] + 1;
                        $this->db->users->updateOne($query, ['$set' => [
                            'daysUnderControl' => $newDaysUnderControl,
                            'lastCheckin' => $currentTime->format(\DateTime::ISO8601)
                        ]]);
                        return ['message' => 'Successful update', 'daysUnderControl' => $newDaysUnderControl];
                    } else {
                        // More than two days, reset daysUnderControl
                        $this->db->users->updateOne($query, ['$set' => [
                            'daysUnderControl' => 1,
                            'lastCheckin' => $currentTime->format(\DateTime::ISO8601)
                        ]]);
                        return ['message' => 'Successful update', 'daysUnderControl' => 1];
                    }
                }
            } else {
                // If there's no lastCheckinTime, initialize it to current time and set daysUnderControl to 1
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
