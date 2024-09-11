import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import "./styles_event.css";
import { getAllPosts } from "./api.js";

const EventComponent = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPosts();
        setPosts(data.results); // Adjust if needed based on actual response structure
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  console.log(posts);

     return (
    <div className="home-container">
      <div>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/f496a7f9dfc19cbf69462b093c2c06e7467fb1e8d76c01d4052031f8df597e99?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77"
          alt="Event banner"
          className="responsive-image"
        />
        <h1 className="self-start mt-7 ml-3 text-2xl font-bold tracking-tight">
          Recommended events
        </h1>
        {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : Array.isArray(posts) && posts.length > 0 ? (
        posts.map((event) => (
          <EventCard key={event.id} {...event} />
        ))
      ) : (
        <p>No events available.</p>
      )}
      </div>
    </div>
  );
  }



export default EventComponent;
