import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable"; 
import "./styles_event.css"; // Assuming your styles are defined here
import { getAllPosts } from "./api.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// EventBanner Component
const EventBanner = () => {
  const [events, setEvents] = useState([]); // Store fetched events
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // To track the current event

  // Fetch event data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPosts();
        setEvents(data.results); 
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts. Please try again later.");
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Go to the previous event
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : events.length - 1));
  };

  // Go to the next event
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < events.length - 1 ? prevIndex + 1 : 0));
  };

  // Configure swipe gestures using react-swipeable
  const handlers = useSwipeable({
    onSwipedLeft: goToNext,  // Swipe left to go to the next event
    onSwipedRight: goToPrevious,  // Swipe right to go to the previous event
    preventDefaultTouchmoveEvent: true,
    trackMouse: true, // Also allow mouse dragging for desktop users
  });

  if (isLoading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="event-banner-section">
      <h6>Events</h6>
      <div className="slider-container" {...handlers}>
        {/* Show only the current event */}
        {events.length > 0 && (
          <div className="event-card-square">
            
                <div className="event-content" onMouseDown={(e) => e.preventDefault()}><img
              src={events[currentIndex].eventimage} // Adjust based on your event data
              alt={events[currentIndex].subject} // Adjust based on event data
              className="event-image1"
            />
                </div>
            
            <div className="event-title1">{events[currentIndex].subject}</div>
          </div>
        )}  
      </div>
      <div className="icon-container">
        <div className="back-button">
<FontAwesomeIcon icon="fa-solid fa-arrows-left-right-to-line" size="2x" beatFade/>

        </div>
        
      </div>
      
    </section>
  );
};

export default EventBanner;
