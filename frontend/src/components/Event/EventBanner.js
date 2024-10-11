import React, { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { getAllPosts } from "./api.js";
import { useNavigate } from "react-router-dom";
import "./styles_event.css";
import { fetchBodyInfo, fetchHomeData } from '../../api/apiClient';

const EventBanner = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const [hobbies, setHobbies] = useState([]);

  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    console.log("Stored username from localStorage:", storedUsername);

    if (storedUsername) {
      fetchHomeData(storedUsername)
        .then(data => fetchBodyInfo(storedUsername))
        .then(historyData => {
          // Check if historyData exists and has a valid recordTime array
          if (historyData.hobbies) {
            // Process recordTime if valid
            setHobbies(historyData.hobbies);
            console.log("history data");
            console.log(historyData.hobbies);
          } else {
            // Handle the case where there's no drink history
            console.log("No drink history found.");
            setHobbies([]);  // Set history to an empty array
          }
        })
        .catch(error => {
          console.error("Error fetching drink history:", error);
          setHobbies([]);  // In case of error, set history to an empty array
        });
    } else {
      console.log("No users found.");
    }}
    
    , []);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPosts();

        let final = data?.results || [];  // Check if data.results is null/undefined, default to empty array
        
        final = final.filter((event) => event.eventimage && !isUnder15(event.age));  // Only filter if it's a valid array
        
     
        const selectedEventTypes = hobbies;
        
        const result = selectedEventTypes.length > 0
        ? final.filter(event => {
            if (!event.event_type) return false;
            // Split the event_type into individual words and check if any selectedEventTypes are included
            const eventTypes = event.event_type.split(/[,]+/);
            return selectedEventTypes.some(selectedType => 
              eventTypes.includes(selectedType)
            );
          })
        : final;
        
        setEvents(result);
        setIsLoading(false);
      } catch (error) {
       
        setError("Failed to load posts. Please try again later.");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [hobbies]);

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
        const maxTranslate = -(events.length - 2) * 100;
        
        // Prevent swiping left at the last event
        if (currentIndex === events.length - 2 && swipeDistance < 0) {
          return;
        }
        
        // Prevent swiping right at the first event
        if (currentIndex === 0 && swipeDistance > 0) {
          return;
        }
        
        const newTranslate = Math.max(maxTranslate, Math.min(0, -currentIndex * 100 + swipeDistance / 5));
        carouselRef.current.style.transform = `translateX(${newTranslate}%)`;
      }
    },
    onSwipedLeft: () => {
      if (currentIndex < events.length - 2) {
        goToNext();
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        goToPrevious();
      }
    },
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  });

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => Math.min(events.length - 1, prevIndex + 1));
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
      const newTranslate = -currentIndex * 100;
      carouselRef.current.style.transform = `translateX(${newTranslate}%)`;
    }
  }, [currentIndex]);

  useEffect(() => {
    const lastCard = document.querySelector('.event-card1:last-child');
    if (lastCard) {
      if (currentIndex === events.length - 1) {
        lastCard.classList.add('last-card');
      } else {
        lastCard.classList.remove('last-card');
      }
    }
  }, [currentIndex, events.length]);

  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        const newTranslate = Math.max(-(events.length - 1) * 100, Math.min(0, -currentIndex * 100));
        carouselRef.current.style.transform = `translateX(${newTranslate}%)`;
      }
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, events.length]);

  if (isLoading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="event-banner-section">
      <h3>Events</h3>
      <div className="h3_0">&#8592;Swipe left to see more</div>
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