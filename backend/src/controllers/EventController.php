<?php

require_once __DIR__ . '/../models/Event.php';  // use absolute path to load Event.php model

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
