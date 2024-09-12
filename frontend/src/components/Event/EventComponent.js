import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import "./styles_event.css";
import { getAllPosts } from "./api.js";
import GoogleMap from "./GoogleMap.js";

const EventComponent = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState("");
  

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
 

  const result = selectedEventType
  ? posts.filter(event => event.event_type === selectedEventType)
  : posts;
  const addresses = result.map(event  => event.venueaddress)
  console.log("events are");
  console.log(result);
  const handleChange = (event) => {
    setSelectedEventType(event.target.value);
    // Currently doing nothing with the selection
    // Y
  }

     return (
    <div className="home-container">
      <div>
       <GoogleMap events = {result}></GoogleMap>
        
        <h1 className="self-start mt-7 ml-3 text-2xl font-bold tracking-tight">
          Recommended events
        </h1>

        <select value={selectedEventType} onChange={handleChange}>
          <option value="">Select event type</option>
          {eventTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>


        {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : Array.isArray(posts) && posts.length > 0 ? (
        result.map((event) => (
          <EventCard key={event.subject} {...event} />
        ))
      ) : (
        <p>No events available.</p>
      )}
      </div>
    </div>
  );
  }



export default EventComponent;
