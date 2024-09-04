import React from 'react';

const Settings = () => {
    return (
        <div>
            <h2>Settings</h2>
            <button onClick={() => alert('Privacy Statement: Here are the details of our privacy policy.')}>Privacy Statement</button>
            <button onClick={() => alert('Alcohol Prevention Hotline: Call the hotline at 1800-123-456')}>Alcohol Prevention Hotline</button>
        </div>
    );
};

export default Settings;
