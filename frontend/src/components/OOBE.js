import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitOOBEData } from '../api/apiClient';

const OOBE = () => {
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [weeklyLimit, setWeeklyLimit] = useState('');
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        if (!storedUsername || !storedEmail) {
            alert('Username or Email not found. Please login or register.');
            navigate('/register'); // 如果没有找到 username 或 email，则重定向到注册页面
        } else {
            setUsername(storedUsername);
            setEmail(storedEmail);
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const oobeData = { age, gender, weeklyLimit, username, email };

        try {
            const response = await submitOOBEData(oobeData);

            if (response.success) {
                alert('OOBE Data Submitted Successfully!');
                navigate('/home'); // 提交成功后跳转到主页
            } else {
                alert('Submission failed: ' + response.message);
            }
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Submission failed: Network or server error');
        }
    };

    return (
        <div className="oobe-container">
            <div className="oobe-box">
                <h2>Welcome! Let's Set Up Your Profile</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="WallmartBag">Wallmart Bag</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Weekly Limit (e.g., 10) ml"
                        value={weeklyLimit}
                        onChange={(e) => setWeeklyLimit(e.target.value)}
                        required
                    />
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default OOBE;
