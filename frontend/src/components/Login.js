import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/apiClient';

const Login = ({ setIsLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [turnstileToken, setTurnstileToken] = useState(null);
    const navigate = useNavigate();

    const loadTurnstile = () => {
        if (!document.getElementById('turnstile-script')) {
            const script = document.createElement('script');
            script.id = 'turnstile-script';
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
            script.async = true;
            script.defer = true;
            script.onload = () => {
                window.turnstile.render('#turnstile-container', {
                    sitekey: '00000D',
                    callback: (token) => setTurnstileToken(token)
                });
            };
            document.body.appendChild(script);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!turnstileToken) {
            alert("Please finish verification");
            return;
        }

        const loginData = { username, password };

        try {
            const response = await loginUser({ ...loginData, turnstileToken });

            if (response.success) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                setIsLoggedIn(true);
                navigate('/home');  // 登录成功后跳转到主页
            } else {
                alert('Login failed: ' + response.message);
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed: Network or server error');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Alcohol Controller</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div id="turnstile-container" style={{ margin: '10px 0' }}></div>
                    <button type="button" onClick={loadTurnstile}>
                        Load CAPTCHA
                    </button>
                    <button type="submit">Sign in</button>

                    <a className="forgot-password" href="/reset-password">Forgot password?</a>
                    <a className="signup-link" href="/register">New to the App? Create an account</a>
                </form>
            </div>
        </div>
    );
};

export default Login;
