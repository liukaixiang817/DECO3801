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

// 默认情况下使用 UserController
$controller = new UserController($db);

// 添加新的 /checkin 路由处理签到请求
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

        // 添加对 $data 的处理逻辑，这可能涉及验证苹果登录回调的参数
        // 这里可以添加日志记录以确认请求到达后端
        error_log('Received callback request with data: ' . print_r($data, true));

        // 返回示例响应
        echo json_encode(['message' => 'Callback received', 'data' => $data]);
    } else {
        http_response_code(405); // Method not allowed
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// 新增 /apple-login 路由处理苹果登录请求
elseif ($pathFragments[0] == 'apple-login') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // 检查请求中是否存在 username 和 email
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
// 新增 /apple-callback 路由处理苹果登录回调
// 新增 /apple-callback 路由处理苹果登录回调
elseif ($pathFragments[0] == 'apple-callback') {
    if ($requestMethod == 'POST') {
        // 读取并打印原始请求体
        $rawBody = file_get_contents('php://input');
        error_log('Received raw body: ' . $rawBody);

        // 解析 `application/x-www-form-urlencoded` 格式的请求体
        parse_str($rawBody, $post_vars);

        // 打印解析后的请求体内容
        error_log('Parsed post_vars: ' . print_r($post_vars, true));

        // 获取 code、state 和 id_token
        $code = $post_vars['code'] ?? null;
        $state = $post_vars['state'] ?? null;
        $id_token = $post_vars['id_token'] ?? null;

        error_log('Received apple-callback request with code: ' . $code);
        error_log('Received apple-callback request with state: ' . $state);
        error_log('Received id_token: ' . $id_token);

        if ($code && $state && $id_token) {
            try {
                // 分解 `id_token` (格式：header.payload.signature)
                $id_token_parts = explode('.', $id_token);
                $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $id_token_parts[1])), true);

                // 打印解码后的 payload
                error_log('Decoded payload: ' . print_r($payload, true));

                // 提取 email
                $email = $payload['email'] ?? null;

                if ($email) {
                    // 使用 User.php 中的 findUserByEmail 方法查找用户
                    $userModel = new User($db); // 创建 User 模型实例
                    $user = $userModel->findUserByEmail($email);

                    if ($user) {
                        // 用户已存在，构造跳转到 Home 页面
                        $username = $user['username'];
                        $redirectURL = "https://deco.lkx666.cn/home?username=" . urlencode($username) . "&email=" . urlencode($email);

                        // 执行跳转到 Home
                        header("Location: $redirectURL");
                        exit;
                    } else {
                        // 用户不存在，生成用户名和密码后注册
                        $username = explode('@', $email)[0]; // 使用邮箱的前部分作为用户名
                        $password = $email . '2024'; // 以邮箱+2024作为密码

                        // 注册新用户
                        $newUser = [
                            'username' => $username,
                            'email' => $email,
                            'password' => password_hash($password, PASSWORD_DEFAULT),
                            'lastReset' => new MongoDB\BSON\UTCDateTime(time() * 1000) // 初始化 lastReset
                        ];

                        $result = $userModel->registerUser($newUser);

                        if ($result['success']) {
                            // 注册成功，构造跳转到 OOBE 页面
                            $redirectURL = "https://deco.lkx666.cn/oobe?username=" . urlencode($username) . "&email=" . urlencode($email);

                            // 执行跳转到 OOBE
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

        // 检查并确保 hobbies 字段包含在数据中
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

// 新添加的 recordDrink 路由处理逻辑
elseif ($pathFragments[0] == 'recordDrink') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->recordDrink($data['username'], $data['amount'], $data['type']);
    }
}

// 新添加的 getDrinkHistory 路由处理逻辑
elseif ($pathFragments[0] == 'getDrinkHistory' && isset($pathFragments[1])) {
    if ($requestMethod == 'GET') {
        echo $controller->getDrinkHistory($pathFragments[1]);
    }
}

// 添加新的 /profileWithEmail 路由来获取包含 email 的用户数据
elseif ($pathFragments[0] == 'profileWithEmail') {
    $controller = new ProfileController($db);
    if ($requestMethod == 'GET' && isset($_GET['username'])) {
        echo $controller->getProfileWithEmail($_GET['username']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request, username required']);
    }
}

// 新增的 /update-username 路由，用于更新用户名
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

// 新添加的 update-limit 路由处理逻辑
elseif ($pathFragments[0] == 'update-limit') {
    $controller = new ProfileController($db);
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->updateWeeklyLimit($data['username'], $data['weekly_limit']);
    }
}

// 添加新的 /body-info 路由来获取或创建身体信息
elseif ($pathFragments[0] == 'body-info') {
    $controller = new ProfileController($db);
    if ($requestMethod == 'POST') {  // 使用 POST 请求传递 username
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
        http_response_code(405);  // 只允许 POST 请求
        error_log("Error: Method not allowed in body-info request.");
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// 新增的 /clone-user 路由，用于克隆用户
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

// 添加新的 /update-body-info 路由来更新身体信息
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
        http_response_code(405);  // 只允许 POST 请求
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// 新增的 /user-info 路由，用于获取用户信息
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

// 新增的 /update-user-info 路由，用于更新用户信息
elseif ($pathFragments[0] == 'update-user-info') {
    if ($requestMethod == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // 确保 hobbies 字段可以被传递
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

// 新增的 /duplicate-user 路由，用于复制用户并创建新用户
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
