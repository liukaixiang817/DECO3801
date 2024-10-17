import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // import useNavigate to do the navigation
import { fetchProfileWithEmail, updateWeeklyLimit } from '../api/apiClient';  // API for fetching and updating
import Modal from './PopWindow';
import './Profile.css';  // import css file to use in this page
import './styles.css'

const convertToBeerEquivalent = (drinkType, volume) => {
    const multipliers = {
        beer: 1,         // Beer doesn't need conversion
        wine: 2.86,      // Wine is equivalent to 2.86 times beer
        spirits: 2.5,    // Spirits are equivalent to 2.5 times beer
        cocktail: 2.54,  // Cocktails are equivalent to 2.54 times beer
        sake: 0.97       // Sake is equivalent to 0.97 times beer
    };

    const multiplier = multipliers[drinkType.toLowerCase()] || 1;
    const beerEquivalentVolume = (volume / multiplier).toFixed(2); // Convert input volume to equivalent beer volume
    return parseFloat(beerEquivalentVolume);
};

const convertBeerToStandardDrinks = (beerMl) => {
    const BEER_STANDARD_DRINK = 1.4;  // 375ml beer = 1.4 standard drink units
    const BEER_VOLUME = 375;          // Standard volume per serving of beer
    return ((beerMl / BEER_VOLUME) * BEER_STANDARD_DRINK).toFixed(2); // Return standard drink units
};





