import React from 'react';
import './styles_event.css';

const EventCard = ({ title, date, location, description, iconSrc, imageSrc }) => {
  return (
    <div className='event-card'>
      <div>
        <div>
          <div>
            <div>{title}</div>
            <img loading="lazy" src={iconSrc} alt={`${title} icon`} />
          </div>
          <div>
            <div>{date}</div>
            <div>{location}</div>
          </div>
        </div>
        <div>{description}</div>
      </div>
      <img loading="lazy" src={imageSrc} alt={`${title} event`} />
    </div>
  );
}

export default EventCard;
