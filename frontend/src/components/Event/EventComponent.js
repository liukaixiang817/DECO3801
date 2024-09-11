import React from 'react';
import { useEffect, useState } from 'react';
import EventCard from './EventCard';
import './styles_event.css';
import { getAllPosts } from './api.js'

const EventComponent = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const data = await getAllPosts();
          setPosts(data); // Save the fetched data to the state
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      };
  
      fetchData();
    }, []); 
  




  const events = [
    {
      title: "Ekka",
      date: "16 August 2024",
      location: "Brisbane CBD",
      description: "The Ekka is Queensland's largest annual event and your greatest chance throughout the year to find out what life on the farm is really about.",
      iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/d50644bf300f88c4b073e9440d7509ea88e9002f002aa761d1917debe430277a?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77",
      imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/5cd541db6b61016910fe7aaf655fcef3582fb639326153debb2eb11e5c974dcd?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77"
    },
    {
      title: "Yoga",
      date: "16 August 2024",
      location: "Brisbane CBD",
      description: "Yoga is a very relaxing sport please come and enjoy",
      iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/6d1a9bc8a838dbf8a23374b53091241e15746fdfd25e3986b3b97cc13e9e2896?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77",
      imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/04e29ed704695ed3e153efb330a15b86e9a3241fa79db0e289329a69514baba3?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77"
    },
    {
      title: "Yoga",
      date: "16 August 2024",
      location: "Brisbane CBD",
      description: "Yoga is a very relaxing sport please come and enjoy",
      iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/6d1a9bc8a838dbf8a23374b53091241e15746fdfd25e3986b3b97cc13e9e2896?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77",
      imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/04e29ed704695ed3e153efb330a15b86e9a3241fa79db0e289329a69514baba3?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77"
    }
  ];

  return (
    <div className="home-container">
        
    <div>
      <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/f496a7f9dfc19cbf69462b093c2c06e7467fb1e8d76c01d4052031f8df597e99?placeholderIfAbsent=true&apiKey=76f8b71ab3b7474aba4b6ca190f84a77" alt="Event banner" className="object-contain self-stretch mt-1.5 w-full rounded-3xl aspect-[1.74]" />
      <h1 className="self-start mt-7 ml-3 text-2xl font-bold tracking-tight">Recommended events</h1>
      {events.map((event, index) => (
        <EventCard key={index} {...event} />
      ))}
    </div>


    </div>
    
  );
}

export default EventComponent;