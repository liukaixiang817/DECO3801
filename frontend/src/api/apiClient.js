import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://login.lkx666.cn',
    //baseURL: 'http://192.168.1.4:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchHomeData = async (username) => {
    try {
        const response = await apiClient.get(`/home/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching home data:', error);
        throw error;
    }
};

export const loginUser = async (loginData) => {
    try {
        const response = await apiClient.post('/login', loginData);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const registerUser = async (registrationData) => {
    try {
        const response = await apiClient.post('/register', registrationData);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

export const submitOOBEData = async (oobeData) => {
    try {
        const response = await apiClient.post('/oobe', oobeData);
        return response.data;
    } catch (error) {
        console.error('OOBE data submission failed:', error);
        throw error;
    }
};

export const getProfiles = async () => {
    try {
        const response = await apiClient.get('/profiles');
        return response.data;
    } catch (error) {
        console.error('Error fetching profiles:', error);
        throw error;
    }
};

export const createProfile = async (profileData) => {
    try {
        const response = await apiClient.post('/profiles', profileData);
        return response.data;
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
};

export const getEvents = async () => {
    try {
        const response = await apiClient.get('/events');
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

export const getEventDetails = async (eventId) => {
    try {
        const response = await apiClient.get(`/events/${eventId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching event details:', error);
        throw error;
    }
};

// 新增的记录饮酒量的API调用
export const recordDrink = async (username, amount) => {
    try {
        const response = await apiClient.post('/recordDrink', { username, amount });
        return response.data;
    } catch (error) {
        console.error('Error recording drink:', error);
        throw error;
    }
};
