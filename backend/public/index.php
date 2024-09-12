<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

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

if ($pathFragments[0] == 'profiles') {
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
        echo $controller->submitOOBE($data);
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
        echo $controller->recordDrink($data['username'], $data['amount']);
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
