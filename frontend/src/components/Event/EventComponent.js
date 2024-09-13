import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import "./styles_event.css";
import { getAllPosts } from "./api.js";
import GoogleMap from "./GoogleMap.js";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons"; // Import all solid icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const EventComponent = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPosts();
        setPosts(data.results); // Adjust if needed based on actual response structure
        const types = [...new Set(data.results.map(event => event.event_type))];
        setEventTypes(types);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  if (isLoading == false){
    
  }

  const types = posts.map(event => event.event_type);

  console.log("This is all the unique types");
  console.log(types.length);
  console.log(Array.isArray(types));
  console.log(types);

  const uniqueTypes = Array.from(new Set(
    types
      .filter(item => item !== null && item !== undefined) // Filter out null/undefined values
      .flatMap(item => item
        // Convert to lowercase for consistent comparison
        .split(/[,]+/) // Split by commas, "and", "&", and spaces
      )
      .filter(word => word.trim() !== '') // Remove any empty strings from the split
  ));

  console.log(uniqueTypes);

  // const result = selectedEventType
  //   ? posts.filter(event => event.event_type.contains(selectedEventType))
  //   : posts;

  const result = selectedEventType
  ? posts.filter(event => {
      // Check if event.event_type is not null, undefined, or an empty string
      if (!event.event_type) return false;

      return event.event_type
         // Convert to lowercase for consistent comparison
        .split(/[,]+/) // Split the event_type into individual words
        .includes(selectedEventType); // Check if selectedEventType is included
    })
  : posts;
  const addresses = result.map(event => event.venueaddress)
  
  // console.log("events are");
  // console.log(result);
  const handleChange = (event) => {
    setSelectedEventType(event.target.value);
    // Currently doing nothing with the selection
    // Y
  }

  const loadMoreEvents = () => {
    setVisibleCount(prevCount => prevCount + 10); // Increase the visible count by 10
  }

  return (
    <div className="home-container">
      <div className="back-button">
        <FontAwesomeIcon icon="fa-solid fa-angle-left " size="2x" shake/>
      </div>

    
      <div>
        <GoogleMap events={result}></GoogleMap>
        <div className="container2">
          <h1 style={{ marginRight: '10px' }}>
            Recommended events
          </h1>
          <select
            className="select-box"
            value={selectedEventType}
            onChange={handleChange}
          >
            <option value="">Select event type</option>
            {uniqueTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div className="event-card-container"></div>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : Array.isArray(posts) && posts.length > 0 ? (
          result.map((event) => (
            <EventCard key={event} {...event} />
          ))
        ) : (
          <p>No events available.</p>
        )}
        
      </div>
    </div>
  );
}



export default EventComponent;
