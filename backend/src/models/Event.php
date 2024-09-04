<?php

class Event {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAllEvents() {
        return $this->db->events->find()->toArray();
    }

    public function getEventById($id) {
        return $this->db->events->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
    }
}
