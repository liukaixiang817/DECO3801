import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import "./styles_event.css";
import { getAllPosts } from "./api.js";
import GoogleMap from "./GoogleMap.js";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons"; // Import all solid icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams ,useNavigate} from "react-router-dom";

const EventComponent = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState("");
  const [visibleCount, setVisibleCount] = useState(10); // Track number of visible events

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPosts();

        let final = data?.results || [];  // Check if data.results is null/undefined, default to empty array
        
        final = final.filter((event) => event.eventimage && !isUnder15(event.age)); 

        setPosts(final); // Adjust if needed based on actual response structure
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

   // Helper function to check if an age range is less than 15
   const isUnder15 = (ageString) => {
    // Check if ageString is null or undefined
    if (!ageString) {
      return false; 
    }
  
    // Extract numbers from the age string using regex
    const ageNumbers = ageString.match(/\d+/g);
    
    if (!ageNumbers) {
      return false;
    }
  
    const ageNumbersAsNumbers = ageNumbers.map(Number);
  
    // Check if any of the extracted numbers are below 15
    return ageNumbersAsNumbers.some((age) => age < 15);
  };

  const types = posts.map(event => event.event_type);

  const uniqueTypes = Array.from(new Set(
    types
      .filter(item => item !== null && item !== undefined) // Filter out null/undefined values
      .flatMap(item => item
        .split(/[,]+/) // Split by commas, "and", "&", and spaces
      )
      .filter(word => word.trim() !== '') // Remove any empty strings from the split
  ));

  const navigate = useNavigate();

 

  const result = selectedEventType
    ? posts.filter(event => {
        if (!event.event_type) return false;
        return event.event_type
          .split(/[,]+/) // Split the event_type into individual words
          .includes(selectedEventType); // Check if selectedEventType is included
      })
    : posts;

  const handleChange = (event) => {
    setSelectedEventType(event.target.value);
  }

  const loadMoreEvents = () => {
    setVisibleCount(prevCount => prevCount + 10); // Increase the visible count by 10
  }

  return (
      <div className="home-container">
  

        <div>
          <GoogleMap events={result.slice(0, visibleCount)}></GoogleMap>
          <div className="container2">
            <h1 style={{marginRight: '10px'}}>
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

          <div className="event-card-container">
            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : Array.isArray(result) && result.length > 0 ? (
                result.slice(0, visibleCount).map((event) => (
                    <EventCard key={event.id} {...event} />
                ))
            ) : (
                <p>No events available.</p>
            )}
          </div>

          {result.length > visibleCount && (
              <h3_0 onClick={loadMoreEvents}>
                See More Events...
              </h3_0>
          )}
        </div>
      </div>
  );
}

export default EventComponent;
