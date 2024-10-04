import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventDetails } from "../../api/apiClient";
import { useLocation } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons"; // Import all solid icons
// import { fas1 } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Add the entire set of solid icons to the library
library.add(fas);
// library.add(fas1);

const EventDetails = () => {

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };
  const { state } = useLocation();
  const {
    id,
    subject,
    formatteddatetime,
    location,
    description,
    eventimage,
    venueaddress,
  } = state || {};

  const iconSrc =
    "https://cdn.builder.io/api/v1/image/assets/TEMP/d50644bf300f88c4b073e9440d7509ea88e9002f002aa761d1917debe430277a?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77";
  const query = encodeURIComponent(venueaddress); // Encode the address for use in a URL
  const google = "https://maps.google.com/?q=";
  const result = google + query;

  const [date, time] = formatteddatetime.split(", ").slice(1, 3);


  return (
    <div className="home-container">
      <div className="back-button">
          <FontAwesomeIcon icon="fa-solid fa-angle-left" size="2x" color="#419779" onClick={handleGoBack}/>
      </div>
      <div className="aligned-image">
        <img
          loading="lazy"
          src={eventimage}
          alt={`${subject} event`}

        />
      </div>


      <div className="container2">
        <h1>{subject}</h1>
      </div>
      <id>{id}</id>
      <h3_1>{description}</h3_1>
      <div className="container3">
        <FontAwesomeIcon

          icon="fa-solid fa-map-pin"
          style={{ color: "#569970", width: "10%" }}
          size="3x"
          bounce
        />
        <h2 style={{ marginLeft: "20px" }}>{location}</h2>
      </div>

      <div className="container3">
        <FontAwesomeIcon icon="fa-solid fa-calendar-days" style={{ color: "#569970", width: "10%", marginRight: "20px" }}
          size="3x"
          flip />
        <div >
          <h2 style={{ marginBottom: "0px" }}>Date: {date}</h2>
          <h2 style={{ marginTop: "0px" }}>Time: {time}</h2>
        </div>
      </div>
      <div className="container3">
        <FontAwesomeIcon
          style={{ color: "#569970", width: "10%" }}
          icon="fa-solid fa-map-location-dot"
          size="3x"
          beat
        />
        <a
          href={result}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#68919c",
            fontSize: "18px",
            textDecoration: "underline",
            marginLeft: "20px",
          }}
        >
          {venueaddress}
        </a>
      </div>
    </div>
  );
};

export default EventDetails;
