import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfileWithEmail, updateWeeklyLimit } from '../api/apiClient';
import Modal from './PopWindow';
import './Profile.css';
import './styles.css';

// Define multipliers at the top of the file for universal access
const multipliers = {
    beer: 1,
    wine: 2.86,
    spirits: 2.5,
    cocktail: 2.54,
    sake: 0.97,
};

// Function to convert standard drinks to ml based on drink type
const convertStandardDrinksToMl = (standardDrinks, drinkType) => {
    const BEER_STANDARD_DRINK = 1.4; // 375 ml of beer = 1.4 standard drinks
    const BEER_VOLUME = 375; // 375 ml per beer
    const multiplier = multipliers[drinkType.toLowerCase()] || 1;
    return ((standardDrinks * BEER_VOLUME) / BEER_STANDARD_DRINK * multiplier).toFixed(2);
};

// Function to convert ml of a drink to standard drinks
const convertToStandardDrinks = (drinkMl, drinkType) => {
    const BEER_STANDARD_DRINK = 1.4; // 375 ml of beer = 1.4 standard drinks
    const BEER_VOLUME = 375; // 375 ml per beer
    const multiplier = multipliers[drinkType.toLowerCase()] || 1;
    const beerEquivalent = drinkMl / multiplier; // Convert other drink types to beer equivalent
    return (beerEquivalent / BEER_VOLUME * BEER_STANDARD_DRINK).toFixed(2); // Convert beer equivalent to standard drinks
};

const Profile = () => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        weekly_limit: '750',
        drinkType: 'beer',
    });
    const [isOpen, setIsOpen] = useState(false);
    const [newWeeklyLimit, setNewWeeklyLimit] = useState(profile.weekly_limit);
    const navigate = useNavigate();
    const [recommendWeeklyLimit, setRecommendWeeklyLimit] = useState(0); // 添加状态变量

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedDrinkType = localStorage.getItem('drinkType');
        const storedRecommendLimit = localStorage.getItem('recommendWeeklyLimit'); // 从 localStorage 获取推荐限量

        if (storedRecommendLimit) {
            setRecommendWeeklyLimit(parseFloat(storedRecommendLimit)); // 将推荐限量保存到组件状态中
        }

        if (storedUsername) {
            fetchProfileWithEmail(storedUsername)
                .then(data => {
                    if (data && !data.error) {
                        const retrievedDrinkType = storedDrinkType || data.drinkType || profile.drinkType;
                        const multiplier = multipliers[retrievedDrinkType.toLowerCase()] || 1;
                        const adjustedLimit = (data.weeklyLimit * multiplier).toFixed(2);

                        setProfile({
                            username: data.username || 'Unknown',
                            email: data.email || '',
                            weekly_limit: adjustedLimit,
                            drinkType: retrievedDrinkType,
                        });
                        setNewWeeklyLimit(adjustedLimit);
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

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleSaveWeeklyLimit = () => {
        const multiplier = multipliers[profile.drinkType.toLowerCase()] || 1; // 获取当前 drinkType 的转换系数
        const convertedLimit = (newWeeklyLimit / multiplier).toFixed(2); // 根据系数将限制值转换为 beer 类型
        const maxRecommendedLimit = convertStandardDrinksToMl(recommendWeeklyLimit * 1.5, profile.drinkType); // 计算推荐量的150%

        // 检查新限制值是否超过推荐量的150%
        if (parseFloat(newWeeklyLimit) > parseFloat(maxRecommendedLimit)) {
            alert(`It's recommended to set your weekly limit to be less than 150% of the recommended amount: ${maxRecommendedLimit} ml for ${profile.drinkType}.`);
            return; // 阻止保存
        }

        updateWeeklyLimit(profile.username, convertedLimit) // 将转换后的限制值存储到后端
            .then(response => {
                if (response.success) {
                    setProfile(prev => ({ ...prev, weekly_limit: convertedLimit }));
                    handleClose(); // 关闭弹窗
                } else {
                    alert('Failed to update weekly limit');
                }
            })
            .catch(error => {
                console.error("Error updating weekly limit:", error);
            });
    };


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
                    <p>(Converted to <span className="gold-text">{convertToStandardDrinks(newWeeklyLimit, profile.drinkType)}</span> standard drinks)</p>
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
            </Modal>

            <div className="profile-menu">
                <div className="profile-menu-item" onClick={() => navigate('/my-info')}>
                    <span className="menu-icon">📋</span>
                    <span>My Information</span>
                    <span className="menu-arrow">{'>'}</span>
                </div>
                <div className="profile-menu-item" onClick={() => navigate('/body-info')}>
                    <span className="menu-icon">💪</span>
                    <span>Body Information</span>
                    <span className="menu-arrow">{'>'}</span>
                </div>
                <div className="profile-menu-item" onClick={() => navigate('/privacy-statement')}>
                    <span className="menu-icon">📄</span>
                    <span>Privacy Statement</span>
                    <span className="menu-arrow">{'>'}</span>
                </div>
            </div>
        </div>
    );
};

export default Profile;
