import React, { useState, useEffect } from 'react';
import { fetchBodyInfo, updateBodyInfo } from '../api/apiClient';
import Modal from './PopWindow';
import './BodyInfo.css';  // Add CSS style
import { useNavigate } from 'react-router-dom';

const BodyInfo = () => {
    const [bodyInfo, setBodyInfo] = useState({
        gender: 'Male',
        age: 18,
        height: '',
        weight: '',
        drinkPreference: 'beer',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentField, setCurrentField] = useState(null);
    const [newValue, setNewValue] = useState('');
    const navigate = useNavigate();

    // indentify the options
    const genderOptions = ['Male', 'Female', 'Other'];
    const drinkPreferenceOptions = ['beer', 'wine', 'spirits', 'cocktail', 'sake'];

    useEffect(() => {
        const username = localStorage.getItem('username');  // get the user name from localStorage
        if (username) {
            console.log("Fetching body info for username:", username);  // navigation info
            fetchBodyInfo(username)
                .then(data => {
                    console.log("Body info fetched:", data);  // navigation info
                    if (data && !data.error) {
                        setBodyInfo(data);  // if the info is in database，update state
                    } else {
                        console.error("Error in body info response:", data.error);  // print out the error message
                    }
                })
                .catch(error => {
                    console.error('Error fetching body information:', error);
                });
        } else {
            console.error('Username not found in localStorage');
        }
    }, []);

    // 打开弹窗并设置要修改的字段
    const handleFieldClick = (field) => {
        setCurrentField(field);
        setNewValue(bodyInfo[field] || '');  // initialize the value in the pop window
        setIsModalOpen(true);
    };

    // handle user click on back button
    const navigateBack = () => {
        navigate('/Profile');
    };

    // save the updated info
    const handleSave = () => {
        const username = localStorage.getItem('username');  // get the user name from localStorage
        if (username) {
            const updatedData = { [currentField]: newValue };
            console.log("Sending update request for username:", username, "with data:", updatedData);  // 打印调试信息

            updateBodyInfo(username, updatedData)  // send the update request
                .then(response => {
                    console.log("Body info update response:", response);  // print out the updated outcome
                    if (response.success) {
                        setBodyInfo(prev => ({ ...prev, [currentField]: newValue }));  // 更新前端显示
                        setIsModalOpen(false);  // Close the pop window
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

    return (
        <div className="body-info-page">
            <p className='blue-on-white-button-top-left' onClick={navigateBack} >Back</p>


            <h1 className='heading-center'>Edit Body Information</h1>

            {/* Gender */}
            <div className="info-item" onClick={() => handleFieldClick('Gender')}>
                <span>Gender</span>
                <span>{bodyInfo.gender}</span>
            </div>

            {/* Age */}
            <div className="info-item" onClick={() => handleFieldClick('Age')}>
                <span>Age</span>
                <span>{bodyInfo.age}</span>
            </div>

            {/* Height 10-300 */}
            <div className="info-item" onClick={() => handleFieldClick('Height')}>
                <span>Height</span>
                <span>{bodyInfo.height || 'Enter here...'}</span>
            </div>

            {/* Weight 50-300 */}
            <div className="info-item" onClick={() => handleFieldClick('Weight')}>
                <span>Weight</span>
                <span>{bodyInfo.weight || 'Enter here...'}</span>
            </div>

            {/* Alcohol Perference */}
            <div className="info-item" onClick={() => handleFieldClick('drinkPreference')}>
                <span>Drinking Preference</span>
                <span>{bodyInfo.drinkPreference}</span>
            </div>

            {/* Pop window */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <p className="white-on-blue-button-top-right"  onClick={handleSave}>Save</p>
                <h2 className='Modal-heading-top-center'> Edit {currentField}</h2>

                {/* Use the dropdown to choose gender */}
                {currentField === 'Gender' && (
                    <select value={newValue} onChange={(e) => setNewValue(e.target.value)}>
                        {genderOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                )}

                
                {/* Use dropdown to choose alcohol perference */}
                {currentField === 'drinkPreference' && (
                    <select value={newValue} onChange={(e) => setNewValue(e.target.value)}>
                        {drinkPreferenceOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                )}

                {/*  */}
                {/* For other input keep the input textarea */}
                {currentField !== 'Gender' && currentField !== 'drinkPreference' && (
                    <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                    />
                )}

                {/* <button onClick={() => setIsModalOpen(false)}>Cancel</button> */}
            </Modal>
        </div>
    );
};

export default BodyInfo;
