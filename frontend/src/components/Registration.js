import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/apiClient';

const Registration = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [turnstileToken, setTurnstileToken] = useState(null);
    const navigate = useNavigate();

    // useEffect for automatically loading CAPTCHA
    useEffect(() => {
        //loadTurnstile();
        setTurnstileToken('bypass-token');
    }, []);

    const loadTurnstile = () => {
        if (!document.getElementById('turnstile-script')) {
            const script = document.createElement('script');
            script.id = 'turnstile-script';
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
            script.async = true;
            script.defer = true;
            script.onload = () => {
                window.turnstile.render('#turnstile-container', {
                    sitekey: '0x4AAAAAAAiT6lPVpxiLdQKD',
                    callback: (token) => setTurnstileToken(token)
                });
            };
            document.body.appendChild(script);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!turnstileToken) {
            alert("Please finish verification");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const registrationData = { username, email, password };

        try {
            const response = await registerUser({ ...registrationData, turnstileToken });

            if (response.success) {
                localStorage.setItem('username', username);
                localStorage.setItem('email', email);
                alert('Registration successful!');
                navigate('/oobe'); // Redirect to OOBE page after successful registration
            } else {
                alert('Registration failed: ' + response.message);
            }
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed: Network or server error');
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-box">
                <h2>Create Your Account</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <div id="turnstile-container" style={{ margin: '10px 0' }}></div>

                    <button type="submit">Register</button>
                </form>
                {/* Add "Already have an account?" button */}
                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    style={{ marginTop: '10px', cursor: 'pointer' }}
                >
                    Already have an account?
                </button>
            </div>
        </div>
    );
};

export default Registration;
