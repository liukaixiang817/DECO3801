import React from "react";
import "./styles_event.css";
import { useNavigate } from "react-router-dom";

const EventCard = ({
  subject,
  formatteddatetime,
  location,
  description,
  eventimage,venueaddress
,
}) => {
  const navigate = useNavigate(); 

  const handleCardClick = () => {
    console.log("clikced")
    navigate(`/events/${subject}`, { state: { subject, formatteddatetime, location, description, eventimage,venueaddress
    } });
  };
  const iconSrc = "https://cdn.builder.io/api/v1/image/assets/TEMP/d50644bf300f88c4b073e9440d7509ea88e9002f002aa761d1917debe430277a?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77";
///Chat gpt
let finalResult;

if (subject.length > 40) {
    const nextSpaceIndex = subject.indexOf(' ', 40);
    finalResult = nextSpaceIndex !== -1 
        ? subject.substring(0, nextSpaceIndex)  
        : subject.substring(0, 40);           
} else {
    finalResult = subject;                     
}



  const getFirstSentence = (text) => {
   
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    return sentences[0] || '';
  };

  const firstSentence = getFirstSentence(description);
 
  return (
    <div className="event-card" onClick={handleCardClick}>
    
      <div className="card-info">
        <h6>{finalResult}</h6>
        <div className="card-icon-details">
          <img
            loading="lazy"
            src={iconSrc}
            alt={`${subject} icon`}
            className="icon"
          />
          <div className="details">
            <div>{formatteddatetime}</div>
            <div>{location}</div>
          </div>
        </div>
        <p>{firstSentence}</p>
      </div>
      

        <img
        loading="lazy"
        src={eventimage}
        alt={`${subject} event`}
        className="event-image"
        
      />

      


      






    </div>
  );
  
};

export default EventCard;
