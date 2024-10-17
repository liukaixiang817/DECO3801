<?php

require_once __DIR__ . '/../models/User.php';

class UserController {
    private $userModel;

    public function __construct($db) {
        $this->userModel = new User($db);
    }

    // Register user
    public function register($data) {
        return json_encode($this->userModel->registerUser($data));
    }

    // Handle Apple login
    public function appleLogin($data) {
        try {
            // Check for code in the request body
            if (empty($data['code'])) {
                throw new Exception('Code is missing in the Apple login.');
            }

            $code = $data['code'];
            // Use code to get user info from Apple (pseudo-code, needs to be replaced with actual request)
            $appleUserInfo = $this->getAppleUserInfo($code);

            if (!$appleUserInfo) {
                throw new Exception('Failed to retrieve user info from Apple.');
            }

            $username = $appleUserInfo['username'];
            $email = $appleUserInfo['email'];

            // Check if this username exists in the database
            $user = $this->userModel->findUserByUsername($username);

            if ($user) {
                // User exists, proceed with login
                return json_encode(['success' => true, 'needsOOBE' => false, 'message' => 'Login successful']);
            } else {
                // User doesn't exist, create new user
                return json_encode($this->userModel->registerUser(['username' => $username, 'email' => $email]));
            }
        } catch (Exception $e) {
            return json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // Handle Apple login callback (manually decode id_token)
    public function appleCallback($data) {
        try {
            // Check for code and state in the request body
            if (empty($data['code']) || empty($data['state'])) {
                throw new Exception('Code or state is missing in the callback.');
            }

            $code = $data['code'];
            $state = $data['state'];

            // Output the received code and state
            error_log('Received code: ' . $code);
            error_log('Received state: ' . $state);

            // Apple Client ID and redirect URI
            $clientID = 'soberup.uq'; // Replace with your Apple Client ID
            $clientSecret = $this->generateAppleClientSecret(); // Generate client_secret
            $redirectURI = 'https://login.lkx666.cn/apple-callback'; // Replace with your actual redirect URI

            // Output the generated client_secret
            error_log('Generated client_secret: ' . $clientSecret);

            // Construct token request data
            $tokenRequestData = [
                'client_id' => $clientID,
                'client_secret' => $clientSecret,
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $redirectURI,
            ];

            // Output the data being sent to Apple
            error_log('Sending request to Apple with data: ' . print_r($tokenRequestData, true));

            // Use cURL to request token from Apple server
            $ch = curl_init('https://appleid.apple.com/auth/token');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenRequestData));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            // If you want to disable SSL verification, add the following two lines
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);

            // Check for cURL errors
            if (curl_errno($ch)) {
                throw new Exception('cURL Error: ' . curl_error($ch));
            }

            // Output the response from Apple
            error_log('Response from Apple: ' . $response);

            curl_close($ch);

            $tokenResponse = json_decode($response, true);

            // Check if token was successfully obtained
            if (!isset($tokenResponse['id_token'])) {
                throw new Exception('Failed to get id_token from Apple. Response: ' . $response);
            }

            // Manually decode id_token to get user information
            $idToken = $tokenResponse['id_token'];
            $jwtParts = explode('.', $idToken);

            // Decode header and payload
            $header = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $jwtParts[0])), true);
            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $jwtParts[1])), true);

            // Output the decoded header and payload
            error_log('Decoded JWT Header: ' . json_encode($header));
            error_log('Decoded JWT Payload: ' . json_encode($payload));

            // Get user information
            $appleUserID = $payload['sub'];
            $email = isset($payload['email']) ? $payload['email'] : null;

            // Output the decoded user information
            error_log('Decoded Apple User ID: ' . $appleUserID);
            error_log('Decoded Apple Email: ' . $email);

            // Find user in the database
            $user = $this->userModel->findUserByUsername($appleUserID);

            if ($user) {
                // User exists, login successful
                return json_encode(['success' => true, 'username' => $appleUserID]);
            } else {
                // User doesn't exist, create new user
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
            // Catch and log errors
            http_response_code(500);
            error_log("Apple callback error: " . $e->getMessage());
            return json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // Method to generate Apple client_secret
    private function generateAppleClientSecret() {
        $teamID = '6JYKKHR95S'; // Replace with your Apple Team ID
        $clientID = 'soberup.uq'; // Replace with your Apple Client ID
        $keyID = 'JLVZ497B48'; // Replace with your Key ID
        $privateKeyPath = __DIR__ . '/../AuthKey_JLVZ497B48.p8'; // Replace with the path to your private key file

        // Read private key file
        $privateKey = file_get_contents($privateKeyPath);

        // Ensure the path is correct and the private key exists
        if ($privateKey === false) {
            error_log('Private key not found or could not be read.');
            throw new Exception('Private key file could not be read.');
        }

        // Output private key path and content
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
            'exp' => time() + 3600, // Token valid for 1 hour
            'aud' => 'https://appleid.apple.com',
            'sub' => $clientID
        ];

        // Output header and claims
        error_log('JWT Header: ' . json_encode($header));
        error_log('JWT Claims: ' . json_encode($claims));

        // Encode header and payload
        $headerEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($header)));
        $claimsEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($claims)));

        // Output encoded header and claims
        error_log('Encoded JWT Header: ' . $headerEncoded);
        error_log('Encoded JWT Claims: ' . $claimsEncoded);

        $signature = '';
        $privateKeyResource = openssl_get_privatekey($privateKey);

        if ($privateKeyResource === false) {
            error_log('Failed to get private key resource.');
            throw new Exception('Invalid private key.');
        }

        // Sign JWT
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

        // Concatenate to generate client_secret
        $clientSecret = $headerEncoded . "." . $claimsEncoded . "." . $base64UrlSignature;

        // Output generated client_secret
        error_log('Generated client_secret: ' . $clientSecret);

        return $clientSecret;
    }

    public function findUserByEmail($email) {
        return $this->userModel->findUserByEmail($email);
    }

    // Submit OOBE data
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

    // User login
    public function login($data) {
        $user = $this->userModel->findUserByUsername($data['username']);
        if ($user && password_verify($data['password'], $user['password'])) {
            // Get current time and last reset time
            $currentDateTime = new DateTime();
            $lastResetTime = $user['lastReset']->toDateTime();
            $resetHour = 14; // 14:00

            // If current time is later than 14:00 of lastReset day or it's the next day, reset weeklyLimitUsed
            if ($currentDateTime > $lastResetTime->setTime($resetHour, 0)) {
                $this->userModel->updateUserInfoById($user['_id'], [
                    'weeklyLimitUsed' => 0,
                    'lastReset' => new MongoDB\BSON\UTCDateTime(time() * 1000) // Update to current time
                ]);
            }

            return json_encode(['success' => true, 'message' => 'Login successful']);
        } else {
            http_response_code(401);
            return json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    }

    // Get home page data
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

    // Record drink amount and update history
    public function recordDrink($username, $amount, $type) {
        try {
            $user = $this->userModel->findUserByUsername($username);
            if ($user) {
                $newWeeklyLimitUsed = $user['weeklyLimitUsed'] + $amount;
                $this->userModel->updateWeeklyLimitUsed($username, $newWeeklyLimitUsed);

                // Check if recordTime, recordValue, recordType exist, if not, initialize as empty arrays
                $recordTime = isset($user['recordTime']) ? $user['recordTime']->getArrayCopy() : [];
                $recordValue = isset($user['recordValue']) ? $user['recordValue']->getArrayCopy() : [];
                $recordType = isset($user['recordType']) ? $user['recordType']->getArrayCopy() : [];

                // Update history records
                array_push($recordTime, date('Y-m-d H:i:s'));  // Current time
                array_push($recordValue, $amount);  // Drink amount
                array_push($recordType, $type);  // Drink type

                // Update history records in the database
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

    // Get user history records
    public function getDrinkHistory($username) {
        $user = $this->userModel->findUserByUsername($username);
        if ($user) {
            // Check if history records exist
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

    // Get user information
    public function getUserInfo($username) {
        $user = $this->userModel->findUserByUsername($username);
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

    // update user information
    public function updateUserInfo($oldUsername, $data) {
        error_log("Updating user info for original username: " . $oldUsername);
        error_log("Data received for update: " . json_encode($data));

        // if passed newUsername，it means updating username
        if (isset($data['newUsername'])) {
            $newUsername = $data['newUsername'];

            // finding the original user
            $user = $this->userModel->findUserByUsername($oldUsername);
            if ($user) {
                // check if the new username already exists
                $existingUser = $this->userModel->findUserByUsername($newUsername);
                if ($existingUser) {
                    return json_encode(['success' => false, 'error' => 'Username already exists']);
                }

                // update username
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
            // if not updating username, update other user info
            $updateResult = $this->userModel->updateUserInfo($oldUsername, $data);
            if ($updateResult) {
                return json_encode(['success' => true, 'message' => 'User info updated successfully']);
            } else {
                error_log("Failed to update user info for username: $oldUsername");
                return json_encode(['success' => false, 'error' => 'Failed to update user info']);
            }
        }
    }

    // Delete user
    public function deleteUser($username) {
        $result = $this->userModel->deleteUser($username);
        if ($result) {
            return json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } else {
            http_response_code(500);
            return json_encode(['error' => 'Failed to delete user']);
        }
    }

    // Update username
    public function updateUsername($oldUsername, $newUsername) {
        // Find the old user
        $user = $this->userModel->findUserByUsername($oldUsername);
        if (!$user) {
            return json_encode(['error' => 'User not found']);
        }

        // Check if the new username already exists
        $existingUser = $this->userModel->findUserByUsername($newUsername);
        if ($existingUser) {
            return json_encode(['error' => 'Username already exists']);
        }

        // Use the old user's _id to update the username
        $updateResult = $this->userModel->updateUserById($user['_id'], ['username' => $newUsername]);

        if ($updateResult) {
            return json_encode(['success' => true, 'message' => 'Username updated successfully']);
        } else {
            return json_encode(['error' => 'Failed to update username']);
        }
    }

    // Clone user
    public function cloneUser($username, $newUsername) {
        // Find existing user
        $user = $this->userModel->findUserByUsername($username);
        if ($user) {
            unset($user['_id']);
            unset($user['username']);
            $user['username'] = $newUsername;

            // Preserve password hash
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
