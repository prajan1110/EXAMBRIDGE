/**
 * API Service
 * Handles all interactions with the backend API
 */

import axios from 'axios';

// API base URL - use the proxy in development
const API_URL = '/api';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (!error.response) {
      console.error('Network error:', error.message);
    } else {
      console.error('API error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

// Add auth token to all requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API
const authAPI = {
  // Register a new user
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },

  // Upload certificate and update status
  uploadCertificate: async (certificateUrl) => {
    try {
      const response = await api.put('/auth/profile', { certificateUrl });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },

  // Update verification status (teacher/admin only)
  updateVerification: async (userId, verificationStatus, recommendedFeatures) => {
    try {
      // Ensure recommendedFeatures is properly formatted
      const formattedFeatures = recommendedFeatures || [];
      
      // Log verification request for debugging
      console.log('Updating verification:', {
        userId,
        verificationStatus,
        recommendedFeatures: formattedFeatures
      });
      
      const response = await api.put('/auth/verification', {
        userId,
        verificationStatus,
        recommendedFeatures: formattedFeatures,
      });
      
      return response.data;
    } catch (error) {
      console.error('Verification update error:', error);
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Analytics API
const analyticsAPI = {
  // Track page visit
  trackVisit: async () => {
    try {
      await api.post('/analytics/track-visit');
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  },

  // Track feature usage
  trackFeature: async (feature) => {
    try {
      await api.post('/analytics/track-feature', { feature });
    } catch (error) {
      console.error(`Error tracking feature ${feature}:`, error);
    }
  },

  // Get analytics dashboard (teacher/admin only)
  getAnalyticsDashboard: async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data.analytics;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },
};

export { authAPI, analyticsAPI };