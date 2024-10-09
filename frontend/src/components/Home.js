import React, { useState, useEffect } from 'react';
import { fetchHomeData,fetchBodyInfo,checkin} from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import EventBanner from './Event/EventBanner';
import Modal from './PopWindow';

const Home = () => {
    const [username, setUsername] = useState('');
    const [daysUnderControl, setDaysUnderControl] = useState(0);
    const [weeklyLimitUsed, setWeeklyLimitUsed] = useState(0);
    const [weeklyLimit, setWeeklyLimit] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(750); // 管理当前轮播的索引
    const [currentQuote, setCurrentQuote] = useState('');
    //const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [RecommendWeeklyLimit, setRecommendWeeklyLimit] = useState(0);
    // for the fast record modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [drinkType, setDrinkType] = useState('beer');
    const navigate = useNavigate();

    const events = [
        { title: '老师给学生跳舞', imageUrl: 'path/to/image1.jpg' },
        { title: '学校运动会', imageUrl: 'path/to/image2.jpg' },
        { title: '艺术节活动', imageUrl: 'path/to/image3.jpg' },
    ];

    // 添加要显示的语句数组
    const personalizedSuggestions = [
        "If you're lighter in weight, limit to 1-2 drinks per hour.",
        "Women should aim for 1 drink per hour or less, and eat beforehand.",
        "Men should keep it to 2 drinks per hour.",
        "Never drink and drive.",
        "Stay hydrated if drinking before or after physical activities.",
        "Choose low-alcohol options if you have low tolerance.",
        "Avoid drinking on an empty stomach.",
        "Limit to 1-2 drinks if you're not a regular drinker.",
        "Join a community volunteering activity to meet new people.",
        "Challenge your friends to a table tennis match."
    ];


    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            const params = new URLSearchParams(window.location.search);
            const urlUsername = params.get('username');

            if (urlUsername) {
                setUsername(urlUsername);
                localStorage.setItem('username', urlUsername); // 存储到本地
                localStorage.setItem('isLoggedIn', 'true'); // 存储登录状态
                //setIsLoggedIn(true); // 设置为已登录状态
                setUsername(storedUsername);
                fetchHomeData(urlUsername)
                    .then(data => {
                        setUsername(data.username);
                        setDaysUnderControl(data.daysUnderControl);
                        setWeeklyLimitUsed(data.weeklyLimitUsed);
                        setWeeklyLimit(data.weeklyLimit);
                    })
                    .catch(error => {
                        console.error('Error fetching home data:', error);
                    });
                fetchBodyInfo(urlUsername)
                    .then(data => {
                        console.log("Body info fetched:", data);
                        let weight = data.weight;
                        let gender = data.gender;
                        // calculate the recommended weekly limit
                        if (weight && gender) {
                            const weightInGrams = weight * 1000;
                            let limitInGrams = 0;
                            if (gender === 'male') {
                                limitInGrams = (0.08 * weightInGrams * 0.68) / 100;
                            } else if (gender === 'female') {
                                limitInGrams = (0.08 * weightInGrams * 0.55) / 100;
                            }

                            // transfer to beer (ml)
                            const beerVolumeInMl = (limitInGrams / (0.05 * 0.789)).toFixed(2);
                            setRecommendWeeklyLimit(beerVolumeInMl);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching body information:', error);
                    });
            } else {
                console.error('No username found in localStorage or URL.');
                return; // 如果 URL 中也没有，退出
            }
        } else {
            setUsername(storedUsername);
        }
        if (storedUsername) {
            localStorage.setItem('isLoggedIn', 'true');
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

            // fetch the body info
            fetchBodyInfo(storedUsername)
                .then(data => {
                    console.log("Body info fetched:", data);
                    let weight = data.weight;
                    let gender = data.gender;
                    // calculate the recommended weekly limit
                    if (weight && gender) {
                        const weightInGrams = weight * 1000;
                        let limitInGrams = 0;
                        if (gender === 'male') {
                            limitInGrams = (0.08 * weightInGrams * 0.68) / 100;
                        } else if (gender === 'female') {
                            limitInGrams = (0.08 * weightInGrams * 0.55) / 100;
                        }

                        // transfer to beer (ml)
                        const beerVolumeInMl = (limitInGrams / (0.05 * 0.789)).toFixed(2);
                        setRecommendWeeklyLimit(beerVolumeInMl);
                    }
                })
                .catch(error => {
                    console.error('Error fetching body information:', error);
                });

        } else {
            console.error('No username found in localStorage.');
        }

        // 在进入Home页面时，随机选择一句作为初始语句
        setCurrentQuote(personalizedSuggestions[Math.floor(Math.random() * personalizedSuggestions.length)]);

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex === events.length - 1 ? 0 : prevIndex + 1));
        }, 3000); // 每3秒自动切换一次图片




        return () => {
            clearInterval(interval);
        };
    }, [events.length]);

    const handleRecordDrinksClick = () => {
        navigate('/record-drinks');
    };

    const handleCheckInClick = () => {
        checkin(username)
            .then(data => {
                // 更新 daysUnderControl
                if (data.message) {
                    alert(data.message);  // 提示签到结果
                }
                if (data.daysUnderControl !== undefined) {
                    setDaysUnderControl(data.daysUnderControl);  // 更新天数
                }
            })
            .catch(error => {
                console.error('Error during check-in:', error);
            });
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


    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalOpen = () => {
        setIsModalOpen(true);
    };

    const multipliers = {
        beer: 1,
        wine: 3,
        spirits: 2,
        cocktail: 4,
        sake: 4,
    };


    const fastRecordSave = () => {

    };
    return (
        <div className="home-container">
           
 
            <div className="header-row">
                <div className='h3_1'> Welcome {username} </div>
                <p className="emergency-call">
                    <a href="tel:1800250015">📞</a>
                </p>
            </div>
            <p>Our app is designed to help you reduce your dependence on alcohol</p>
            <section className="record-section">
                <h2>Record</h2>
                <div className="record-control">
                    <p>Number of Days Have Checked in</p>
                    <span className="days-count">{daysUnderControl} Days</span>
                    <div className="button-container">
                        <button onClick={handleRecordDrinksClick}>Record Drinks</button>
                        <button onClick={handleCheckInClick} style={{ color: "white",backgroundColor: '#e8b44b' }}>Daily Check In</button>

                    </div>
                </div>
            </section>

            <h2>Goal</h2>

            <section className="goal-section">
                <pre>
                    <p>
                        <span className="gold-text">{(weeklyLimitUsed / weeklyLimit * 100).toFixed(1)}% </span>
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
                    <p className='hint-text'> The recommended weekly limit for you is {RecommendWeeklyLimit}ml</p>
                </pre>
            </section>

            <section className="alternative-section">
                <i className="fas fa-lightbulb icon"></i>
                <p>{currentQuote}</p>
            </section>

            <EventBanner></EventBanner>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className='flex-container-row'>
                    <p className="blue-on-white-button-middle-left" onClick={handleModalClose} >Cancel</p>
                    <h2 className='Modal-heading-top-center'>Fast Record Alcohol</h2>
                    <p className='white-on-blue-button-top-right' onClick={fastRecordSave} >Save</p>
                </div>
                <div className='flex-container-row'>
                    {/* display all the keys in multiplers as drink-option-img class and make it clickable */}
                    {Object.keys(multipliers).map(type => (
                        <div key={type}  onClick={() => setDrinkType(type)}>
                            <img className="drink-option-img" src={`assets/drinks_icon/${type}-icon.svg` } alt="bottle icon"/>
                            <span className="drink-type-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </div>
                    ))}
                </div>
            </Modal>
            {/* <section className="event-section">
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
            </section> */}
        </div>
    );
}

export default Home;