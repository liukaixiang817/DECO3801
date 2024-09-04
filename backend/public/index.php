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
} else {
    http_response_code(404);
    echo json_encode(["message" => "Endpoint not found"]);
}
