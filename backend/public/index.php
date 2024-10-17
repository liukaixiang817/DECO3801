<?php

//header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
//header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/config/database.php';
require __DIR__ . '/../src/controllers/ProfileController.php';
require __DIR__ . '/../src/controllers/EventController.php';
require __DIR__ . '/../src/controllers/UserController.php';

$database = new Database();
$db = $database->getDb();

header('Content-Type: application/json');

$requestMethod = $_SERVER["REQUEST_METHOD"];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathFragments = explode('/', trim($path, '/'));

// use UserController as the default controller
$controller = new UserController($db);

// add new /checkin router to handle checkin requests
if ($pathFragments[0] == 'checkin') {
    $controller = new ProfileController($db);
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['username'])) {
            echo $controller->checkin($data['username']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Username is required']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}
elseif ($pathFragments[0] == 'callback') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // Add logic to process $data, which may involve validating Apple login callback parameters
        // Add logging here to confirm the request has reached the backend
        error_log('Received callback request with data: ' . print_r($data, true));

        // Return example response
        echo json_encode(['message' => 'Callback received', 'data' => $data]);
    } else {
        http_response_code(405); // Method not allowed
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// New /apple-login route to handle Apple login requests
elseif ($pathFragments[0] == 'apple-login') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // Check if username and email exist in the request
        if (isset($data['username']) && isset($data['email'])) {
            echo $controller->appleLogin($data);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Username and email are required for Apple login']);
        }
    } else {
        http_response_code(405); // Method not allowed
        echo json_encode(['error' => 'Method not allowed']);
    }
}
// New /apple-callback route to handle Apple login callback
elseif ($pathFragments[0] == 'apple-callback') {
    if ($requestMethod == 'POST') {
        // Read and print the raw request body
        $rawBody = file_get_contents('php://input');
        error_log('Received raw body: ' . $rawBody);

        // Parse the `application/x-www-form-urlencoded` format request body
        parse_str($rawBody, $post_vars);

        // Print the parsed request body content
        error_log('Parsed post_vars: ' . print_r($post_vars, true));

        // Get code, state and id_token
        $code = $post_vars['code'] ?? null;
        $state = $post_vars['state'] ?? null;
        $id_token = $post_vars['id_token'] ?? null;

        error_log('Received apple-callback request with code: ' . $code);
        error_log('Received apple-callback request with state: ' . $state);
        error_log('Received id_token: ' . $id_token);

        if ($code && $state && $id_token) {
            try {
                // Decompose `id_token` (format: header.payload.signature)
                $id_token_parts = explode('.', $id_token);
                $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $id_token_parts[1])), true);

                // Print the decoded payload
                error_log('Decoded payload: ' . print_r($payload, true));

                // Extract email
                $email = $payload['email'] ?? null;

                if ($email) {
                    // Use the findUserByEmail method in User.php to find the user
                    $userModel = new User($db); // Create User model instance
                    $user = $userModel->findUserByEmail($email);

                    if ($user) {
                        // User exists, construct redirect to Home page
                        $username = $user['username'];
                        $redirectURL = "https://deco.lkx666.cn/home?username=" . urlencode($username) . "&email=" . urlencode($email);

                        // Perform redirect to Home
                        header("Location: $redirectURL");
                        exit;
                    } else {
                        // User does not exist, generate username and password then register
                        $username = explode('@', $email)[0]; // Use the first part of the email as username
                        $password = $email . '2024'; // Use email+2024 as password

                        // Register new user
                        $newUser = [
                            'username' => $username,
                            'email' => $email,
                            'password' => password_hash($password, PASSWORD_DEFAULT),
                            'lastReset' => new MongoDB\BSON\UTCDateTime(time() * 1000) // Initialize lastReset
                        ];

                        $result = $userModel->registerUser($newUser);

                        if ($result['success']) {
                            // Registration successful, construct redirect to OOBE page
                            $redirectURL = "https://deco.lkx666.cn/oobe?username=" . urlencode($username) . "&email=" . urlencode($email);

                            // Perform redirect to OOBE
                            header("Location: $redirectURL");
                            exit;
                        } else {
                            throw new Exception('Failed to create new user.');
                        }
                    }
                } else {
                    throw new Exception('Email not found in id_token payload.');
                }
            } catch (Exception $e) {
                error_log('Error decoding id_token or processing user: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Failed to process Apple callback']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Code, state, and id_token are required for Apple callback']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

elseif ($pathFragments[0] == 'profiles') {
    $controller = new ProfileController($db);
    if ($requestMethod == 'GET') {
        echo $controller->getProfiles();
    } elseif ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->createProfile($data);
    }
} elseif ($pathFragments[0] == 'events') {
    $controller = new EventController($db);
    if ($requestMethod == 'GET') {
        if (isset($pathFragments[1])) {
            echo $controller->getEvent($pathFragments[1]);
        } else {
            echo $controller->getEvents();
        }
    }
} elseif ($pathFragments[0] == 'register') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->register($data);
    }
} elseif ($pathFragments[0] == 'oobe') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // Check and ensure the hobbies field is included in the data
        if (isset($data['hobbies'])) {
            echo $controller->submitOOBE($data);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Hobbies are required']);
        }
    }
} elseif ($pathFragments[0] == 'login') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->login($data);
    }
} elseif ($pathFragments[0] == 'home' && isset($pathFragments[1])) {
    echo $controller->getHomeData($pathFragments[1]);
}

