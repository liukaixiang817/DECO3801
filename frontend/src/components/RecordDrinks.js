import React, { useState, useEffect } from 'react';
import { fetchHomeData, recordDrink } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const RecordDrinks = () => {
    const [username, setUsername] = useState('');
    const [weeklyLimitUsed, setWeeklyLimitUsed] = useState(0);
    const [weeklyLimit, setWeeklyLimit] = useState(750);
    const [drinkType, setDrinkType] = useState('beer');
    const [amount, setAmount] = useState(0);
    const [submitSuccess, setSubmitSuccess] = useState(null);
    const navigate = useNavigate();

    const multipliers = {
        beer: 1,
        wine: 3,
        spirits: 2,
        cocktail: 4,
        sake: 4,
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            fetchHomeData(storedUsername)
                .then(data => {
                    setUsername(data.username);
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

    const handleDrinkRecord = () => {
        const calculatedAmount = amount * multipliers[drinkType];

        recordDrink(username, calculatedAmount)
            .then(updatedData => {
                setWeeklyLimitUsed(updatedData.weeklyLimitUsed);
                setAmount(0);
                setSubmitSuccess(true);
                setTimeout(() => navigate('/home'), 2000);
            })
            .catch(error => {
                console.error('Error recording drink:', error);
                setSubmitSuccess(false);
            });
    };

    return (
        <div className="record-drinks-container">
            <div className="record-drinks-box">
                <h2>Record Drinks</h2>
                <p>{weeklyLimit - weeklyLimitUsed}ml remains this week</p>

                <div className="progress-bar">
                    <div className="progress" style={{
                        width: `${weeklyLimitUsed / weeklyLimit * 100}%`,
                        backgroundColor: weeklyLimitUsed > weeklyLimit ? 'red' : 'orange'
                    }}></div>
                </div>
                <p>Your weekly limit is {weeklyLimit}ml (Converted to beer)</p>

                <div className="drink-type-selector">
                    {Object.keys(multipliers).map(type => (
                        <button
                            key={type}
                            className={drinkType === type ? 'selected' : ''}
                            onClick={() => setDrinkType(type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="amount-input">
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(parseInt(e.target.value))}
                        placeholder="Enter amount in ml"
                    />
                    <button onClick={handleDrinkRecord}>Submit</button>
                </div>

                {submitSuccess !== null && (
                    <div className={`submit-message ${submitSuccess ? 'success' : 'error'}`}>
                        {submitSuccess ? 'Drink recorded successfully!' : 'Failed to record drink.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordDrinks;
