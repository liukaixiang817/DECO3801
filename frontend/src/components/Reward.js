import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reward.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchHomeData } from '../api/apiClient'; // 引入获取数据的函数
import DrinkHistory from './HIstory/DrinkHIstory';

const RewardPage = () => {
    const navigate = useNavigate();
    const [daysUnderControl, setDaysUnderControl] = useState(0); // 新增状态用于存储 daysUnderControl

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            fetchHomeData(storedUsername)
                .then(data => {
                    setDaysUnderControl(data.daysUnderControl); // 从后端获取 daysUnderControl
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
        { period: '1 Week', num: 7, file_path: 'assets/medal_imgs/1w_medal_transparent.png' },
        { period: '1 Month', num: 30, file_path: 'assets/medal_imgs/1m_medal_transparent.png' },
        { period: '3 Months', num: 90, file_path: 'assets/medal_imgs/3m_medal_transparent.png' },
        { period: '6 Months', num: 120, file_path: 'assets/medal_imgs/6m_medal_transparent.png' },
    ];

    // 计算下一个和最近的奖励
    let next_award = awards.find(award => award.num > daysUnderControl);
    let recent_award = awards.find(award => award.num <= daysUnderControl);

    return (

        <div>
            <h1>Your Drinking Status Is Here</h1>
            <DrinkHistory> </DrinkHistory>
            <div className="reward-container">
                <div className="reward-header">
                    <div className="back-button">
                        <FontAwesomeIcon icon="fa-solid fa-angle-left" size="2x" color="#419779" onClick={handleBack} />
                    </div>

                    <h1 className="reward-title">Awards</h1>
                    <div className="placeholder"></div>
                </div>
                <div className="reward-content">
                    <div className="reward-progress-award">
                        <img src='assets/medal_imgs/6m_medal_transparent.png' alt="Medal" />
                        <div className="reward-progress-info">
                            <p>The Number of Days You Have Checked In</p>
                            <div className="reward-progress-bar">
                                <div
                                    className="reward-progress-fill"
                                    style={{ width: `${(daysUnderControl / 120) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <span className="reward-progress-text">{daysUnderControl}/120</span>
                    </div>
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
                            <p>No awards available</p> // 如果没有奖项可用
                        )}
                    </div>
                    <div className="reward-awards-grid">
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
                    </div>
                </div>
            </div>


        </div>

    );
}

export default RewardPage;
