import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // import useNavigate to do the navigation
import { fetchProfileWithEmail, updateWeeklyLimit } from '../api/apiClient';  // API for fetching and updating
import Modal from './PopWindow';
import './Profile.css';  // import css file to use in this page
import './styles.css'

const convertToBeerEquivalent = (drinkType, volume) => {
    const multipliers = {
        beer: 1,         // 啤酒不需要转换
        wine: 2.86,      // 葡萄酒相当于 2.86 倍的啤酒
        spirits: 2.5,    // 烈酒相当于 2.5 倍的啤酒
        cocktail: 2.54,  // 鸡尾酒相当于 2.54 倍的啤酒
        sake: 0.97       // 清酒相当于 0.97 倍的啤酒
    };

    const multiplier = multipliers[drinkType.toLowerCase()] || 1;
    const beerEquivalentVolume = (volume / multiplier).toFixed(2); // 将输入体积转换为等效的啤酒体积
    return parseFloat(beerEquivalentVolume);
};

const convertBeerToStandardDrinks = (beerMl) => {
    const BEER_STANDARD_DRINK = 1.4;  // 375ml 啤酒 = 1.4 标准饮品单位
    const BEER_VOLUME = 375;          // 每份啤酒的标准体积
    return ((beerMl / BEER_VOLUME) * BEER_STANDARD_DRINK).toFixed(2); // 返回标准饮品单位
};





const Profile = ({ setIsLoggedIn }) => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        weekly_limit: '750',  // get rid of  "ml"，as we wll add it on the frontend
        drinkType: 'beer',  // set the default drink type to beer，decapitalize to match the multipliers key
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
        const storedDrinkType = localStorage.getItem('drinkType');  // 从 localStorage 获取 drinkType
        console.log("Stored username and drink type from localStorage:", storedUsername, storedDrinkType);

        if (storedUsername) {
            fetchProfileWithEmail(storedUsername)  // 调用 API 获取用户信息
                .then(data => {
                    console.log("Fetched profile with email from backend:", data);

                    if (data && !data.error) {
                        const retrievedDrinkType = storedDrinkType || data.drinkType || profile.drinkType;
                        const multiplier = multipliers[retrievedDrinkType.toLowerCase()] || 1; // 获取饮料类型的系数
                        const adjustedLimit = (data.weeklyLimit * multiplier).toFixed(2); // 使用系数调整后的限额值

                        setProfile({
                            username: data.username || 'Unknown',
                            email: data.email || '',
                            weekly_limit: adjustedLimit,  // 使用调整后的限制值
                            drinkType: retrievedDrinkType,
                        });
                        setNewWeeklyLimit(adjustedLimit);  // 初始化调整后的 weekly_limit

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

    // 保存新的每周限制
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

    // 当选择饮料类型时更新 weekly_limit 显示（除以倍率并保留两位小数）
    const handleDrinkTypeChange = (e) => {
        const selectedDrink = e.target.value.toLowerCase();  // 将选中的饮料类型转换为小写以匹配 multipliers 的 key
        const multiplier = multipliers[selectedDrink] || 1;  // 如果找不到匹配的倍率，使用默认的 1
        const adjustedLimit = (profile.weekly_limit / multiplier).toFixed(2);  // 计算新的限制并保留两位小数
        setProfile({ ...profile, drinkType: selectedDrink });
        setNewWeeklyLimit(adjustedLimit);  // 更新显示的限制
    };

    // 点击 "My Body Information" 的跳转逻辑
    const handleBodyInfoClick = () => {
        navigate('/body-info');  // 跳转到 /body-info 页面
    };

    // 点击 "My Information" 的跳转逻辑
    const handleMyInfoClick = () => {
        navigate('/my-info');  // 跳转到 /my-info 页面
    };

    // the logic when click privacy statement
    const handlePrivacyStatementClick = () => {
        navigate('/privacy-statement');  // 跳转到 /privacy-statement 页面
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
