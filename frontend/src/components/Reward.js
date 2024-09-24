import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Reward.css';

const RewardPage = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/profile');
    };

    const awards = [
        { period: '1 Week', image: 'assets/medal_imgs/1w_medal_transparent.png' },
        { period: '1 Month', image: 'assets/medal_imgs/1m_medal_transparent.png' },
        { period: '3 Month', image: 'assets/medal_imgs/3m_medal_transparent.png' },
        { period: '6 Month', image: 'assets/medal_imgs/6m_medal_transparent.png' },
    ];
    // recent award
    const recent_award = { period: '1 Week', image: 'assets/medal_imgs/1w_medal_transparent.png' };
    // next award
    const next_award = { period: '1 Month', image: 'assets/medal_imgs/1m_medal_transparent.png' };

    return (
        <div className="reward-container">
            <div className="reward-header">
                <button onClick={handleBack} className="reward-back-button">Back</button>
                <h1 className="reward-title">Awards</h1>
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
                    <span className="reward-progress-text">14/60</span>
                </div>
                <div className="reward-awards-grid">
                    {awards.map((award, index) => (
                        <div key={index} className="reward-award-item">
                            <img src={award.image} alt={`${award.period} Medal`} />
                            <p>{award.period}</p>
                        </div>
                    ))}
                </div>
                <div className="reward-awards-grid">
                    <div className="reward-award-item">
                        <h2 className="reward-section-title">Recent</h2>
                        <img src={recent_award.image} alt="recent award image" />
                        <p>{recent_award.period}</p>
                    </div>
                    <div className="reward-award-item">
                        <h2 className="reward-section-title">Next</h2>
                        <img src={next_award.image} alt="1 Month Medal" />
                        <p>{next_award.period}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RewardPage;