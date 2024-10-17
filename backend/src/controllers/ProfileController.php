<?php

require_once __DIR__ . '/../models/Profile.php';  // load Profile model

class ProfileController {
    private $profileModel;
    private $db;

    public function __construct($db) {
        $this->profileModel = new Profile($db);
        $this->db = $db;  // Initialize database connection
    }

    // Return user information with email
    public function getProfileWithEmail($username) {
        $profile = $this->profileModel->getProfileByUsername($username);

        if ($profile) {
            return json_encode($profile);
        } else {
            return json_encode(['error' => 'Profile not found']);
        }
    }

    // Update user's weekly limit
    public function updateWeeklyLimit($username, $newLimit) {
        $result = $this->profileModel->updateWeeklyLimit($username, $newLimit);

        if ($result) {
            return json_encode(['success' => true]);
        } else {
            return json_encode(['error' => 'Failed to update weekly limit']);
        }
    }

    // Get user's body information
    public function getBodyInfo($username) {
        if (!$username) {
            http_response_code(400);
            error_log("Error: Username is missing in getBodyInfo request.");
            return json_encode(['error' => 'Username is required']);
        }

        // Print debug information to confirm username is correctly passed
        error_log("Initiating query for body info with username: " . $username);

        // Call the method in Profile model to get bodyInfo
        $bodyInfo = $this->profileModel->getBodyInfoByUsername($username);

        // Check query result
        if ($bodyInfo) {
            error_log("Body info found for username: " . $username . " - " . json_encode($bodyInfo));

            // Return actual user body information, including hobby information
            return json_encode([
                'gender' => $bodyInfo['gender'] ?? 'Male',
                'age' => $bodyInfo['age'] ?? 18,
                'height' => $bodyInfo['height'] ?? '',
                'weight' => $bodyInfo['weight'] ?? '',
                'drinkingPreference' => $bodyInfo['drinkingPreference'] ?? 'beer', // Use the correct field name
                'hobbies' => $bodyInfo['hobbies'] ?? [] // Add hobbies field
            ]);
        } else {
            error_log("No body info found for username: " . $username);
            return json_encode([
                'gender' => 'Male',
                'age' => 18,
                'height' => '',
                'weight' => '',
                'drinkingPreference' => 'beer',
                'hobbies' => [] // Return empty hobby list by default
            ]);
        }
    }

    // Update user's body information
    public function updateBodyInfo($username, $data) {
        if (!$username) {
            http_response_code(400);
            error_log("Error: Username is missing in updateBodyInfo request.");
            return json_encode(['error' => 'Username is required']);
        }

        // Print debug information for update data
        error_log("Updating body info for username: " . $username . " with data: " . json_encode($data));

        // Construct update query
        $update = ['$set' => [
            'gender' => $data['gender'] ?? 'Male',
            'age' => $data['age'] ?? 18,
            'height' => $data['height'] ?? '',
            'weight' => $data['weight'] ?? '',
            'drinkingPreference' => $data['drinkingPreference'] ?? 'beer', // Here, replace drinkPreference with drinkingPreference
            'hobbies' => $data['hobbies'] ?? [] // Add hobbies field
        ]];

        // Execute update operation
        $result = $this->db->users->updateOne(['username' => $username], $update, ['upsert' => true]);

        // Check if update was successful
        if ($result->getModifiedCount() > 0 || $result->getUpsertedCount() > 0) {
            error_log("Successfully updated body info for username: " . $username);
            return json_encode(['success' => true]);
        } else {
            error_log("Failed to update body info for username: " . $username);
            return json_encode(['error' => 'Failed to update body information']);
        }
    }

    // New: Handle check-in request
    public function checkin($username) {
        if (!$username) {
            http_response_code(400);
            error_log("Error: Username is missing in checkin request.");
            return json_encode(['error' => 'Username is required']);
        }

        // Call check-in logic in Profile model
        $result = $this->profileModel->updateCheckin($username);

        // Return check-in result
        if (isset($result['message'])) {
            return json_encode($result);
        } else {
            error_log("Failed to update check-in for username: " . $username);
            return json_encode(['error' => 'Failed to update check-in status']);
        }
    }
}
