import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Reward.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const RewardPage = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/profile');
    };

    const awards = [
        { period: '1 Week', num: 7, file_path: 'assets/medal_imgs/1w_medal_transparent.png' },
        { period: '1 Month', num: 30,file_path: 'assets/medal_imgs/1m_medal_transparent.png' },
        { period: '3 Month', num: 90, file_path: 'assets/medal_imgs/3m_medal_transparent.png' },
        { period: '6 Month', num: 120, file_path: 'assets/medal_imgs/6m_medal_transparent.png' },
    ];


    const current_award_date = 14;



    // match the num to get recent award and next award
    let next_award = awards.find(award => award.num > current_award_date);
    let recent_award = awards.find(award => award.num <= current_award_date);


    return (
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
                        <p>On the way</p>
                        <div className="reward-progress-bar">
                            <div className="reward-progress-fill" style={{width: '23%'}}></div>
                        </div>
                    </div>
                    <span className="reward-progress-text">{current_award_date}/120</span>
                </div>
                <div className="reward-awards-grid">
                    {awards.map((award, index) => (
                        <div key={index} className="reward-award-item">
                            <img src={award.file_path} alt={`${award.period} Medal`} />
                            <p>{award.period}</p>
                        </div>
                    ))}
                </div>
                <div className="reward-awards-grid">
                    <div className="reward-award-item">
                        <h2 className="reward-section-title">Recent</h2>
                        <img src={recent_award.file_path} alt="recent award image" />
                        <p>{recent_award.period}</p>
                    </div>
                    <div className="reward-award-item">
                        <h2 className="reward-section-title">Next</h2>
                        <img src={next_award.file_path} alt="1 Month Medal" />
                        <p>{next_award.period}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RewardPage;