const Profile = ({ setIsLoggedIn }) => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        weekly_limit: '750',  // get rid of  "ml", as we will add it on the frontend
        drinkType: 'beer',  // set the default drink type to beer, decapitalize to match the multipliers key
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [newWeeklyLimit, setNewWeeklyLimit] = useState(profile.weekly_limit);  // storing weekly limit
    const navigate = useNavigate();  // use this to jump to other pages

    // set up ratios
    const multipliers = {
        beer: 1,
        wine: 2.86,
        spirits: 2.5,
        cocktail: 2.54,
        sake: 0.97,
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedDrinkType = localStorage.getItem('drinkType');  // Get drinkType from localStorage
        console.log("Stored username and drink type from localStorage:", storedUsername, storedDrinkType);

        if (storedUsername) {
            fetchProfileWithEmail(storedUsername)  // Call API to get user information
                .then(data => {
                    console.log("Fetched profile with email from backend:", data);

                    if (data && !data.error) {
                        const retrievedDrinkType = storedDrinkType || data.drinkType || profile.drinkType;
                        const multiplier = multipliers[retrievedDrinkType.toLowerCase()] || 1; // Get coefficient for drink type
                        const adjustedLimit = (data.weeklyLimit * multiplier).toFixed(2); // Adjusted limit value using coefficient

                        setProfile({
                            username: data.username || 'Unknown',
                            email: data.email || '',
                            weekly_limit: adjustedLimit,  // Use adjusted limit value
                            drinkType: retrievedDrinkType,
                        });
                        setNewWeeklyLimit(adjustedLimit);  // Initialize adjusted weekly_limit

                        console.log("Updated profile state:", {
                            username: data.username || 'Unknown',
                            email: data.email || '',
                            weekly_limit: adjustedLimit,
                            drinkType: retrievedDrinkType
                        });
                    } else {
                        console.log("No profile data found.");
                    }
                })
                .catch(error => {
                    console.error("Error fetching profile with email:", error);
                });
        } else {
            console.error("No username found in localStorage.");
        }
    }, []);



    // the function to open the modal
    const handleOpen = () => setIsOpen(true);

    // the function to close the modal
    const handleClose = () => setIsOpen(false);

    // Save new weekly limit
    const handleUpdateLimit = () => {
        updateWeeklyLimit(profile.username, newWeeklyLimit)
            .then(response => {
                if (response.success) {
                    setProfile(prev => ({ ...prev, weekly_limit: newWeeklyLimit }));
                    // alert('Weekly limit updated successfully!');
                } else {
                    alert('Failed to update weekly limit');
                }
            })
            .catch(error => {
                console.error("Error updating weekly limit:", error);
            });
    };

    // Update weekly_limit display when selecting drink type (divide by multiplier and keep two decimal places)
    const handleDrinkTypeChange = (e) => {
        const selectedDrink = e.target.value.toLowerCase();  // Convert selected drink type to lowercase to match multipliers key
        const multiplier = multipliers[selectedDrink] || 1;  // If no matching multiplier is found, use default of 1
        const adjustedLimit = (profile.weekly_limit / multiplier).toFixed(2);  // Calculate new limit and keep two decimal places
        setProfile({ ...profile, drinkType: selectedDrink });
        setNewWeeklyLimit(adjustedLimit);  // Update displayed limit
    };

    // Navigation logic when clicking "My Body Information"
    const handleBodyInfoClick = () => {
        navigate('/body-info');  // Navigate to /body-info page
    };

    // Navigation logic when clicking "My Information"
    const handleMyInfoClick = () => {
        navigate('/my-info');  // Navigate to /my-info page
    };

    // the logic when click privacy statement
    const handlePrivacyStatementClick = () => {
        navigate('/privacy-statement');  // Navigate to /privacy-statement page
    };


    const handleSaveWeeklyLimit = () => {
        handleUpdateLimit();
        handleClose();
    }

    const avatarLetter = profile.username ? profile.username.charAt(0).toUpperCase() : '?';

    return (
        <div className="home-container">
            <div className="profile-header">
                <div className="profile-avatar">{avatarLetter}</div>
                <h2 className='profile-h2'>{profile.username}</h2>
                <p className="profile-email">{profile.email}</p>
            </div>


            <div className="profile-limit">
                <div className="profile-limit-row">
                    <label>Your weekly limit is</label>
                    <span>{profile.drinkType.charAt(0).toUpperCase() + profile.drinkType.slice(1)}</span>
                    <span className="gold-text">{newWeeklyLimit} ml</span>
                </div>
                <div className="profile-limit-row">
                    <p>(Converted to <span className="gold-text">
                        {
                            convertBeerToStandardDrinks(convertToBeerEquivalent(profile.drinkType, newWeeklyLimit))
                        }
                    </span> standard drinks)</p>
                </div>


                <button className='profile-button' onClick={handleOpen}>Change my goals</button>
            </div>


            <Modal isOpen={isOpen} onClose={handleClose}>
                <div className='flex-container-row'>
                    <p className="blue-on-white-button-middle-left" onClick={handleClose}>Cancel</p>
                    <h2>Change Weekly Limit</h2>
                    <p className='white-on-blue-button-top-right' onClick={handleSaveWeeklyLimit}>Save</p>
                </div>
                <input
                    type="number"
                    value={newWeeklyLimit}
                    onChange={(e) => setNewWeeklyLimit(e.target.value)}
                />
                {/* <button onClick={handleUpdateLimit}>Save</button>
                    <button onClick={handleClose}>Cancel</button> */}
            </Modal>

            <div className="profile-menu">
                {/* Rewards moved to the menu section */}
                {/* <div className="profile-menu-item" onClick={handleRewardsClick}>
                        <span className="menu-icon">🏆</span>
                        <span>Rewards</span>
                        <span className="menu-arrow">{'>'}</span>
                    </div> */}

                {/* My Information */}
                <div className="profile-menu-item" onClick={handleMyInfoClick}>
                    <span className="menu-icon">📋</span>
                    <span>My Information</span>
                    <span className="menu-arrow">{'>'}</span>
                </div>

                {/* Body Info */}
                <div className="profile-menu-item" onClick={handleBodyInfoClick}>
                    <span className="menu-icon">💪</span>
                    <span>Body Information</span>
                    <span className="menu-arrow">{'>'}</span>
                </div>

                {/* Privacy Statement */}
                <div className="profile-menu-item" onClick={handlePrivacyStatementClick}>
                    <span className="menu-icon">📄</span>
                    <span>Privacy Statement</span>
                    <span className="menu-arrow">{'>'}</span>
                </div>

            </div>

            {/* log out button */}
            <div className="logout-button-container">
                <div className='logout-button' onClick={() => {
                    localStorage.clear();
                    setIsLoggedIn(false);
                    navigate('/login');
                }}>
                    Log Out
                </div>
            </div>
        </div>
    );
};

export default Profile;
