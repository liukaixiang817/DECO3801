import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitOOBEData } from '../api/apiClient';

const OOBE = () => {
    const [age, setAge] = useState(''); // 保持字符串类型
    const [height, setHeight] = useState(''); // 保持字符串类型
    const [weight, setWeight] = useState(''); // 保持字符串类型
    const [drinkingPreference, setDrinkingPreference] = useState('Beer'); // 默认值为 'Beer'
    const [gender, setGender] = useState('male'); // 默认值为 'male'
    const [beerVolume, setBeerVolume] = useState(''); // 保持字符串类型，啤酒体积
    const [hobbies, setHobbies] = useState(['', '', '']); // 用于保存用户选择的爱好
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    // 可供选择的爱好分类
    const hobbyOptions = [
        'Art', 'Creative', 'Culture', 'Exhibitions', 'Free', 'Performing arts',
        'Workshops', 'Fitness & well-being', 'Family events', 'Green', 'Tours',
        'Music', 'Featured', 'Festivals', 'Food', 'Films', 'Markets'
    ];

    useEffect(() => {
        // 优先从 URL 中提取参数
        const queryParams = new URLSearchParams(window.location.search);
        const urlUsername = queryParams.get('username');
        const urlEmail = queryParams.get('email');

        // 从 localStorage 获取数据
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');

        // 设置优先级：URL 中的参数优先级高于 localStorage
        const finalUsername = urlUsername || storedUsername;
        const finalEmail = urlEmail || storedEmail;

        // 如果从 URL 中提取到数据，则将其存储到 localStorage
        if (urlUsername && urlEmail) {
            localStorage.setItem('username', urlUsername);
            localStorage.setItem('email', urlEmail);
        }

        if (finalUsername && finalEmail) {
            setUsername(finalUsername);
            setEmail(finalEmail);
        } else {
            // 如果没有找到 username 或 email，则重定向到注册页面
            alert('Username or Email not found. Please login or register.');
            navigate('/register');
        }
    }, [navigate]);

    // 根据体重和性别计算推荐饮酒限量，并转换为啤酒体积
    useEffect(() => {
        if (weight && gender) {
            const weightInGrams = parseFloat(weight) * 1000; // 确保 weight 转换为数值
            let limitInGrams = 0;
            if (gender === 'male') {
                limitInGrams = (0.08 * weightInGrams * 0.68) / 100;
            } else if (gender === 'female') {
                limitInGrams = (0.08 * weightInGrams * 0.55) / 100;
            }

            // 转换为啤酒体积 (ml)
            const beerVolumeInMl = (limitInGrams / (0.05 * 0.789)).toFixed(2);
            setBeerVolume(String(beerVolumeInMl)); // 确保 beerVolume 为字符串类型
        }
    }, [weight, gender]);

    const handleHobbyChange = (index, value) => {
        const newHobbies = [...hobbies];
        newHobbies[index] = value;
        setHobbies(newHobbies);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 构建提交的数据，将 weeklyLimit 设置为 beerVolume
        const oobeData = {
            age: age.trim(),
            height: height.trim(),
            weight: weight.trim(),
            drinkingPreference,
            gender,
            weeklyLimit: beerVolume, // 上传的是啤酒体积量
            hobbies: hobbies.filter(hobby => hobby), // 只提交非空的爱好
            username,
            email
        };

        console.log("Submitting OOBE data:", oobeData);

        try {
            const response = await submitOOBEData(oobeData);

            if (response.success) {
                alert('OOBE Data Submitted Successfully!');

                const username = localStorage.getItem('username');
                const email = localStorage.getItem('email');
                if (username && email) {
                    const redirectURL = `https://deco.lkx666.cn/home?username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`;
                    window.location.href = redirectURL; // 使用 window.location.href 进行 URL 跳转
                } else {
                    console.error('Username or email not found in localStorage.');
                    alert('Unable to proceed: Missing username or email.');
                }
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
                    {/* Age */}
                    <input
                        type="text"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />

                    {/* Height */}
                    <input
                        type="text"
                        placeholder="Height (cm)"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        required
                    />

                    {/* Weight */}
                    <input
                        type="text"
                        placeholder="Weight (kg)"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                    />

                    {/* Gender Selection */}
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>

                    {/* Hobby Selection */}
                    <p>Select your three hobbies:</p>
                    {hobbies.map((hobby, index) => (
                        <select
                            key={index}
                            value={hobby}
                            onChange={(e) => handleHobbyChange(index, e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Hobby</option>
                            {hobbyOptions.map((option, i) => (
                                <option key={i} value={option}>{option}</option>
                            ))}
                        </select>
                    ))}

                    {/* Drinking Preference Selection */}
                    <p>Your preferred drink is:</p>
                    <div className="drinking-preference">
                        {['Beer', 'Wine', 'Spirits', 'Cocktail', 'Sake'].map((drink, index) => (
                            <label key={index}>
                                <input
                                    type="radio"
                                    value={drink}
                                    checked={drinkingPreference === drink}
                                    onChange={(e) => setDrinkingPreference(e.target.value)}
                                />
                                {drink}
                            </label>
                        ))}
                    </div>

                    {/* Weekly Limit Display */}
                    {gender === 'male' || gender === 'female' ? (
                        <p>Your recommended weekly drink limit is approximately {beerVolume} ml of beer.</p>
                    ) : (
                        <input
                            type="text"
                            placeholder="Weekly Limit (e.g., 10 ml)"
                            value={beerVolume}
                            onChange={(e) => setBeerVolume(e.target.value)}
                            required
                        />
                    )}

                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default OOBE;
