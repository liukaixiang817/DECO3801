import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactMarkdown from 'react-markdown';

const PrivacyStatement = () => {
    const navigate = useNavigate();
    const [privacyPolicy, setPrivacyPolicy] = useState('');

    const navigateBack = () => {
        navigate('/Profile');
    };

    useEffect(() => {
        // 从公共文件夹加载 Markdown 文件
        fetch('/assets/privacy_doc/privacy_statement.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(text => setPrivacyPolicy(text))
            .catch(error => console.error('Error loading privacy policy:', error));
    }, []);

    return (
        <div className='home-container'>
            <div className='flex-container-column'>
                <div className="back-button">
                    <FontAwesomeIcon icon="fa-solid fa-angle-left" size="2x" color="#419779" onClick={navigateBack}/>
                </div>
                <div>
                    <div align="center">
                    <h1>Privacy Policy</h1>
                    <br></br>Last Updated: 2024-09-12
                    </div>
                    <ReactMarkdown>{privacyPolicy}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default PrivacyStatement;