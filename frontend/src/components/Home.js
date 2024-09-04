import React, { useState, useEffect } from 'react';
import { fetchHomeData } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const Home = () => {
    const [username, setUsername] = useState('');
    const [daysUnderControl, setDaysUnderControl] = useState(0);
    const [weeklyLimitUsed, setWeeklyLimitUsed] = useState(0);
    const [weeklyLimit, setWeeklyLimit] = useState(750);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            fetchHomeData(storedUsername)
                .then(data => {
                    setUsername(data.username);
                    setDaysUnderControl(data.daysUnderControl);
                    setWeeklyLimitUsed(data.weeklyLimitUsed);
                    setWeeklyLimit(data.weeklyLimit);
                })
                .catch(error => {
                    console.error('Error fetching home data:', error);
                });
        } else {
            console.error('No username found in localStorage.');
        }
    }, []);

    const handleRecordDrinksClick = () => {
        navigate('/record-drinks');
    };

    return (
        <div className="home-container">
            <div className="header-row">
                <h1>Welcome {username}</h1>
                <p className="emergency-call">
                    <a href="tel:1800250015">📞</a>
                </p>
            </div>
            <p>Our app is designed to help you reduce your dependence on alcohol</p>
            <section className="record-section">
                <h2>Record</h2>
                <div className="record-control">
                    <p>Alcohol take under control for</p>
                    <span className="days-count">{daysUnderControl} Days</span>
                    <button onClick={handleRecordDrinksClick}>Record Drinks</button>
                    <button onClick={() => alert('Fast Record action')}>Fast Record</button>
                </div>
            </section>

            <section className="goal-section">
                <h2>Goal</h2>
                <p>{(weeklyLimitUsed / weeklyLimit * 100).toFixed(1)}% of your weekly limit used</p>
                <div className="progress-bar">
                    <div className="progress" style={{
                        width: `${weeklyLimitUsed / weeklyLimit * 100}%`,
                        backgroundColor: weeklyLimitUsed > weeklyLimit ? 'red' : 'orange'
                    }}></div>
                </div>
                <p>Your weekly limit is {weeklyLimit}ml (Converted to beer)</p>
            </section>

            <section className="alternative-section">
                <p>Find alternative drinks like non-alcoholic beverages or healthy juices.</p>
            </section>
        </div>
    );
}

export default Home;
