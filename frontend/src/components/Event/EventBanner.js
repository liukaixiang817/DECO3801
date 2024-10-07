import React, { useState, useEffect, useRef } from "react";
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
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPosts();

        let final = data?.results || [];  // Check if data.results is null/undefined, default to empty array
        
        final = final.filter((event) => !isUnder15(event.age));  // Only filter if it's a valid array
        setEvents(final);
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

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (carouselRef.current) {
        const swipeDistance = eventData.deltaX;
        carouselRef.current.style.transform = `translateX(${-currentIndex * 100 + swipeDistance / 5}%)`;
      }
    },
    onSwipedLeft: () => goToNext(),
    onSwipedRight: () => goToPrevious(),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  });

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? events.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === events.length - 1 ? 0 : prevIndex + 1));
  };

  const handleCardClick = (eventData) => {
    const { subject, formatteddatetime, location, description, eventimage, venueaddress } = eventData;
    navigate(`/events/${subject}`, {
      state: { subject, formatteddatetime, location, description, eventimage, venueaddress },
    });
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transition = "transform 0.3s ease-out";
      carouselRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  if (isLoading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="event-banner-section">
      <h2>Events</h2>
      <div className="carousel-container" {...handlers}>
        <div className="carousel" ref={carouselRef}>
          {events.map((event, index) => (
            <div key={event.web_link} className="event-card1" onClick={() => handleCardClick(event)}>
              <div className="event-content1">
                <img src={event.eventimage} alt={event.subject} className="event-image1" />
              </div>
              <div className="event-title1">{event.subject}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventBanner;