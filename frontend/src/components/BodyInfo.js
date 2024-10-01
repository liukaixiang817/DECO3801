import React, { useState, useEffect } from 'react';
import { fetchBodyInfo, updateBodyInfo } from '../api/apiClient';
import Modal from './PopWindow';
import './BodyInfo.css';
import { useNavigate } from 'react-router-dom';

const BodyInfo = () => {
    const [bodyInfo, setBodyInfo] = useState({
        gender: 'male',
        age: 18,
        height: '',
        weight: '',
        drinkingPreference: 'Beer', // 改为首字母大写，并确保使用 'drinkingPreference'
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentField, setCurrentField] = useState(null);
    const [newValue, setNewValue] = useState('');
    const navigate = useNavigate();

    const genderOptions = ['male', 'female', 'other'];
    const drinkPreferenceOptions = ['Beer', 'Wine', 'Spirits', 'Cocktail', 'Sake']; // 确保选项首字母大写

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (username) {
            console.log("Fetching body info for username:", username);
            fetchBodyInfo(username)
                .then(data => {
                    console.log("Body info fetched:", data);
                    if (data && !data.error) {
                        // 确保前端正确映射 'drinkingPreference' 字段
                        setBodyInfo({
                            ...data,
                            drinkingPreference: data.drinkingPreference || data.drinkPreference // 兼容字段名
                        });
                    } else {
                        console.error("Error in body info response:", data.error);
                    }
                })
                .catch(error => {
                    console.error('Error fetching body information:', error);
                });
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
        const username = localStorage.getItem('username');
        if (username) {
            const updatedData = { [currentField]: newValue };
            console.log("Sending update request for username:", username, "with data:", updatedData);

            updateBodyInfo(username, updatedData)
                .then(response => {
                    console.log("Body info update response:", response);
                    if (response.success) {
                        setBodyInfo(prev => ({ ...prev, [currentField]: newValue }));
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
        <div className="body-info-page">
            <div className='flex-container-column'>
                <p className='blue-on-white-button-top-left' onClick={navigateBack}>Back</p>
                <h1 className='info-heading'>Edit Body Information</h1>

                {/* Gender */}
                <div className="info-item" onClick={() => handleFieldClick('gender')}>
                    <span>Gender</span>
                    <span>{bodyInfo.gender}</span>
                </div>

                {/* Age */}
                <div className="info-item" onClick={() => handleFieldClick('age')}>
                    <span>Age</span>
                    <span>{bodyInfo.age}</span>
                </div>

                {/* Height */}
                <div className="info-item" onClick={() => handleFieldClick('height')}>
                    <span>Height</span>
                    <span>{bodyInfo.height || 'Enter here...'}</span>
                </div>

                {/* Weight */}
                <div className="info-item" onClick={() => handleFieldClick('weight')}>
                    <span>Weight</span>
                    <span>{bodyInfo.weight || 'Enter here...'}</span>
                </div>

                {/* Drinking Preference */}
                <div className="info-item" onClick={() => handleFieldClick('drinkingPreference')}>
                    <span>Drinking Preference</span>
                    <span>{bodyInfo.drinkingPreference}</span>
                </div>

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
                        {currentField === 'drinkingPreference' && (
                            <select value={newValue} onChange={(e) => setNewValue(e.target.value)}>
                                {drinkPreferenceOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        )}

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
