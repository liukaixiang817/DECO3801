<?php

require __DIR__ . '/../../vendor/autoload.php';  // use absolute path to load autoload.php

use MongoDB\Client;

class Database {
    private $client;
    private $db;

    public function __construct() {
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->load();

        $this->client = new Client($_ENV['MONGO_URI']);
        $this->db = $this->client->selectDatabase($_ENV['MONGO_DB']);
    }

    public function getDb() {
        return $this->db;
    }
}
