import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable"; 
import { getAllPosts } from "./api.js";
import { useNavigate } from "react-router-dom";
import "./styles_event.css";

const EventBanner = () => {
  const [events, setEvents] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const navigate = useNavigate();

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

  // Swipeable handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => goToNext(),
    onSwipedRight: () => goToPrevious(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // Go to the previous set of events
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? events.length - 3 : prevIndex - 3
    );
  };

  // Go to the next set of events
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= events.length - 3 ? 0 : prevIndex + 3
    );
  };

  // Handle click on event card
  const handleCardClick = (eventData) => {
    const { subject, formatteddatetime, location, description, eventimage, venueaddress } = eventData;
    navigate(`/events/${subject}`, {
      state: { subject, formatteddatetime, location, description, eventimage, venueaddress },
    });
  };

  // Helper function to get event by index, wrapping around if necessary
  const getEventByIndex = (index) => {
    return events[index % events.length];
  };

  if (isLoading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="event-banner-section">
      <h6>Events</h6>
      <div className="slider-container" {...handlers}>
        {events.length > 0 && (
          <>
            {/* Display 3 events at a time */}
            {[0, 1, 2].map((offset) => {
              const event = getEventByIndex(currentIndex + offset);
              return (
                <div key={event.subject} className="event-card-square" onClick={() => handleCardClick(event)}>
                  <div className="event-content">
                    <img
                      src={event.eventimage}
                      alt={event.subject}
                      className="event-image1"
                    />
                  </div>
                  <div className="event-title1">{event.subject}</div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
};

export default EventBanner;
