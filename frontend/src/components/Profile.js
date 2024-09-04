import React, { useState, useEffect } from 'react';
import { getProfiles, createProfile } from '../api/apiClient';

const Profile = () => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        weekly_limit: ''
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const profiles = await getProfiles();
                setProfile(profiles[0]);  // 假设只返回一个Profile
            } catch (error) {
                console.error(error);
            }
        }

        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            await createProfile(profile);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Profile</h2>
            <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="Username"
            />
            <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Email"
            />
            <input
                type="text"
                value={profile.weekly_limit}
                onChange={(e) => setProfile({ ...profile, weekly_limit: e.target.value })}
                placeholder="Weekly Limit"
            />
            <button onClick={handleSave}>Save Profile</button>
        </div>
    );
};

export default Profile;
