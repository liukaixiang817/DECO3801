import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // import useNavigate to do the navigation
import { fetchProfileWithEmail, updateWeeklyLimit } from '../api/apiClient';  // API for fetching and updating
import Modal from './PopWindow';
import './Profile.css';  // import css file to use in this page

const Profile = () => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        weekly_limit: '750',  // get rid of  "ml"，as we wll add it on the frontend
        drinkType: 'beer',  // set the default drink type to beer，decapitalize to match the multipliers key
    });
    const [isOpen, setIsOpen] = useState(false);
    const [newWeeklyLimit, setNewWeeklyLimit] = useState(profile.weekly_limit);  // storing weekly limit
    const navigate = useNavigate();  // use this to jump to other pages

    // set up ratios
    const multipliers = {
        beer: 1,
        wine: 3,
        spirits: 2,
        cocktail: 4,
        sake: 4,
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        console.log("Stored username from localStorage:", storedUsername);

        if (storedUsername) {
            fetchProfileWithEmail(storedUsername)  // use new API
                .then(data => {
                    console.log("Fetched profile with email from backend:", data);

                    if (data && !data.error) {
                        setProfile({
                            username: data.username || 'Unknown',
                            email: data.email || '',
                            weekly_limit: data.weeklyLimit || '750',  // make sure to pass the data part
                            drinkType: profile.drinkType,  // set up drink type
                        });
                        setNewWeeklyLimit(data.weeklyLimit);  // initialize the weekly limit

                        console.log("Updated profile state:", {
                            username: data.username || 'Unknown',
                            email: data.email || '',
                            weekly_limit: data.weeklyLimit || '750',
                            drinkType: profile.drinkType
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
                    setIsOpen(false);  // 成功后关闭弹窗
                    alert('Weekly limit updated successfully!');
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

    const avatarLetter = profile.username ? profile.username.charAt(0).toUpperCase() : '?';

    return (
        <div className="profile-page">  {/* 为整个Profile页面添加 profile-page 类名 */}
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">{avatarLetter}</div>
                    <h2>{profile.username}</h2>
                    <p className="profile-email">{profile.email}</p>
                </div>

                <div className="profile-limit">
                    <div className="profile-limit-row">
                        <label>Your weekly limit is</label>
                        <select
                            value={profile.drinkType}
                            onChange={handleDrinkTypeChange}  // 当选择饮料类型时调用 handleDrinkTypeChange
                        >
                            <option value="beer">Beer</option>
                            <option value="wine">Wine</option>
                            <option value="spirits">Spirits</option>
                            <option value="cocktail">Cocktail</option>
                            <option value="sake">Sake</option>
                        </select>

                        {/* 显示的限制值，设置为橙色并添加 "ml" */}
                        <span className="weekly-limit-text">{newWeeklyLimit} ml</span>
                    </div>
                    <button onClick={handleOpen}>Change my goals</button>
                </div>

                <Modal isOpen={isOpen} onClose={handleClose}>
                    <h2>Change Weekly Limit</h2>
                    <input
                        type="number"
                        value={newWeeklyLimit}
                        onChange={(e) => setNewWeeklyLimit(e.target.value)}
                    />
                    <button onClick={handleUpdateLimit}>Save</button>
                    <button onClick={handleClose}>Cancel</button>
                </Modal>

                <div className="profile-menu">
                    {/* 添加 "My body information" 菜单项，点击后跳转 */}
                    <div className="menu-item" onClick={handleBodyInfoClick}>
                        <span>My body information</span>
                        <span className="menu-arrow">{'>'}</span>
                    </div>

                    {/* 添加 "My Information" 菜单项，点击后跳转 */}
                    <div className="menu-item" onClick={handleMyInfoClick}>
                        <span>My Information</span>
                        <span className="menu-arrow">{'>'}</span>
                    </div>

                    {/* Privacy Statement */}
                    <div className="menu-item" onClick={handlePrivacyStatementClick}>
                        <span>Privacy Statement</span>
                        <span className="menu-arrow">{'>'}</span>
                    </div>

                    {/* Alcohol Prevention Hotline */}
                    <div className="menu-item">
                        <span>Alcohol Prevention Hotline</span>
                        <span className="menu-arrow">{'>'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
