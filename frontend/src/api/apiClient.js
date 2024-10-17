import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://20.11.49.12:10802/',
    //baseURL: 'http://localhost:8000/',
    //baseURL: 'https://login.lkx666.cn/',
    headers: {
        'Content-Type': 'application/json',
    },
});
// Fetch profile by email
export const fetchProfileWithEmail = async (username) => {
    try {
        const response = await apiClient.get(`/profileWithEmail?username=${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching profile with email:', error);
        throw error;
    }
};

// API to update weekly limit
export const updateWeeklyLimit = async (username, newLimit) => {
    try {
        const response = await apiClient.post('/update-limit', { username, weekly_limit: newLimit });
        return response.data;
    } catch (error) {
        console.error('Error updating weekly limit:', error);
        throw error;
    }
};

// fetchHomeData used by Home.js
export const fetchHomeData = async (username) => {
    try {
        const response = await apiClient.get(`/home/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching home data:', error);
        throw error;
    }
};

// Apple login API
export const appleLogin = async (appleData) => {
    try {
        const response = await apiClient.post('/apple-login', appleData);
        return response.data;
    } catch (error) {
        console.error('Apple Sign-In failed:', error);
        throw error;
    }
};

// API for user login
export const loginUser = async (loginData) => {
    try {
        const response = await apiClient.post('/login', loginData);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

// API for user registration
export const registerUser = async (registrationData) => {
    try {
        const response = await apiClient.post('/register', registrationData);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

// API to submit OOBE data
export const submitOOBEData = async (oobeData) => {
    try {
        const response = await apiClient.post('/oobe', oobeData);
        return response.data;
    } catch (error) {
        console.error('OOBE data submission failed:', error);
        throw error;
    }
};

// Modified getProfiles to pass username parameter for fetching specific user's Profile data
export const getProfiles = async (username) => {
    try {
        const response = await apiClient.get(`/profiles?username=${username}`); // Dynamically fetch based on username
        return response.data;  // Assuming the returned structure is an array of Profiles
    } catch (error) {
        console.error('Error fetching profiles:', error);
        throw error;
    }
};

// API to create Profile
export const createProfile = async (profileData) => {
    try {
        const response = await apiClient.post('/profiles', profileData);
        return response.data;
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
};

// API to get events
export const getEvents = async () => {
    try {
        const response = await apiClient.get('/events');
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

// API to get event details
export const getEventDetails = async (eventId) => {
    try {
        const response = await apiClient.get(`/events/${eventId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching event details:', error);
        throw error;
    }
};

// API to record drink
export const recordDrink = async (username, amount, type) => {
    try {
        const response = await apiClient.post('/recordDrink', { username, amount, type });
        return response.data;
    } catch (error) {
        console.error('Error recording drink:', error);
        throw error;
    }
};

// New: API to get drink history
export const getDrinkHistory = async (username) => {
    try {
        const response = await apiClient.get(`/getDrinkHistory/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching drink history:', error);
        throw error;
    }
};

// API to fetch body information
export const fetchBodyInfo = async (username) => {
    try {
        const response = await apiClient.post('/body-info', { username });  // Use POST request to pass username
        return response.data;
    } catch (error) {
        console.error('Error fetching body information:', error);
        throw error;
    }
};

// API to update body information
export const updateBodyInfo = async (username, data) => {
    try {
        const response = await apiClient.post('/update-body-info', { username, ...data });
        return response.data;
    } catch (error) {
        console.error('Error updating body information:', error);
        throw error;
    }
};

// API to delete user
export const deleteUser = async (username) => {
    try {
        const response = await apiClient.post('/delete-user', { username });
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// API to clone user
export const cloneUser = async (username, newUsername) => {
    try {
        const response = await apiClient.post('/clone-user', { username, newUsername });
        return response.data;
    } catch (error) {
        console.error('Error cloning user:', error);
        throw error;
    }
};

// API to update username
export const updateUsername = async (oldUsername, newUsername) => {
    try {
        const response = await apiClient.post('/update-username', { oldUsername, newUsername });
        return response.data;
    } catch (error) {
        console.error('Error updating username:', error);
        throw error;
    }
};

// New: API to fetch user information
export const fetchUserInfo = async (username) => {
    try {
        const response = await apiClient.post('/user-info', { username });
        return response.data;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
};

// New: API to update user information
export const updateUserInfo = async (username, data) => {
    try {
        const response = await apiClient.post('/update-user-info', { username, ...data });
        return response.data;
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
};

// New: API to duplicate user and create new user
export const duplicateUser = async (oldUsername, newUsername) => {
    try {
        const response = await apiClient.post('/duplicate-user', { oldUsername, newUsername });
        return response.data;
    } catch (error) {
        console.error('Error duplicating user:', error);
        throw error;
    }
};

// New: API for check-in
export const checkin = async (username) => {
    try {
        const response = await apiClient.post('/checkin', { username });
        return response.data;
    } catch (error) {
        console.error('Error during check-in:', error);
        throw error;
    }
};
