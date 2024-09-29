import React, { useState, useEffect } from 'react';
import { fetchHomeData, recordDrink, getDrinkHistory } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const RecordDrinks = () => {
    const [username, setUsername] = useState('');
    const [weeklyLimitUsed, setWeeklyLimitUsed] = useState(0);
    const [weeklyLimit, setWeeklyLimit] = useState(750);
    const [drinkType, setDrinkType] = useState('beer');
    const [amount, setAmount] = useState(0);
    const [submitSuccess, setSubmitSuccess] = useState(null);
    const [history, setHistory] = useState([]);  // 新增用于存储历史记录
    const navigate = useNavigate();

    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    // 添加一些示例数据用于查看设计样式
    const sampleHistory = [
        { type: 'beer', value: 200, time: '2024.08.20 13:50' },
        { type: 'wine', value: 150, time: '2024.08.21 14:30' },
        { type: 'spirits', value: 100, time: '2024.08.22 15:10' }
    ];

    const multipliers = {
        beer: 1,
        wine: 3,
        spirits: 2,
        cocktail: 4,
        sake: 4,
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        console.log('Stored username:', storedUsername);  // 调试
        if (storedUsername) {
            fetchHomeData(storedUsername)
                .then(data => {
                    console.log('Fetched home data:', data);  // 调试
                    setUsername(data.username);
                    setWeeklyLimitUsed(data.weeklyLimitUsed);
                    setWeeklyLimit(data.weeklyLimit);

                    // 获取历史记录
                    return getDrinkHistory(storedUsername);
                })
                .then(historyData => {
                    console.log('Fetched drink history:', historyData);  // 调试

                    // 重新构造历史记录，调整 value 根据比例，手动+10小时
                    const combinedHistory = historyData.recordTime.map((time, index) => {
                        let localTime = new Date(time);
                        localTime.setHours(localTime.getHours() + 10);  // 手动增加 10 小时

                        localTime = localTime.toLocaleString('en-AU', {
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,  // 使用本地时区
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZoneName: 'short',
                            hour12: false  // 关闭12小时制，启用24小时制
                        });

                        return {
                            time: localTime,
                            value: (historyData.recordValue[index] / multipliers[historyData.recordType[index]]).toFixed(2),  // 按比例调整
                            type: historyData.recordType[index],
                        };
                    });

                    setHistory(combinedHistory);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        } else {
            console.error('No username found in localStorage.');
        }
    }, []);

    const handleDrinkRecord = () => {
        const calculatedAmount = amount * multipliers[drinkType];
        console.log('Recording drink for:', { username, amount: calculatedAmount, drinkType });  // 调试

        recordDrink(username, calculatedAmount, drinkType)
            .then(updatedData => {
                console.log('Drink recorded successfully:', updatedData);  // 调试
                setWeeklyLimitUsed(updatedData.weeklyLimitUsed);
                setSubmitSuccess(true);

                // 更新历史记录
                return getDrinkHistory(username);
            })
            .then(updatedHistory => {
                console.log('Updated drink history:', updatedHistory);  // 调试

                // 按比例和本地时间调整历史记录，并手动增加 10 小时
                const combinedHistory = updatedHistory.recordTime.map((time, index) => {
                    let localTime = new Date(time);
                    localTime.setHours(localTime.getHours() + 10);  // 手动增加 10 小时

                    localTime = localTime.toLocaleString('en-AU', {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,  // 使用本地时区
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZoneName: 'short',
                        hour12: false  // 关闭12小时制，启用24小时制
                    });

                    return {
                        time: localTime,
                        value: (updatedHistory.recordValue[index] / multipliers[updatedHistory.recordType[index]]).toFixed(2),  // 按比例调整
                        type: updatedHistory.recordType[index],
                    };
                });

                setHistory(combinedHistory);  // 更新历史记录
                setAmount(0);  // 重置 amount
                setSubmitSuccess(true);  // 成功后设置状态
            })
            .catch(error => {
                console.error('Error recording drink:', error);
                setSubmitSuccess(false);
            });
    };

    return (
        <div className="record-drinks-container">
            <div className="record-drinks-box">
                <h2>Record Drinks</h2>

                {/* 包裹进度条区域的白色圆角容器 */}
                <div className="progress-container">
                    <p>{weeklyLimit - weeklyLimitUsed}ml remains this week</p>
                    <div className="progress-bar">
                        <div className="progress" style={{
                            width: `${(weeklyLimitUsed / weeklyLimit) * 100}%`,
                            backgroundColor: weeklyLimitUsed > weeklyLimit ? 'red' : 'orange'
                        }}></div>
                    </div>
                    <p>Your weekly limit is {weeklyLimit}ml (Converted to beer)</p>
                </div>

                <div className="drink-type-selector">
                    {Object.keys(multipliers).map(type => (
                        <div key={type} className="drink-option">
                            <button
                                className={drinkType === type ? 'selected' : ''}
                                onClick={() => setDrinkType(type)}
                            >
                                <img src={`/${type}.png`} alt={type}/> {/* 假设您有对应的图片 */}
                            </button>
                            <span className="drink-type-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </div>
                    ))}
                </div>

                <div className="amount-input">
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(parseInt(e.target.value))}
                        placeholder="Enter amount in ml"
                    />
                    <button onClick={handleDrinkRecord}>Submit</button>
                </div>

                {submitSuccess !== null && (
                    <div className={`submit-message ${submitSuccess ? 'success' : 'error'}`}>
                        {submitSuccess ? 'Drink recorded successfully!' : 'Failed to record drink.'}
                    </div>
                )}

                {/* Record History Section with larger toggle button */}
                <div className="history-header" onClick={() => setIsHistoryVisible(!isHistoryVisible)}>
                    <h2>Record History</h2>
                    <button className={`toggle-icon ${isHistoryVisible ? 'expanded' : ''}`}>
                        {isHistoryVisible ? '▾' : '▸'}
                    </button>
                </div>

                {isHistoryVisible && (
                    <div className="history-list">
                        {sampleHistory.map((record, index) => (
                            <div key={index} className="history-item">
                                <span>{record.type}</span>
                                <span>{record.value}ml</span>
                                <span>{record.time}</span>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default RecordDrinks;
