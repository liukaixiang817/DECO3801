import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import EventList from './components/EventList';
import EventDetails from './components/EventDetails';
import Navigation from './components/Navigation';
import RecordDrinks from './components/RecordDrinks';
import Registration from './components/Registration';
import OOBE from './components/OOBE';
// import Login from './components/Login';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

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

const AppContent = ({ isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (!isLoggedIn) {
    //         const currentPath = window.location.pathname;
    //         // 如果路径不是 /register 和 /oobe，则跳转到登录页面
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
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/record-drinks" element={<RecordDrinks />} />
            {/* <Route path="/" element={isLoggedIn ? <Home /> : <Login setIsLoggedIn={setIsLoggedIn} />} /> */}
        </Routes>
    );
};

export default App;
