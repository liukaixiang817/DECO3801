import React, { useState, useEffect } from 'react';
import { getDrinkHistory, fetchHomeData } from '../../api/apiClient';
import BasicDateCalendar from "./DatePicker.js";

const DrinkHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    console.log("Stored username from localStorage:", storedUsername);

    if (storedUsername) {
      fetchHomeData(storedUsername)
        .then(data => getDrinkHistory(storedUsername))
        .then(historyData => {
          // Check if historyData exists and has a valid recordTime array
          if (historyData && Array.isArray(historyData.recordTime)) {
            // Process recordTime if valid
            setHistory(historyData.recordTime.map(time => time.split(' ')[0]));
          } else {
            // Handle the case where there's no drink history
            console.log("No drink history found.");
            setHistory([]);  // Set history to an empty array
          }
        })
        .catch(error => {
          console.error("Error fetching drink history:", error);
          setHistory([]);  // In case of error, set history to an empty array
        });
    } else {
      console.log("No users found.");
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <BasicDateCalendar highlightedDays={history} />
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
  
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <div>
          <span style={{ color: 'green', marginRight: '5px' }}>✓</span>
          No Drinking
        </div>
        <div>
          <span style={{ color: 'red', marginRight: '5px' }}>✗</span>
          Drinking
        </div>
      </div>
    </div>
  </div>
  );
};

export default DrinkHistory;
