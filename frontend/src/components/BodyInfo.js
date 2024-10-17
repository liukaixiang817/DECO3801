import React, { useState, useEffect } from 'react';
import { fetchBodyInfo, updateBodyInfo } from '../api/apiClient';
import Modal from './PopWindow';
import './BodyInfo.css';
import { useNavigate } from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const BodyInfo = () => {
    const [bodyInfo, setBodyInfo] = useState({
        gender: 'male',
        age: 18,
        height: '',
        weight: '',
        drinkingPreference: 'Beer', // Changed to capitalize first letter, and ensure use of 'drinkingPreference'
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentField, setCurrentField] = useState(null);
    const [newValue, setNewValue] = useState('');
    const navigate = useNavigate();

    const genderOptions = ['male', 'female', 'other'];
    const drinkPreferenceOptions = ['Beer', 'Wine', 'Spirits', 'Cocktail', 'Sake']; // Ensure options are capitalized
    
    const fetchBodyInfoFromAPI = (username) => {
        fetchBodyInfo(username)
            .then(data => {
                console.log("Body info fetched:", data);
                if (data && !data.error) {
                    // showing all the strings in the console
                    // console.log("Data fields received:", Object.keys(data));
                    // console.log("Gender:", data.gender);
                    // console.log("Age:", data.age);
                    // console.log("Height:", data.height);
                    // console.log("Weight:", data.weight);
                    // console.log("Drinking Preference:", data.drinkingPreference || data.drinkPreference);
                    
                    // match the received data with the state
                    const parsedData = {
                        gender: data.gender || 'male',
                        age: String(data.age), // make sure it's string
                        height: data.height || '',
                        weight: data.weight || '',
                        drinkingPreference: data.drinkingPreference || data.drinkPreference || 'Beer',
                    };
                    setBodyInfo(parsedData);
                    console.log("Updated bodyInfo state:", parsedData);
                } else {
                    console.error("Error in body info response:", data.error);
                }
            })
            .catch(error => {
                console.error('Error fetching body information:', error);
            });
    };


    useEffect(() => {
        const username = localStorage.getItem('username');
        if (username) {
            console.log("Fetching body info for username:", username);
            fetchBodyInfoFromAPI(username);
        } else {
            console.error('Username not found in localStorage');
        }
    }, []);

    const handleFieldClick = (field) => {
        setCurrentField(field);
        setNewValue(bodyInfo[field] || '');
        setIsModalOpen(true);
    };

    const navigateBack = () => {
        navigate('/Profile');
    };

    const handleSave = () => {
        if (currentField === 'age' && parseInt(newValue, 10) < 18) {
            alert('Age must be 18 or older.');
            return; // Abort saving if validation fails
        }

        const username = localStorage.getItem('username');
        if (username) {
            const updatedData = { ...bodyInfo, [currentField]: newValue };
            console.log("Sending update request for username:", username, "with data:", updatedData);

            updateBodyInfo(username, updatedData)
                .then(response => {
                    console.log("Body info update response:", response);
                    if (response.success) {
                        fetchBodyInfoFromAPI(username);
                        setIsModalOpen(false);
                    } else {
                        console.error("Error updating body info:", response.error);
                    }
                })
                .catch(error => {
                    console.error('Error updating body information:', error);
                });
        } else {
            console.error('Username not found in localStorage');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="home-container">
            <div className='flex-container-column'>
                <div className="back-button">
                    <FontAwesomeIcon icon="fa-solid fa-angle-left" size="2x" color="#419779" onClick={navigateBack}/>
                </div>
                <h1 className='info-heading'>Edit Body Information</h1>

                {/* Gender */}
                <div className="body-info-item" onClick={() => handleFieldClick('gender')}>
                    <span>Gender</span>
                    <span>{bodyInfo.gender}</span>
                </div>

                {/* Age */}
                <div className="body-info-item" onClick={() => handleFieldClick('age')}>
                    <span>Age</span>
                    <span>{bodyInfo.age}</span>
                </div>

                {/* Height */}
                <div className="body-info-item" onClick={() => handleFieldClick('height')}>
                    <span>Height</span>
                    <span>{bodyInfo.height || 'Enter here...'}cm</span>
                </div>

                {/* Weight */}
                <div className="body-info-item" onClick={() => handleFieldClick('weight')}>
                    <span>Weight</span>
                    <span>{bodyInfo.weight || 'Enter here...'}kg</span>
                </div>

                {/* Drinking Preference */}
                {/*<div className="body-info-item" onClick={() => handleFieldClick('drinkingPreference')}>
                    <span>Drinking Preference</span>
                    <span>{bodyInfo.drinkingPreference}</span>
                </div>/*}

                {/* Modal for Editing Information */}
                <Modal isOpen={isModalOpen} onClose={handleModalClose}>
                    <div className='flex-container-column'>
                        <div className='flex-container-row'>
                            <p className="blue-on-white-button-middle-left" onClick={handleModalClose}>Cancel</p>
                            <h2 className='Modal-heading-top-center'> Edit {currentField}</h2>
                            <p className="white-on-blue-button-top-right" onClick={handleSave}>Save</p>
                        </div>

                        {/* Gender Dropdown */}
                        {currentField === 'gender' && (
                            <select value={newValue} onChange={(e) => setNewValue(e.target.value)}>
                                {genderOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        )}

                        {/* Drinking Preference Dropdown */}
                        {/*{currentField === 'drinkingPreference' && (
                            <select value={newValue} onChange={(e) => setNewValue(e.target.value)}>
                                {drinkPreferenceOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        )}*/}

                        {/* Text Input for Other Fields */}
                        {currentField !== 'gender' && currentField !== 'drinkingPreference' && (
                            <input
                                type="text"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                            />
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default BodyInfo;
