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

// 更新每周限制的 API
export const updateWeeklyLimit = async (username, newLimit) => {
    try {
        const response = await apiClient.post('/update-limit', { username, weekly_limit: newLimit });
        return response.data;
    } catch (error) {
        console.error('Error updating weekly limit:', error);
        throw error;
    }
};

// Home.js 使用的 fetchHomeData
export const fetchHomeData = async (username) => {
    try {
        const response = await apiClient.get(`/home/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching home data:', error);
        throw error;
    }
};
// Apple 登录 API
export const appleLogin = async (appleData) => {
    try {
        const response = await apiClient.post('/apple-login', appleData);
        return response.data;
    } catch (error) {
        console.error('Apple Sign-In failed:', error);
        throw error;
    }
};

// 登录用户的 API
export const loginUser = async (loginData) => {
    try {
        const response = await apiClient.post('/login', loginData);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

// 注册用户的 API
export const registerUser = async (registrationData) => {
    try {
        const response = await apiClient.post('/register', registrationData);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

// 提交 OOBE 数据的 API
export const submitOOBEData = async (oobeData) => {
    try {
        const response = await apiClient.post('/oobe', oobeData);
        return response.data;
    } catch (error) {
        console.error('OOBE data submission failed:', error);
        throw error;
    }
};

// 修改后的 getProfiles，传递用户名参数以获取特定用户的 Profile 数据
export const getProfiles = async (username) => {
    try {
        const response = await apiClient.get(`/profiles?username=${username}`); // 根据用户名动态获取
        return response.data;  // 假设返回的结构为 Profile 的数组
    } catch (error) {
        console.error('Error fetching profiles:', error);
        throw error;
    }
};

// 创建 Profile 的 API
export const createProfile = async (profileData) => {
    try {
        const response = await apiClient.post('/profiles', profileData);
        return response.data;
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
};

// 获取事件的 API
export const getEvents = async () => {
    try {
        const response = await apiClient.get('/events');
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

// 获取事件详情的 API
export const getEventDetails = async (eventId) => {
    try {
        const response = await apiClient.get(`/events/${eventId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching event details:', error);
        throw error;
    }
};

// 记录饮酒量的 API
export const recordDrink = async (username, amount, type) => {
    try {
        const response = await apiClient.post('/recordDrink', { username, amount, type });
        return response.data;
    } catch (error) {
        console.error('Error recording drink:', error);
        throw error;
    }
};

// 新增：获取饮酒历史记录的 API
export const getDrinkHistory = async (username) => {
    try {
        const response = await apiClient.get(`/getDrinkHistory/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching drink history:', error);
        throw error;
    }
};

// 获取身体信息的 API
export const fetchBodyInfo = async (username) => {
    try {
        const response = await apiClient.post('/body-info', { username });  // 使用 POST 请求传递 username
        return response.data;
    } catch (error) {
        console.error('Error fetching body information:', error);
        throw error;
    }
};

// 更新身体信息的 API
export const updateBodyInfo = async (username, data) => {
    try {
        const response = await apiClient.post('/update-body-info', { username, ...data });
        return response.data;
    } catch (error) {
        console.error('Error updating body information:', error);
        throw error;
    }
};

// 删除用户的 API
export const deleteUser = async (username) => {
    try {
        const response = await apiClient.post('/delete-user', { username });
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// 克隆用户的 API
export const cloneUser = async (username, newUsername) => {
    try {
        const response = await apiClient.post('/clone-user', { username, newUsername });
        return response.data;
    } catch (error) {
        console.error('Error cloning user:', error);
        throw error;
    }
};

// 更新用户名的 API
export const updateUsername = async (oldUsername, newUsername) => {
    try {
        const response = await apiClient.post('/update-username', { oldUsername, newUsername });
        return response.data;
    } catch (error) {
        console.error('Error updating username:', error);
        throw error;
    }
};

// 新增：获取用户信息的 API
export const fetchUserInfo = async (username) => {
    try {
        const response = await apiClient.post('/user-info', { username });
        return response.data;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
};

// 新增：更新用户信息的 API
export const updateUserInfo = async (username, data) => {
    try {
        const response = await apiClient.post('/update-user-info', { username, ...data });
        return response.data;
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
};

// 新增：复制用户并创建新用户的 API
export const duplicateUser = async (oldUsername, newUsername) => {
    try {
        const response = await apiClient.post('/duplicate-user', { oldUsername, newUsername });
        return response.data;
    } catch (error) {
        console.error('Error duplicating user:', error);
        throw error;
    }
};

// 新增：签到的 API
export const checkin = async (username) => {
    try {
        const response = await apiClient.post('/checkin', { username });
        return response.data;
    } catch (error) {
        console.error('Error during check-in:', error);
        throw error;
    }
};
