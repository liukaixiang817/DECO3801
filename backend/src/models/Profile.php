<?php

class Profile {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAllProfiles() {
        return $this->db->profiles->find()->toArray();
    }

    public function createProfile($data) {
        return $this->db->profiles->insertOne($data);
    }
}
