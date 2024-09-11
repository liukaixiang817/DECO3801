import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEventDetails } from '../../api/apiClient';
import { useLocation } from "react-router-dom";

const EventDetails = () => {
    const { state } = useLocation();
    const {id, subject, formatteddatetime, location, description, eventimage } = state || {};
    const iconSrc = "https://cdn.builder.io/api/v1/image/assets/TEMP/d50644bf300f88c4b073e9440d7509ea88e9002f002aa761d1917debe430277a?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77";
    return (
        <div className='home-container'>
            <img
            loading="lazy" src={eventimage
            }
            alt={`${subject} event`}
            className="aligned-image"
          />
            <h2>{subject}</h2>
            <id>{id}</id>
            <h1>{description}</h1>
            <img
              loading="lazy"
              src={iconSrc}
              alt={`${subject} icon`}
              class="icon"
            />
            <h1>{location}</h1>
            <h1>{formatteddatetime}</h1>
        </div>
    );
};

export default EventDetails;
