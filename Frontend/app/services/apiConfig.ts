// services/axios-config.ts - MINIMAL VERSION
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ------------------------ BASE API ------------------------
const API_URL = "http://10.42.4.19:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Add token manually in each request instead of using interceptor
export const setAuthToken = async () => {
  try {
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      }
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Call this when your app starts
setAuthToken();