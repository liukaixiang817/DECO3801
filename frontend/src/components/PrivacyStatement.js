// this is the privacy statement page
// enable to go back choosing back on the top left corner

import React from 'react';
import { useNavigate } from 'react-router-dom';


const PrivacyStatement = ({}) => {

    const navigate = useNavigate();

    const navigateBack = () => {
        navigate('/home');
    };
return (
    <div className="privacy-container">
        <div className="header-row">
            <h1>Privacy Statement</h1>
            <p className="back-button" onClick={navigateBack}>Back</p>
        </div>
        <p>Our app is designed to help you reduce your dependence on alcohol</p>
        <section className="record-section">
            <h2>Record</h2>
            <div className="record-control">
                
            </div>
        </section>

    </div>
);

};

export default PrivacyStatement;
