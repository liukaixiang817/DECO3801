import React, { useEffect, useRef } from 'react';

const GoogleMap = ({addresses}) => {
    const mapRef = useRef(null);
    const geocoder = useRef(null);
    const mapInstance = useRef(null);
  
    useEffect(() => {
      if (window.google) {
        // Initialize the map
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: -27.4698, lng: 153.0251 }, // Default center
          zoom: 12,
        });
  
        // Initialize the Geocoder service
        geocoder.current = new window.google.maps.Geocoder();
  
        // Convert addresses to coordinates and place markers
        addresses.forEach(address => {
          geocodeAddress(geocoder.current, mapInstance.current, address);
        });
      }
    }, [addresses]);
  
    // Geocode an address and add marker
    const geocodeAddress = (geocoder, map, address) => {
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
          // Create a marker for each address
          new window.google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
          });
          map.setCenter(results[0].geometry.location); // Optionally adjust the center based on results
        } else {
          console.error(`Geocode was not successful for the following reason: ${status}`);
        }
      });
    };
  
    return (
      <div>
        <h1>Google Map with Markers</h1>
        <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
      </div>
    );
  };
  
  export default GoogleMap;