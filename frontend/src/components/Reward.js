import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Reward.css';

const RewardPage = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/');
    };

    const awards = [
        { period: '1 Week', image: '/api/placeholder/64/64' },
        { period: '1 Month', image: '/api/placeholder/64/64' },
        { period: '3 Month', image: '/api/placeholder/64/64' },
        { period: '6 Month', image: '/api/placeholder/64/64' },
    ];

    return (
        <div className="container">
            <div className="header">
                <button onClick={handleBack} className="back-button">← Back</button>
                <h1 className="title">Awards</h1>
            </div>
            <div className="content">
                <div className="progress-award">
                    <img src="/api/placeholder/48/48" alt="Medal" />
                    <div className="progress-info">
                        <p>On the way</p>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{width: '23%'}}></div>
                        </div>
                    </div>
                    <span className="progress-text">14/60</span>
                </div>
                <div className="awards-grid">
                    {awards.map((award, index) => (
                        <div key={index} className="award-item">
                            <img src={award.image} alt={`${award.period} Medal`} />
                            <p>{award.period}</p>
                        </div>
                    ))}
                </div>
                <div className="recent-next">
                    <div className="recent">
                        <h2 className="section-title">Recent</h2>
                        <img src="/api/placeholder/64/64" alt="1 Week Medal" />
                        <p>1 Week</p>
                    </div>
                    <div className="next">
                        <h2 className="section-title">Next</h2>
                        <img src="/api/placeholder/64/64" alt="1 Month Medal" />
                        <p>1 Month</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RewardPage;