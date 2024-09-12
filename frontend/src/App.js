import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import EventList from './components/EventList';
import EventDetails from './components/Event/EventDetails';
import Navigation from './components/Navigation';
import RecordDrinks from './components/RecordDrinks';
import Registration from './components/Registration';
import OOBE from './components/OOBE';
import EventComponent from './components/Event/EventComponent';

// import Login from './components/Login';

const App = () => {
    // Always set isLoggedIn to true for now
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    // Remove the login check
    // useEffect(() => {
    //     const checkLogin = () => {
    //         const loggedIn = localStorage.getItem('isLoggedIn');
    //         setIsLoggedIn(loggedIn === 'true');
    //     };
    //     checkLogin();
    // }, []);

    return (
        <Router>
            {isLoggedIn && <Navigation />}
            <AppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        </Router>
    );
};

const AppContent = ({ isLoggedIn }) => {
    // Skip the redirect to login
    // useEffect(() => {
    //     if (!isLoggedIn) {
    //         const currentPath = window.location.pathname;
    //         if (currentPath !== '/register' && currentPath !== '/oobe') {
    //             navigate('/login');
    //         }
    //     }
    // }, [isLoggedIn, navigate]);

    return (
        <Routes>
            {/* <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} /> */}
            <Route path="/register" element={<Registration />} />
            <Route path="/oobe" element={<OOBE />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/events" element={<EventList />} />
            <Route path="/events/:eventId" element={<EventDetails />} /> */}
            {/* <Route path="/events_detail" element={<EventList />} /> */}
            <Route path="/record-drinks" element={<RecordDrinks />} />
            <Route path="/events" element = {<EventComponent/>}/>
            <Route path="/events/:subject" element={<EventDetails />} />
            {/* Default to home instead of login */}
            <Route path="/" element={<Home />} />
        </Routes>
    );
};

export default App;
