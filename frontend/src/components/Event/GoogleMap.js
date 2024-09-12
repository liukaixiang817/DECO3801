import React, { useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';

 // If using react-router-dom for navigation

const GoogleMap = ({ events }) => {
  const mapRef = useRef(null);
  const geocoder = useRef(null);
  const mapInstance = useRef(null);
  const navigate = useNavigate(); // If using react-router-dom for navigation

  useEffect(() => {
    if (window.google) {
      // Initialize the map
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: -27.4698, lng: 153.0251 }, // Default center
        zoom: 12,
      });

      // Initialize the Geocoder service
      geocoder.current = new window.google.maps.Geocoder();

      // Convert addresses to coordinates and place markers for each event
      events.forEach(event => {
        geocodeAddress(geocoder.current, mapInstance.current, event);
      });
    }
  }, [events]); 

  // Geocode an event's venue address and add marker
  const geocodeAddress = (geocoder, map, event) => {
    geocoder.geocode({ address: event.venueaddress }, (results, status) => {
      if (status === 'OK') {
        // Create a marker for each venue address
        const marker = new window.google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          title: event.subject  // Correct property name
        });
        console.log(event);

        // Add click listener to the marker to redirect to the event's page
        const { subject, formatteddatetime, location, description, eventimage, venueaddress } = event;

        marker.addListener('click', () => {
            navigate(`/events/${subject}`, { state: { subject, formatteddatetime, location, description, eventimage,venueaddress
            } });
          });

        // Optionally, adjust the center based on the first marker's position
        map.setCenter(results[0].geometry.location);
      } else {
        console.error(`Geocode was not successful for the following reason: ${status}`);
      }
    });
  };

  return (
    <div>
      <h1>Google Map with Event Markers</h1>
      <div ref={mapRef} style={{ height: '300px', width: '100%' ,borderRadius: "10px"}}></div>
    </div>
  );
};

export default GoogleMap;
