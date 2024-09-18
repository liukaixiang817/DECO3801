import React, { useState, useEffect } from 'react';
import { fetchBodyInfo, updateBodyInfo } from '../api/apiClient';
import Modal from './PopWindow';
import './BodyInfo.css';  // 为该页面添加样式
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

    // 定义性别和饮酒偏好的选项
    const genderOptions = ['Male', 'Female', 'Other'];
    const drinkPreferenceOptions = ['beer', 'wine', 'spirits', 'cocktail', 'sake'];

    useEffect(() => {
        const username = localStorage.getItem('username');  // 从 localStorage 获取用户名
        if (username) {
            console.log("Fetching body info for username:", username);  // 调试信息
            fetchBodyInfo(username)
                .then(data => {
                    console.log("Body info fetched:", data);  // 调试信息
                    if (data && !data.error) {
                        setBodyInfo(data);  // 如果数据库中已有信息，更新state
                    } else {
                        console.error("Error in body info response:", data.error);  // 打印错误信息
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
        setNewValue(bodyInfo[field] || '');  // 初始化弹窗中的值
        setIsModalOpen(true);
    };

    // handle user click on back button
    const navigateBack = () => {
        navigate('/Profile');
    };

    // 保存更新
    const handleSave = () => {
        const username = localStorage.getItem('username');  // 获取用户名
        if (username) {
            const updatedData = { [currentField]: newValue };
            console.log("Sending update request for username:", username, "with data:", updatedData);  // 打印调试信息

            updateBodyInfo(username, updatedData)  // 发起更新请求
                .then(response => {
                    console.log("Body info update response:", response);  // 打印更新结果
                    if (response.success) {
                        setBodyInfo(prev => ({ ...prev, [currentField]: newValue }));  // 更新前端显示
                        setIsModalOpen(false);  // 关闭弹窗
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

            {/* 性别 */}
            <div className="info-item" onClick={() => handleFieldClick('Gender')}>
                <span>Gender</span>
                <span>{bodyInfo.gender}</span>
            </div>

            {/* 年龄 */}
            <div className="info-item" onClick={() => handleFieldClick('Age')}>
                <span>Age</span>
                <span>{bodyInfo.age}</span>
            </div>

            {/* 身高 */}
            <div className="info-item" onClick={() => handleFieldClick('Height')}>
                <span>Height</span>
                <span>{bodyInfo.height || 'Enter here...'}</span>
            </div>

            {/* 体重 */}
            <div className="info-item" onClick={() => handleFieldClick('Weight')}>
                <span>Weight</span>
                <span>{bodyInfo.weight || 'Enter here...'}</span>
            </div>

            {/* 饮酒偏好 */}
            <div className="info-item" onClick={() => handleFieldClick('drinkPreference')}>
                <span>Drinking Preference</span>
                <span>{bodyInfo.drinkPreference}</span>
            </div>

            {/* 弹窗 */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <p className="white-on-blue-button-top-right"  onClick={handleSave}>Save</p>
                <h2 className='Modal-heading-top-center'> Edit {currentField}</h2>

                {/* 使用下拉框选择性别 */}
                {currentField === 'Gender' && (
                    <select value={newValue} onChange={(e) => setNewValue(e.target.value)}>
                        {genderOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                )}

                {/* 使用下拉框选择饮酒偏好 */}
                {currentField === 'drinkPreference' && (
                    <select value={newValue} onChange={(e) => setNewValue(e.target.value)}>
                        {drinkPreferenceOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                )}

                {/* 对于其他字段保持原有输入框 */}
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
