// this is the privacy statement page
// enable to go back choosing back on the top left corner

import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
// import BackArrowIcon from '../assets/icons/angle-small-left.png'

const PrivacyStatement = ({}) => {

    const navigate = useNavigate();

    const navigateBack = () => {
        navigate('/Profile');
    };

    const [privacyPolicy, setPrivacyPolicy] = useState('');

    // fetch the privacy statement html file
    useEffect(() => { 
        fetch('assets/privacy_doc/privacy_statement.html')
        .then(response => {
            if (response.ok) {
                console.log('fetch success')
                return response.text();
            }
            throw new Error('Failed to fetch the privacy policy');
        })
        .then(text => {
            console.log(text)
            setPrivacyPolicy(text);
        })
        .catch(error => {
            console.error('Error fetching privacy policy:', error);
        });
    }, []);

    

return (
    <div className='home-container'>
        <div className='flex-container-column'>
            <p className="blue-on-white-button-top-left" onClick={navigateBack}>Back</p>
            <div className='statement-section'>
                {/* Using dangerouslySetInnerHTML to insert HTML content */}
                <div dangerouslySetInnerHTML={{ __html: privacyPolicy }} />
            </div>
        
        </div>
    </div>
    
);

};

export default PrivacyStatement;
