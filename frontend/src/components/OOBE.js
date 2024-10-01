import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitOOBEData } from '../api/apiClient';

const OOBE = () => {
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [drinkingPreference, setDrinkingPreference] = useState('');
    const [gender, setGender] = useState('');
    const [beerVolume, setBeerVolume] = useState(''); // 啤酒体积
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

    // 根据体重和性别计算推荐饮酒限量，并转换为啤酒体积
    useEffect(() => {
        if (weight && gender) {
            const weightInGrams = weight * 1000;
            let limitInGrams = 0;
            if (gender === 'male') {
                limitInGrams = (0.08 * weightInGrams * 0.68) / 100;
            } else if (gender === 'female') {
                limitInGrams = (0.08 * weightInGrams * 0.55) / 100;
            }

            // 转换为啤酒体积 (ml)
            const beerVolumeInMl = (limitInGrams / (0.05 * 0.789)).toFixed(2);
            setBeerVolume(beerVolumeInMl);
        }
    }, [weight, gender]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 构建提交的数据，将 weeklyLimit 设置为 beerVolume
        const oobeData = {
            age,
            height,
            weight,
            drinkingPreference,
            gender,
            weeklyLimit: beerVolume, // 上传的是啤酒体积量
            username,
            email
        };

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
                    <input
                        type="number"
                        placeholder="Height (cm)"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        required
                    />
                    <input
                        type="number"
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

                    {/* Drinking Preference Selection */}
                    <p>Your preferred drink is:</p>
                    <div className="drinking-preference">
                        <label>
                            <input
                                type="radio"
                                value="Beer"
                                checked={drinkingPreference === 'Beer'}
                                onChange={(e) => setDrinkingPreference(e.target.value)}
                            />
                            Beer
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="Wine"
                                checked={drinkingPreference === 'Wine'}
                                onChange={(e) => setDrinkingPreference(e.target.value)}
                            />
                            Wine
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="Spirits"
                                checked={drinkingPreference === 'Spirits'}
                                onChange={(e) => setDrinkingPreference(e.target.value)}
                            />
                            Spirits
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="Cocktail"
                                checked={drinkingPreference === 'Cocktail'}
                                onChange={(e) => setDrinkingPreference(e.target.value)}
                            />
                            Cocktail
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="Sake"
                                checked={drinkingPreference === 'Sake'}
                                onChange={(e) => setDrinkingPreference(e.target.value)}
                            />
                            Sake
                        </label>
                    </div>

                    {/* Weekly Limit Display */}
                    {gender === 'male' || gender === 'female' ? (
                        <p>Your recommended weekly drink limit is approximately {beerVolume} ml of beer.</p>
                    ) : (
                        <input
                            type="number"
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
