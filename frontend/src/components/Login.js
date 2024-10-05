import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/apiClient';

const Login = ({ setIsLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [isTurnstileLoaded, setIsTurnstileLoaded] = useState(false); // 检查 Turnstile 是否加载完成
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Initializing Turnstile and AppleID...');

        // 加载 Turnstile 验证
        //loadTurnstile();
        setTurnstileToken('bypass-token');
        // 初始化 Sign in with Apple
        const initializeAppleSignIn = () => {
            if (window.AppleID) {
                console.log('AppleID SDK Loaded');
                window.AppleID.auth.init({
                    clientId: 'soberup.uq', // 替换为 Apple Client ID
                    scope: 'name email',
                    redirectURI: 'https://login.lkx666.cn/apple-callback',
                    state: 'STATE',
                    responseMode: 'form_post', // 改为 "query"
                    responseType: 'code code id_token' // 仅请求 code
                });
            } else {
                console.warn('AppleID not loaded yet');
            }
        };

        // 检查并加载 AppleID SDK
        if (!window.AppleID) {
            console.log('Loading AppleID SDK...');
            const script = document.createElement('script');
            script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
            script.onload = () => {
                console.log('AppleID SDK script loaded');
                initializeAppleSignIn();
            };
            document.head.appendChild(script);
        } else {
            initializeAppleSignIn();
        }
    }, []); // 将依赖数组设为空

    // 加载 Turnstile 验证脚本
    const loadTurnstile = () => {
        if (!document.getElementById('turnstile-script')) {
            console.log('Loading Turnstile script...');
            const script = document.createElement('script');
            script.id = 'turnstile-script';
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('Turnstile script loaded');
                window.turnstile.render('#turnstile-container', {
                    sitekey: '0x4AAAAAAAiT6lPVpxiLdQKD',
                    callback: (token) => {
                        console.log('Turnstile token received:', token);
                        setTurnstileToken(token);
                        setIsTurnstileLoaded(true); // 标记为已加载
                    }
                });
            };
            document.body.appendChild(script);
        } else {
            console.log('Turnstile script already exists, rendering turnstile...');
            window.turnstile.render('#turnstile-container', {
                sitekey: '0x4AAAAAAAiT6lPVpxiLdQKD',
                callback: (token) => {
                    console.log('Turnstile token received:', token);
                    setTurnstileToken(token);
                    setIsTurnstileLoaded(true); // 标记为已加载
                }
            });
        }
    };

    // Apple 登录处理
    const handleAppleLogin = async () => {
        try {
            console.log('Attempting Apple sign-in...');
            const response = await window.AppleID.auth.signIn(); // 捕获苹果登录的返回结果
            console.log('Apple sign-in response:', response);
            const { authorization } = response;
            const { code, state } = authorization;

            // 检查是否获得了授权码
            if (code) {
                console.log('Apple authorization code:', code);
                // 将授权码和其他数据发送到后端进行处理
                const res = await fetch('https://login.lkx666.cn/apple-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, state })
                });

                const data = await res.json();
                console.log('Response from server:', data);

                // 根据服务器返回的结果处理
                if (data.needsOOBE) {
                    console.log('Redirecting to OOBE...');
                    navigate('/oobe');
                } else {
                    console.log('Setting login status...');
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('username', data.username);
                    setIsLoggedIn(true);
                    console.log('Redirecting to home...');
                    navigate('/home');
                }
            } else {
                console.error('Authorization code not found');
            }
        } catch (error) {
            console.error('Apple Sign-In Error:', error);
        }
    };

    // 普通登录处理
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!turnstileToken) {
            alert("Please finish verification");
            return;
        }

        const loginData = { username, password };
        console.log('Attempting login with:', loginData);

        try {
            const response = await loginUser({ ...loginData, turnstileToken });
            console.log('Response from loginUser:', response);

            if (response.success) {
                console.log('Login successful, setting localStorage...');
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                setIsLoggedIn(true);
                console.log('Redirecting to home...');
                navigate('/home');
            } else {
                console.log('Login failed:', response.message);
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
                <h2>Sober Up</h2>

                <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
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

                    {/* Cloudflare Turnstile container */}
                    <div id="turnstile-container" style={{ margin: '10px 0' }}></div>

                    {/* Customized Sign in with Apple Button */}
                    <div
                        id="appleid-signin"
                        onClick={handleAppleLogin}
                        style={{
                            margin: '10px auto',
                            cursor: 'pointer',
                            width: '250px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#000',
                            color: '#fff',
                            borderRadius: '5px',
                            fontSize: '14px',
                            fontWeight: '500',
                            textAlign: 'center',
                            padding: '8px 16px',
                            maxWidth: '100%',
                        }}
                    >
                        <i className="fab fa-apple" style={{ marginRight: '8px', fontSize: '16px' }}></i>
                        <span>Sign in with Apple</span>
                    </div>

                    <button type="submit">Sign in</button>

                    <a className="forgot-password" href="/reset-password">Forgot password?</a>
                    <a className="signup-link" href="/register">New to the App? Create an account</a>
                </form>
            </div>
        </div>
    );
};

export default Login;
