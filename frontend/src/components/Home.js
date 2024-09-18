import React, { useState, useEffect } from 'react';
import { fetchHomeData } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import './styles.css';



const Home = () => {
    const [username, setUsername] = useState('');
    const [daysUnderControl, setDaysUnderControl] = useState(0);
    const [weeklyLimitUsed, setWeeklyLimitUsed] = useState(0);
    const [weeklyLimit, setWeeklyLimit] = useState(750);
    const [currentIndex, setCurrentIndex] = useState(0); // 管理当前轮播的索引
    const navigate = useNavigate();

    const events = [
        { title: '老师给学生跳舞', imageUrl: 'path/to/image1.jpg' },
        { title: '学校运动会', imageUrl: 'path/to/image2.jpg' },
        { title: '艺术节活动', imageUrl: 'path/to/image3.jpg' },
    ];

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

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex === events.length - 1 ? 0 : prevIndex + 1));
        }, 3000); // 每3秒自动切换一次图片

        return () => clearInterval(interval);
    }, [events.length]);

    const handleRecordDrinksClick = () => {
        navigate('/record-drinks');
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === events.length - 1 ? 0 : prevIndex + 1));
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? events.length - 1 : prevIndex - 1));
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
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
                    <div className="button-container">
                        <button onClick={handleRecordDrinksClick}>Record Drinks</button>
                        <button onClick={() => alert('Fast Record action')}>Fast Record</button>
                    </div>
                </div>
            </section>

            <h2>Goal</h2>

            <section className="goal-section">
                <p>
                    <span className="gold-text">{(weeklyLimitUsed / weeklyLimit * 100).toFixed(1)}%</span>
                    of your weekly limit used
                </p>
                <div className="progress-bar">
                    <div className="progress" style={{
                        width: `${weeklyLimitUsed / weeklyLimit * 100}%`,
                        backgroundColor: weeklyLimitUsed > weeklyLimit ? 'red' : 'orange'
                    }}></div>
                </div>
                <p>
                    Your weekly limit is
                    <span className="gold-text"> {weeklyLimit}ml</span>
                    <p>(Converted to beer)</p>
                </p>
            </section>

            <section className="alternative-section">
                <i className="fas fa-lightbulb icon"></i>
                <p>Find alternative drinks like non-alcoholic beverages or healthy juices.</p>
            </section>


            <section className="event-section">
                <h2>Events</h2>
                <div className="slider">
                    <img src={events[currentIndex].imageUrl} alt={events[currentIndex].title} className="slider-image"/>
                    <div className="slider-title">{events[currentIndex].title}</div>
                    <div className="slider-controls">
                        <button onClick={goToPrevious}>&lt;</button>
                        <button onClick={goToNext}>&gt;</button>
                    </div>
                    <div className="dots">
                        {events.map((_, index) => (
                            <span key={index} className={`dot ${index === currentIndex ? 'active' : ''}`}
                                  onClick={() => goToSlide(index)}></span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
