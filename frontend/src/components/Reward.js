import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reward.css';
import { fetchHomeData } from '../api/apiClient';
import DrinkHistory from './HIstory/DrinkHIstory';

const RewardPage = () => {
    const navigate = useNavigate();
    const [daysUnderControl, setDaysUnderControl] = useState(0); // New state to store daysUnderControl

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            fetchHomeData(storedUsername)
                .then(data => {
                    setDaysUnderControl(data.daysUnderControl); // Get daysUnderControl from backend
                })
                .catch(error => {
                    console.error('Error fetching home data:', error);
                });
        } else {
            console.error('No username found in localStorage.');
        }
    }, []);

    const handleBack = () => {
        navigate('/');
    };

    const awards = [
        { period: 'New Sober', num: 1, file_path: 'assets/medal_imgs/1d.svg' },
        { period: '1 Week', num: 7, file_path: 'assets/medal_imgs/1w.svg' },
        { period: '1 Month', num: 30, file_path: 'assets/medal_imgs/1m.svg' },
        { period: '6 Months', num: 180, file_path: 'assets/medal_imgs/6m.svg' },
        { period: '1 Year', num: 365, file_path: 'assets/medal_imgs/1y.svg' },
        { period: 'Congrats', num: 365, file_path: 'assets/medal_imgs/all.svg' },
    ];

    // calculate the first and second recent awards
    let recent_first_award = awards.find(award => award.num <= daysUnderControl);
    let recent_second_award = awards.find(award => award.num <= daysUnderControl && award.num !== recent_first_award.num);

    return (

        <div>

            <div className="reward-container">
                
                <div className="reward-header">
                    {/* <div className="back-button">
                        <FontAwesomeIcon icon="fa-solid fa-angle-left" size="2x" color="#419779" onClick={handleBack} />
                    </div> */}

                    <h1 className="reward-title">Awards</h1>
                    <div className="placeholder"></div>
                </div>
                <p style={{marginBottom:'10px'}}>Daily Check In Calendar</p>
                <DrinkHistory> </DrinkHistory>
                <div className="reward-content">
                    <p>Recent Awards</p>
                    <div className="reward-progress-award">
                        <div className="reward-awards-grid">
                            {/* if first recent exists  */}
                            {recent_first_award ? (
                                <div className="reward-award-item">
                                    <img src={recent_first_award.file_path} alt="recent award" />
                                    <p>{recent_first_award.period}</p>
                                </div>
                            ) : <p>No Recent Award Available</p>}
                            {/* if second recent exists  */}
                            {recent_second_award ? (
                                <div className="reward-award-item">
                                    <img src={recent_second_award.file_path} alt="recent award" />
                                    <p>{recent_second_award.period}</p>
                                </div>
                            ) : <p>  Start Sober Today!</p>}
                        </div>
                    </div>
                    <p>All Awards</p>
                    <div className="reward-awards-grid">
                        {awards && awards.length > 0 ? (
                            awards.map((award, index) => (
                                <div
                                    key={index}
                                    className={award.num > daysUnderControl ? "reward-award-item-transparent" : "reward-award-item"}
                                >
                                    <img src={award.file_path} alt={`${award.period} Medal`} />
                                    <p>{award.period}</p>
                                </div>
                            ))
                        ) : (
                            <p>No awards available</p> // if there's no awards available
                        )}
                    </div>
                    {/* <div className="reward-awards-grid">
                        {recent_award && (
                            <div className="reward-award-item">
                                <h2 className="reward-section-title">Recent</h2>
                                <img src={recent_award.file_path} alt="recent award" />
                                <p>{recent_award.period}</p>
                            </div>
                        )}
                        {next_award && (
                            <div className="reward-award-item">
                                <h2 className="reward-section-title">Next</h2>
                                <img src={next_award.file_path} alt="next award" />
                                <p>{next_award.period}</p>
                            </div>
                        )}
                    </div> */}
                </div>

            </div>


        </div>

    );
}

export default RewardPage;
