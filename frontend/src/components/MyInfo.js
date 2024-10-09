import React, { useState, useEffect } from 'react';
import { fetchUserInfo, updateUserInfo } from '../api/apiClient';  // make sure updateUserInfo has been imported
import Modal from './PopWindow';
import './MyInfo.css';  // import CSS style sheet
import './styles.css';
import './BodyInfo.css';
import { useNavigate } from 'react-router-dom';
import {css} from "@emotion/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const MyInfo = () => {
    const [userInfo, setUserInfo] = useState({
        username: '',
        email: '',
        hobbies: ['', '', ''], // 初始化用户的爱好
        drinkingPreference: 'Beer',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentField, setCurrentField] = useState(null);
    const [newValue, setNewValue] = useState('');
    const [isUsernameChange, setIsUsernameChange] = useState(false);  // mark if the username is changed
    const [newHobbies, setNewHobbies] = useState(['', '', '']); // 用于保存新的爱好
    const navigate = useNavigate();

    // 可供选择的爱好分类
    const hobbyOptions = [
        'Art', 'Creative', 'Culture', 'Exhibitions', 'Free', 'Performing arts',
        'Workshops', 'Fitness & well-being', 'Family events', 'Green', 'Tours',
        'Music', 'Featured', 'Festivals', 'Food', 'Films', 'Markets'
    ];

    const drinkPreferenceOptions = ['Beer', 'Wine', 'Spirits', 'Cocktail', 'Sake']; // 确保选项首字母大写

    useEffect(() => {
        const username = localStorage.getItem('username');  // fetch user name from localStorage
        if (username) {
            console.log("Fetching user info for username:", username);  // Navigation information
            fetchUserInfo(username)
                .then(data => {
                    console.log("User info fetched:", data);  // print out user info from backend
                    if (data && !data.error) {
                        setUserInfo(data);  // if in the database update state
                        setNewHobbies(data.hobbies || ['', '', '']); // 设置用户的爱好
                    } else {
                        console.error("Error in user info response:", data.error);  // print out the error message
                    }
                })
                .catch(error => {
                    console.error('Error fetching user information:', error);
                });
        } else {
            console.error('Username not found in localStorage');
        }
    }, []);

    // open the Modal and set the field to be modified
    const handleFieldClick = (field) => {
        console.log("Field clicked:", field);  // print out the field clicked
        setCurrentField(field);
        setNewValue(userInfo[field] || '');  // initialize the value in the pop window
        setIsModalOpen(true);

        if (field === 'username') {
            console.log("Username change detected, enabling username change flow");
            setIsUsernameChange(true);  // mark as username change
        } else {
            setIsUsernameChange(false);  // mark as not username change
        }
    };

    // update on the new hobbies
    const handleHobbyChange = (index, value) => {
        const updatedHobbies = [...newHobbies];
        updatedHobbies[index] = value;
    
        // Remove empty selections
        const filteredHobbies = updatedHobbies.filter(hobby => hobby !== "");
    
        // If all selections are empty, don't update
        if (filteredHobbies.length === 0) {
            return;
        }
    
        // If there are empty selections, fill them with existing hobbies
        while (filteredHobbies.length < newHobbies.length) {
            const existingHobby = newHobbies.find(hobby => !filteredHobbies.includes(hobby) && hobby !== "");
            if (existingHobby) {
                filteredHobbies.push(existingHobby);
            } else {
                break; // No more existing hobbies to add
            }
        }
    
        setNewHobbies(filteredHobbies);
    };

    // save the updated info or username
    const handleSave = () => {
        const originalUsername = localStorage.getItem('username');  // get current username from localStorage
        console.log("Original username from localStorage:", originalUsername);  // Navigation information
        console.log("New value for field:", currentField, newValue);  // print out the new value user input

        if (originalUsername) {
            if (isUsernameChange) {
                // pass the old and new username to the backend
                const updatedData = { oldUsername: originalUsername, newUsername: newValue };
                console.log("Attempting to update username from", originalUsername, "to", newValue);  // Navigation information

                updateUserInfo(originalUsername, updatedData)  // send the update request
                    .then(response => {
                        console.log("Username update response:", response);  // print out the updated outcome
                        if (response.success) {
                            console.log("Username updated successfully");
                            setUserInfo(prev => ({ ...prev, username: newValue }));  // update the username in the frontend
                            localStorage.setItem('username', newValue);  // update the username in localStorage
                            setIsModalOpen(false);  // close the pop window
                            alert('Username updated successfully!');  // alert the user when success
                        } else {
                            console.error("Error updating username:", response.error);  // print out the error message
                            alert(`Error updating username: ${response.error}`);
                        }
                    })
                    .catch(error => {
                        console.error('Error updating username:', error);
                        alert('An error occurred while updating username.');
                    });
            } else if (currentField === 'hobbies') {
                // 如果修改的是爱好
                const updatedData = { hobbies: newHobbies };
                console.log("Updating hobbies for username:", originalUsername, "with data:", updatedData);  // Navigation information

                updateUserInfo(originalUsername, updatedData)  // send the update request
                    .then(response => {
                        console.log("Hobbies update response:", response);  // print out the updated outcome
                        if (response.success) {
                            console.log("Hobbies updated successfully");
                            setUserInfo(prev => ({ ...prev, hobbies: newHobbies }));  // update the hobbies in the frontend
                            setIsModalOpen(false);  // close the pop window
                        } else {
                            console.error("Error updating hobbies:", response.error);  // print out the error message
                            alert(`Error updating hobbies: ${response.error}`);
                        }
                    })
                    .catch(error => {
                        console.error('Error updating hobbies:', error);
                        alert('An error occurred while updating hobbies.');
                    });
            }
            else if (currentField === 'drinkingPreference') {
                const updatedData = { drinkingPreference: newValue };
                console.log("Updating drink preference for username:", originalUsername, "with data:", updatedData);

                updateUserInfo(originalUsername, updatedData)  // 发送更新请求
                    .then(response => {
                        if (response.success) {
                            console.log("Drink preference updated successfully");
                            setUserInfo(prev => ({ ...prev, drinkingPreference: newValue }));  // 更新前端的饮品偏好
                            localStorage.setItem('drinkType', newValue);  // 将饮品偏好存储到 localStorage
                            setIsModalOpen(false);  // 关闭弹窗
                        } else {
                            console.error("Error updating drink preference:", response.error);  // 输出错误信息
                            alert(`Error updating drink preference: ${response.error}`);
                        }
                    })
                    .catch(error => {
                        console.error('Error updating drink preference:', error);
                        alert('An error occurred while updating drink preference.');
                    });
            }
            else {
                // if change other fields
                const updatedData = { [currentField]: newValue };
                console.log("Updating user info for username:", originalUsername, "with data:", updatedData);  // Navigation information

                updateUserInfo(originalUsername, updatedData)  // send the update request
                    .then(response => {
                        console.log("User info update response:", response);  // print out the updated outcome
                        if (response.success) {
                            console.log("User info updated successfully for field:", currentField);
                            setUserInfo(prev => ({ ...prev, [currentField]: newValue }));  // update the field in the frontend
                            setIsModalOpen(false);  // close the pop window
                        } else {
                            console.error("Error updating user info:", response.error);  // print out the error message
                            alert(`Error updating user info: ${response.error}`);
                        }
                    })
                    .catch(error => {
                        console.error('Error updating user information:', error);
                        alert('An error occurred while updating user info.');
                    });
            }
        } else {
            console.error('Username not found in localStorage');
        }
    };

    // handle user click on back button
    const navigateBack = () => {
        navigate('/Profile');
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleSaveInfo = () => {
        handleSave();
        handleModalClose();
    };

    return (
        <div className="home-container">
            <div className="back-button">
                <FontAwesomeIcon icon="fa-solid fa-angle-left" size="2x" color="#419779" onClick={navigateBack}/>
            </div>

            <h1 className='info-heading'>Edit My Information</h1>

            {/* User name */}
            <div className="my-info-item" onClick={() => handleFieldClick('username')}>
                <span>Username</span>
                <span>{userInfo.username}</span>
            </div>

            {/* Email */}
            <div className="my-info-item" onClick={() => handleFieldClick('email')}>
                <span>Email</span>
                <span>{userInfo.email}</span>
            </div>

            {/* Hobbies */}
            <div className="my-info-item" onClick={() => handleFieldClick('hobbies')}>
                <span>Hobbies</span>
                <span>{userInfo.hobbies.join(', ')}</span>
            </div>


            {/* Drinking Preference
            <div className="my-info-item" onClick={() => handleFieldClick('drinkingPreference')}>
                <span>Drinking Preference</span>
                <span>{userInfo.drinkingPreference}</span>
            </div> */}


            {/* Pop window */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className='flex-container-row'>
                    <p className="blue-on-white-button-middle-left" onClick={handleModalClose}>Cancel</p>
                    <h2 className='Modal-heading-top-center'>Edit {currentField}</h2>
                    <p className='white-on-blue-button-top-right' onClick={handleSaveInfo}>Save</p>
                </div>

                {/* 如果当前字段为hobbies，显示下拉框供选择 */}
                {currentField === 'hobbies' ? (
                        <>
                            {[0, 1, 2].map((index) => (
                                <select
                                    key={index}
                                    value={newHobbies[index] || ""}
                                    onChange={(e) => handleHobbyChange(index, e.target.value)}
                                    required={index === 0}  // 只有第一个选择是必需的
                                >
                                    <option value="" disabled>Select Hobby</option>
                                    {hobbyOptions.map((option, i) => (
                                        <option key={i} value={option}>{option}</option>
                                    ))}
                                </select>
                            ))}
                        </>
                    ) : (
                    <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                    />
                )}

                {/* Drinking Preference Dropdown
                {currentField === 'drinkingPreference' && (
                    <select value={newValue} onChange={(e) => setNewValue(e.target.value)}>
                        {drinkPreferenceOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                )} */}

            </Modal>
        </div>
    );
};

export default MyInfo;
