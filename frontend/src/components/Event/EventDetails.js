import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEventDetails } from '../../api/apiClient';
import { useLocation } from "react-router-dom";

const EventDetails = () => {
    const { state } = useLocation();
    const {id, subject, formatteddatetime, location, description, eventimage,venueaddress } = state || {};
    const iconSrc = "https://cdn.builder.io/api/v1/image/assets/TEMP/d50644bf300f88c4b073e9440d7509ea88e9002f002aa761d1917debe430277a?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77";
    const query = encodeURIComponent(venueaddress); // Encode the address for use in a URL
    const google = "https://maps.google.com/?q=";
    const result = google + query;

    return (
        <div className='home-container'>
            <img
            loading="lazy" src={eventimage
            }
            alt={`${subject} event`}
            className="aligned-image" style={{ borderRadius: '10px' }}
          />
            <h2>{subject}</h2>
            <id>{id}</id>
            <div>{description}</div>
            <img
              loading="lazy"
              src={iconSrc}
              alt={`${subject} icon`}
              class="icon"
              
            />
            <h1>{location}</h1>
            <a href={result} target="_blank" rel="noopener noreferrer" style={{ color: 'green', fontSize: '20px', textDecoration: 'underline', }}>

            
            
        {venueaddress}
      </a><h1>{formatteddatetime}</h1>
        </div>
    );
};

export default EventDetails;
