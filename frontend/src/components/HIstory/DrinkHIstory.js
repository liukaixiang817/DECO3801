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
    <div>
      {/* Pass the history to the BasicDateCalendar component */}
      <h1>Your progress this month</h1>
      <BasicDateCalendar highlightedDays={history} />
      <h1>Drink History</h1>
      {history.length === 0 ? (
        <p>No drink history available.</p>
      ) : (
        <ul>
          {history.map((date, index) => (
            <li key={index}>{date}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DrinkHistory;
