import React, { useState, useEffect } from 'react';
import { fetchUserInfo, updateUserInfo } from '../api/apiClient';  // make updateUserInfo has been imported
import Modal from './PopWindow';
import './MyInfo.css';  // import CSS style sheet
import { useNavigate } from 'react-router-dom';

const MyInfo = () => {
    const [userInfo, setUserInfo] = useState({
        username: '',
        email: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentField, setCurrentField] = useState(null);
    const [newValue, setNewValue] = useState('');
    const [isUsernameChange, setIsUsernameChange] = useState(false);  // mark if the username is changed
    const navigate = useNavigate();

    useEffect(() => {
        const username = localStorage.getItem('username');  // fetch user name from localStorage
        if (username) {
            console.log("Fetching user info for username:", username);  // Navigation information
            fetchUserInfo(username)
                .then(data => {
                    console.log("User info fetched:", data);  // print out user info from backend
                    if (data && !data.error) {
                        setUserInfo(data);  // if in the database update state
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
            } else {
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

    return (
        <div className="my-info-page">

            <p className='blue-on-white-button-top-left' onClick={navigateBack} >Back</p>


            <h1 className='info-heading'>Edit My Information</h1>

            {/* User name */}
            <div className="info-item" onClick={() => handleFieldClick('username')}>
                <span>Username</span>
                <span>{userInfo.username}</span>
            </div>

            {/* Email */}
            <div className="info-item" onClick={() => handleFieldClick('email')}>
                <span>Email</span>
                <span>{userInfo.email}</span>
            </div>

            {/* Pop window */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className='flex-container-row'>
                    <p className="blue-on-white-button-middle-left" onClick={handleModalClose} >Cancel</p>
                    <h2 className='Modal-heading-top-center'>Edit {currentField}</h2>
                    <p className='white-on-blue-button-top-right' onClick={navigateBack} >Save</p>
                </div>
                <input 
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default MyInfo;