// Newly added recordDrink route handling logic
elseif ($pathFragments[0] == 'recordDrink') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->recordDrink($data['username'], $data['amount'], $data['type']);
    }
}

// Newly added getDrinkHistory route handling logic
elseif ($pathFragments[0] == 'getDrinkHistory' && isset($pathFragments[1])) {
    if ($requestMethod == 'GET') {
        echo $controller->getDrinkHistory($pathFragments[1]);
    }
}

// Add new /profileWithEmail route to get user data including email
elseif ($pathFragments[0] == 'profileWithEmail') {
    $controller = new ProfileController($db);
    if ($requestMethod == 'GET' && isset($_GET['username'])) {
        echo $controller->getProfileWithEmail($_GET['username']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request, username required']);
    }
}

// New /update-username route for updating username
elseif ($pathFragments[0] == 'update-username') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['oldUsername']) && isset($data['newUsername'])) {
            echo $controller->updateUsername($data['oldUsername'], $data['newUsername']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Old and new usernames are required']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

elseif ($pathFragments[0] == 'delete-user') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['username'])) {
            echo $controller->deleteUser($data['username']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Username is required']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Newly added update-limit route handling logic
elseif ($pathFragments[0] == 'update-limit') {
    $controller = new ProfileController($db);
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->updateWeeklyLimit($data['username'], $data['weekly_limit']);
    }
}

// Add new /body-info route to get or create body information
elseif ($pathFragments[0] == 'body-info') {
    $controller = new ProfileController($db);
    if ($requestMethod == 'POST') {  // Use POST request to pass username
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['username'])) {
            error_log("Fetching body info for username: " . $data['username']);
            echo $controller->getBodyInfo($data['username']);
        } else {
            http_response_code(400);
            error_log("Error: Username not provided in body-info request.");
            echo json_encode(['error' => 'Username is required']);
        }
    } else {
        http_response_code(405);  // Only allow POST requests
        error_log("Error: Method not allowed in body-info request.");
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// New /clone-user route for cloning users
elseif ($pathFragments[0] == 'clone-user') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['username']) && isset($data['newUsername'])) {
            echo $controller->cloneUser($data['username'], $data['newUsername']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Both username and newUsername are required']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Add new /update-body-info route to update body information
elseif ($pathFragments[0] == 'update-body-info') {
    $controller = new ProfileController($db);
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['username'])) {
            echo $controller->updateBodyInfo($data['username'], $data);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Username is required']);
        }
    } else {
        http_response_code(405);  // Only allow POST requests
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// New /user-info route for getting user information
elseif ($pathFragments[0] == 'user-info') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['username'])) {
            echo $controller->getUserInfo($data['username']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Username is required']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// New /update-user-info route for updating user information
elseif ($pathFragments[0] == 'update-user-info') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // Ensure that the hobbies field can be passed
        if (isset($data['username'])) {
            echo $controller->updateUserInfo($data['username'], $data);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Username is required']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// New /duplicate-user route for copying users and create a new user
elseif ($pathFragments[0] == 'duplicate-user') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['oldUsername']) && isset($data['newUsername'])) {
            echo $controller->duplicateUserWithNewUsername($data['oldUsername'], $data['newUsername']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Old and new username are required']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

else {
    http_response_code(404);
    echo json_encode(["message" => "Endpoint not found"]);
}
