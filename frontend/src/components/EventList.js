import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../api/apiClient';

const EventList = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const eventsData = await getEvents();
                setEvents(eventsData);
            } catch (error) {
                console.error(error);
            }
        }

        fetchEvents();
    }, []);

    return (
        <div>
            <h2>Recommended Events</h2>
            {events.map(event => (
                <div key={event.id}>
                    <h3>{event.title} - {event.date}</h3>
                    <p>{event.description}</p>
                    <Link to={`/events/${event.id}`}>View Details</Link>
                </div>
            ))}
        </div>
    );
};

export default EventList;
