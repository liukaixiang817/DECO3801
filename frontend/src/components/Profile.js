import React, { useState, useEffect } from 'react';
import { getProfiles, createProfile } from '../api/apiClient';
import Modal from './PopWindow';


const Profile = () => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        weekly_limit: ''
    });

    const [isOpen, setIsOpen] = useState(false);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

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
            <div>
                <button onClick={handleOpen}>Open Modal</button>
                <Modal isOpen={isOpen} onClose={handleClose}>
                    <h2>Modal Title</h2>
                    <p>This is a modal window. You can do whatever you like here.</p>
                    {/* 下拉菜单 */}
                    <select>
                    <option value="">Select an option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                    </select>

                    {/* 按钮 */}
                    <button>Submit Choice</button>
                </Modal>
                
            </div>
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
