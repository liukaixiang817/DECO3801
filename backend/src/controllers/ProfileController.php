<?php

require_once __DIR__ . '/../models/Profile.php';  // 使用绝对路径加载 Profile.php 模型

class ProfileController {
    private $profileModel;

    public function __construct($db) {
        $this->profileModel = new Profile($db);
    }

    public function getProfiles() {
        return json_encode($this->profileModel->getAllProfiles());
    }

    public function createProfile($data) {
        return json_encode($this->profileModel->createProfile($data));
    }
}
