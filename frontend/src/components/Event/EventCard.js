import React from "react";
import "./styles_event.css";

const EventCard = ({
  title,
  date,
  location,
  description,
  iconSrc,
  imageSrc,
}) => {
  return (
    <div className="event-card">
      <div className="container2">
        
        <div className="tittle-detail">
          <h1>{title}</h1>
          <div class="container">
            <img
              loading="lazy"
              src={iconSrc}
              alt={`${title} icon`}
              class="icon"
            />
            <div class="details">
              <div>{date}</div>
              <div>{location}</div>
            </div>
          </div>
          <div>{description}</div> 
        </div>

        <div className="align-right">
          <img
            loading="lazy" src={imageSrc}
            alt={`${title} event`}
            className="aligned-image"
          />
         
        </div>
        
      </div>
      
    </div>
  );
};

export default EventCard;
