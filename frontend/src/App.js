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
import MyInfo from './components/MyInfo'; // Import My Information page
import PrivacyStatement from './components/PrivacyStatement'; // Import Privacy Statement page
import RewardPage from './components/Reward';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    useEffect(() => {
        const checkLogin = () => {
            const loggedIn = localStorage.getItem('isLoggedIn');
            setIsLoggedIn(loggedIn === 'true');
        };

        checkLogin();
    }, []);

    return (
        <Router>
            {isLoggedIn && <Navigation />}
            <AppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        </Router>
    );
};

const AppContent = ({ isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            const currentPath = window.location.pathname;
            const urlParams = new URLSearchParams(window.location.search);

            // 检查 URL 参数中是否包含 '@' 字符
            const hasEmail = Array.from(urlParams.values()).some(value => value.includes('@'));

            // 添加对苹果登录的特殊路径检查，以及如果 URL 中包含 '@'，则不跳转
            if (currentPath !== '/register' && currentPath !== '/oobe' &&
                !currentPath.startsWith('/apple-callback-url') && !hasEmail) {
                navigate('/login');
            }
        }
    }, [isLoggedIn, navigate]);


    return (
        <Routes>
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/oobe" element={<OOBE />} />
            <Route path="/rewards" element={<RewardPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile setIsLoggedIn={setIsLoggedIn}/>} />
            <Route path="/events" element={<EventComponent />} />
            <Route path="/events/:subject" element={<EventDetails />} />
            <Route path="/record-drinks" element={<RecordDrinks />} />
            <Route path="/body-info" element={<BodyInfo />} />
            <Route path="/my-info" element={<MyInfo />} /> {/* Add My Information Router */}
            <Route path="/privacy-statement" element={<PrivacyStatement />} /> {/* Add Privacy Statement Router */}

            <Route path="/" element={isLoggedIn ? <Home /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
    );
};

export default App;
