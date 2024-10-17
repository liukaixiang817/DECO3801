import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitOOBEData } from '../api/apiClient';

const OOBE = () => {
    const [age, setAge] = useState(''); // Keep as string type
    const [height, setHeight] = useState(''); // Keep as string type
    const [weight, setWeight] = useState(''); // Keep as string type
    const [drinkingPreference, setDrinkingPreference] = useState('Beer'); // Default value is 'Beer'
    const [gender, setGender] = useState('male'); // Default value is 'male'
    const [beerVolume, setBeerVolume] = useState(''); // Keep as string type, beer volume
    const [hobbies, setHobbies] = useState(['', '', '']); // To store user's selected hobbies
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    // Available hobby categories
    const hobbyOptions = [
        'Art', 'Creative', 'Culture', 'Exhibitions', 'Free', 'Performing arts',
        'Workshops', 'Fitness & well-being', 'Family events', 'Green', 'Tours',
        'Music', 'Featured', 'Festivals', 'Food', 'Films', 'Markets'
    ];

    useEffect(() => {
        // First, extract parameters from URL
        const queryParams = new URLSearchParams(window.location.search);
        const urlUsername = queryParams.get('username');
        const urlEmail = queryParams.get('email');

        // Get data from localStorage
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');

        // Set priority: URL parameters have higher priority than localStorage
        const finalUsername = urlUsername || storedUsername;
        const finalEmail = urlEmail || storedEmail;

        // If data is extracted from URL, store it in localStorage
        if (urlUsername && urlEmail) {
            localStorage.setItem('username', urlUsername);
            localStorage.setItem('email', urlEmail);
        }

        if (finalUsername && finalEmail) {
            setUsername(finalUsername);
            setEmail(finalEmail);
        } else {
            // If username or email is not found, redirect to registration page
            alert('Username or Email not found. Please login or register.');
            navigate('/register');
        }
    }, [navigate]);

    // Calculate recommended drinking limit based on weight and gender, and convert to beer volume
    useEffect(() => {
        if (weight && gender) {
            const weightInGrams = parseFloat(weight) * 1000; // Ensure weight is converted to number
            let limitInGrams = 0;
            if (gender === 'male') {
                limitInGrams = (0.08 * weightInGrams * 0.68) / 100;
            } else if (gender === 'female') {
                limitInGrams = (0.08 * weightInGrams * 0.55) / 100;
            }

            // Convert to beer volume (ml)
            const beerVolumeInMl = (limitInGrams / (0.05 * 0.789)).toFixed(2);
            setBeerVolume(String(beerVolumeInMl)); // Ensure beerVolume is string type

            const standardDrinks = (beerVolumeInMl / 375 * 1.4).toFixed(2);
            setBeerVolume(String(standardDrinks)); // Ensure standard drink units are string type
        }
    }, [weight, gender]);

    const handleHobbyChange = (index, value) => {
        const newHobbies = [...hobbies];
        newHobbies[index] = value;
        setHobbies(newHobbies);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Build submission data, set weeklyLimit to beerVolume
        const oobeData = {
            age: age.trim(),
            height: height.trim(),
            weight: weight.trim(),
            drinkingPreference,
            gender,
            weeklyLimit: beerVolume, // Upload beer volume amount
            hobbies: hobbies.filter(hobby => hobby), // Only submit non-empty hobbies
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
                    window.location.href = redirectURL; // Use window.location.href for URL redirection
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
                        <p style={{ fontSize: '18px' }}>Your suggested weekly limits is {beerVolume} standard drinks.</p>
                    ) : (
                        <input
                            type="text"
                            placeholder="Weekly Limit (e.g., 10 standard drinks)"
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
