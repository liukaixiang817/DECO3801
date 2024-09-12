import React, { useState, useEffect } from 'react';
import { fetchUserInfo, updateUserInfo } from '../api/apiClient';  // 确保 updateUserInfo 被导入
import Modal from './PopWindow';
import './MyInfo.css';  // 引入 CSS 样式

const MyInfo = () => {
    const [userInfo, setUserInfo] = useState({
        username: '',
        email: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentField, setCurrentField] = useState(null);
    const [newValue, setNewValue] = useState('');
    const [isUsernameChange, setIsUsernameChange] = useState(false);  // 标记是否是更改用户名

    useEffect(() => {
        const username = localStorage.getItem('username');  // 从 localStorage 获取用户名
        if (username) {
            console.log("Fetching user info for username:", username);  // 调试信息
            fetchUserInfo(username)
                .then(data => {
                    console.log("User info fetched:", data);  // 打印从后端获取的用户信息
                    if (data && !data.error) {
                        setUserInfo(data);  // 如果数据库中已有信息，更新 state
                    } else {
                        console.error("Error in user info response:", data.error);  // 打印错误信息
                    }
                })
                .catch(error => {
                    console.error('Error fetching user information:', error);
                });
        } else {
            console.error('Username not found in localStorage');
        }
    }, []);

    // 打开弹窗并设置要修改的字段
    const handleFieldClick = (field) => {
        console.log("Field clicked:", field);  // 打印用户点击了哪个字段
        setCurrentField(field);
        setNewValue(userInfo[field] || '');  // 初始化弹窗中的值
        setIsModalOpen(true);

        if (field === 'username') {
            console.log("Username change detected, enabling username change flow");
            setIsUsernameChange(true);  // 标记为更改用户名
        } else {
            setIsUsernameChange(false);  // 标记为更改其他字段
        }
    };

    // 保存更新或者更新用户名
    const handleSave = () => {
        const originalUsername = localStorage.getItem('username');  // 获取当前的原始用户名
        console.log("Original username from localStorage:", originalUsername);  // 调试信息
        console.log("New value for field:", currentField, newValue);  // 打印用户输入的新值

        if (originalUsername) {
            if (isUsernameChange) {
                // 更新用户名时，将新旧用户名一起传递
                const updatedData = { oldUsername: originalUsername, newUsername: newValue };
                console.log("Attempting to update username from", originalUsername, "to", newValue);  // 调试信息

                updateUserInfo(originalUsername, updatedData)  // 发起更新用户名的请求
                    .then(response => {
                        console.log("Username update response:", response);  // 打印更新结果
                        if (response.success) {
                            console.log("Username updated successfully");
                            setUserInfo(prev => ({ ...prev, username: newValue }));  // 更新前端显示的用户名
                            localStorage.setItem('username', newValue);  // 更新 localStorage 中的用户名
                            setIsModalOpen(false);  // 关闭弹窗
                            alert('Username updated successfully!');  // 成功提示
                        } else {
                            console.error("Error updating username:", response.error);  // 打印错误信息
                            alert(`Error updating username: ${response.error}`);
                        }
                    })
                    .catch(error => {
                        console.error('Error updating username:', error);
                        alert('An error occurred while updating username.');
                    });
            } else {
                // 如果是修改其他字段
                const updatedData = { [currentField]: newValue };
                console.log("Updating user info for username:", originalUsername, "with data:", updatedData);  // 调试信息

                updateUserInfo(originalUsername, updatedData)  // 发起更新请求
                    .then(response => {
                        console.log("User info update response:", response);  // 打印更新结果
                        if (response.success) {
                            console.log("User info updated successfully for field:", currentField);
                            setUserInfo(prev => ({ ...prev, [currentField]: newValue }));  // 更新前端显示
                            setIsModalOpen(false);  // 关闭弹窗
                        } else {
                            console.error("Error updating user info:", response.error);  // 打印错误信息
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

    return (
        <div className="my-info-page">
            <h2>Edit My Information</h2>

            {/* 用户名 */}
            <div className="info-item" onClick={() => handleFieldClick('username')}>
                <span>Username</span>
                <span>{userInfo.username}</span>
            </div>

            {/* 邮箱 */}
            <div className="info-item" onClick={() => handleFieldClick('email')}>
                <span>Email</span>
                <span>{userInfo.email}</span>
            </div>

            {/* 弹窗 */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2>Edit {currentField}</h2>
                <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                />
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </Modal>
        </div>
    );
};

export default MyInfo;
