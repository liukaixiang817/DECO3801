import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEventDetails } from '../api/apiClient';

const EventDetails = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        async function fetchEventDetails() {
            try {
                const eventDetails = await getEventDetails(eventId);
                setEvent(eventDetails);
            } catch (error) {
                console.error(error);
            }
        }

        fetchEventDetails();
    }, [eventId]);

    if (!event) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p>{event.location}</p>
            <p>{event.date}</p>
        </div>
    );
};

export default EventDetails;
