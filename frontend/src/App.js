import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import EventComponent from './components/Event/EventComponent';
import EventDetails from './components/Event/EventDetails';
import Navigation from './components/Navigation';
import RecordDrinks from './components/RecordDrinks';
import Registration from './components/Registration';
import OOBE from './components/OOBE';
import Login from './components/Login';
import BodyInfo from './components/BodyInfo';
import MyInfo from './components/MyInfo';  // 导入 My Information 页面

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    //         if (currentPath !== '/register' && currentPath !== '/oobe') {
    //             navigate('/login');
    //         }
    //     }
    // }, [isLoggedIn, navigate]);

    return (
        <Routes>
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/oobe" element={<OOBE />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/events" element={<EventComponent />} />
            <Route path="/events/:subject" element={<EventDetails />} />
            <Route path="/record-drinks" element={<RecordDrinks />} />
            <Route path="/body-info" element={<BodyInfo />} />
            <Route path="/my-info" element={<MyInfo />} />  {/* 新增 My Information 路由 */}
            <Route path="/" element={isLoggedIn ? <Home /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
    );
};

export default App;
