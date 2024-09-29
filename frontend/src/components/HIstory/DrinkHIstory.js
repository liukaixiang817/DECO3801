import React, { useState, useEffect } from 'react';
import { getDrinkHistory,fetchHomeData } from '../../api/apiClient';

const DrinkHistory = () => {

    const [history, setHistory] = useState([]);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        console.log("Stored username from localStorage:", storedUsername);
        if (storedUsername) {
            fetchHomeData(storedUsername)
                .then(data => {  return getDrinkHistory(storedUsername);}).then(historyData => {
                    console.log('Fetched drink history:', historyData.recordTime);  // 调试
                    setHistory(historyData.recordTime);
                })
        }
        else {
            console.log("NO users");
        }

    }, []);

    return (
        <div>
            <h1>Drink History</h1>
        </div>
    )

} 
export default DrinkHistory;