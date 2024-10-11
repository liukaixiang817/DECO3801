import React, { useState, useEffect } from 'react';
import { fetchHomeData, recordDrink, getDrinkHistory } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import LeftIcon from '../assets/icons/left.svg';
import BottleIcon from '../assets/icons/bottle.svg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const convertBeerToStandardDrinks = (beerMl) => {
    const BEER_TO_STANDARD_DRINK = 1.4; // 375 ml of beer = 1.4 standard drinks
    const BEER_VOLUME = 375; // 375 ml per beer
    return (beerMl / BEER_VOLUME * BEER_TO_STANDARD_DRINK).toFixed(2); // 转换为标准饮品单位
};



const RecordDrinks = () => {
    const [username, setUsername] = useState('');
    const [weeklyLimitUsed, setWeeklyLimitUsed] = useState(0);
    const [weeklyLimit, setWeeklyLimit] = useState(750);
    const [drinkType, setDrinkType] = useState('beer');
    const [amount, setAmount] = useState(0);
    const [submitSuccess, setSubmitSuccess] = useState(null);
    const [history, setHistory] = useState([]); // 用于存储历史记录
    const navigate = useNavigate();

    const multipliers = {
        beer: 1,
        wine: 2.86,
        spirits: 2.5,
        cocktail: 2.54,
        sake: 0.97,
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            fetchHomeData(storedUsername)
                .then(data => {
                    setUsername(data.username);
                    setWeeklyLimitUsed(data.weeklyLimitUsed);
                    setWeeklyLimit(data.weeklyLimit);
                    return getDrinkHistory(storedUsername);
                })
                .then(historyData => {
                    const combinedHistory = historyData.recordTime.map((time, index) => {
                        let localTime = new Date(time);
                        localTime.setHours(localTime.getHours() + 10); // 手动增加 10 小时
                        localTime = localTime.toLocaleString('en-AU', {
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // 使用本地时区
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZoneName: 'short',
                            hour12: false
                        });
                        return {
                            time: localTime,
                            value: (historyData.recordValue[index] / multipliers[historyData.recordType[index]]).toFixed(2),
                            type: historyData.recordType[index],
                        };
                    });
                    combinedHistory.sort((a, b) => new Date(b.time) - new Date(a.time));
                    setHistory(combinedHistory);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        } else {
            console.error('No username found in localStorage.');
        }
    }, []);

    const handleDrinkRecord = () => {
        const calculatedAmount = amount * multipliers[drinkType];
        recordDrink(username, calculatedAmount, drinkType)
            .then(updatedData => {
                setWeeklyLimitUsed(updatedData.weeklyLimitUsed);
                setSubmitSuccess(true);
                return getDrinkHistory(username);
            })
            .then(updatedHistory => {
                const combinedHistory = updatedHistory.recordTime.map((time, index) => {
                    let localTime = new Date(time);
                    localTime.setHours(localTime.getHours() + 10); // 手动增加 10 小时
                    localTime = localTime.toLocaleString('en-AU', {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // 使用本地时区
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZoneName: 'short',
                        hour12: false
                    });
                    return {
                        time: localTime,
                        value: (updatedHistory.recordValue[index] / multipliers[updatedHistory.recordType[index]]).toFixed(2),
                        type: updatedHistory.recordType[index],
                    };
                });
                combinedHistory.sort((a, b) => new Date(b.time) - new Date(a.time));
                setHistory(combinedHistory);
                setAmount(0); // 重置 amount
                setSubmitSuccess(true); // 成功后设置状态
            })
            .catch(error => {
                console.error('Error recording drink:', error);
                setSubmitSuccess(false);
            });
    };

    return (
        <div className="goal-section">
            <div className="record-drinks-box">
                <div className="header">
                    <button className="back-button" onClick={() => navigate('/')}>
                        <FontAwesomeIcon icon="fa-solid fa-angle-left" size="2x" color="#419779"/>
                    </button>
                </div>


                <div className="progress-container">
                    <pre>
                        <p>
                            <span className="gold-text">
                                {convertBeerToStandardDrinks(weeklyLimit - weeklyLimitUsed)} standard drinks
                            </span> remains this week
                        </p>
                        <div className="progress-bar">
                            <div className="progress" style={{
                                width: `${(weeklyLimitUsed / weeklyLimit) * 100}%`,
                                backgroundColor: weeklyLimitUsed / weeklyLimit <= 0.33 ? 'green' : weeklyLimitUsed / weeklyLimit <= 0.66 ? 'yellow' : 'red',
                                color: weeklyLimitUsed / weeklyLimit > 0.5 ? '#fff' : '#000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                <span className="progress-percentage">{`${Math.round((weeklyLimitUsed / weeklyLimit) * 100)}%`}</span>
                            </div>
                        </div>
                        <p>Your weekly limit is <span
                            className="gold-text">{convertBeerToStandardDrinks(weeklyLimit)} standard drinks</span></p>
                    </pre>
                </div>


                <div className="drink-type-selector">
                    {Object.keys(multipliers).map(type => (
                        <div key={type} className="drink-option">
                            <button className={drinkType === type ? 'selected' : ''} onClick={() => setDrinkType(type)}>
                                <img src={BottleIcon} alt="bottle icon" style={{width: '20px', height: '20px'}}/>
                            </button>
                            <span className="drink-type-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </div>
                    ))}
                </div>

                <div className="amount-input">
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(parseInt(e.target.value))}
                        placeholder="Enter amount in ml"
                        style={{paddingRight: '30px'}}
                    />
                    <span>ml&nbsp;</span>
                    <button onClick={handleDrinkRecord}>Submit</button>
                </div>

                {submitSuccess !== null && (
                    <div className={`submit-message ${submitSuccess ? 'success' : 'error'}`}>
                        {submitSuccess ? 'Drink recorded successfully!' : 'Failed to record drink.'}
                    </div>
                )}

                {/* Record History Section - Always visible now */}
                <div className="history-list">
                    <h2>Record History</h2>
                    {history.length > 0 ? (
                        history.map((record, index) => (
                            <div key={index} className="history-item">
                                <span>{record.type}</span>
                                <span>{record.value}ml</span>
                                <span>{record.time}</span>
                            </div>
                        ))
                    ) : (
                        <p>No history available.</p> // 当没有历史记录时显示提示
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordDrinks;
