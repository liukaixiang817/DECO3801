<?php

require_once __DIR__ . '/../models/Event.php';  // 使用绝对路径加载 Event.php 模型

class EventController {
    private $eventModel;

    public function __construct($db) {
        $this->eventModel = new Event($db);
    }

    public function getEvents() {
        return json_encode($this->eventModel->getAllEvents());
    }

    public function getEvent($id) {
        return json_encode($this->eventModel->getEventById($id));
    }
}
