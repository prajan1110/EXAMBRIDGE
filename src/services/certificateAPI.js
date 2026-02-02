/**
 * Fix for the certificate upload API service
 * Adds proper file upload functionality
 */

import axios from 'axios';

// API base URL - use the proxy in development
const API_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Certificate API
const certificateAPI = {
  // Upload certificate file
  uploadCertificate: async (file) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('certificate', file);
      
      // Set proper content type for multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      // Send to the correct endpoint
      const response = await axios.post(`${API_URL}/certificate/upload`, formData, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },
  
  // Get certificate verification status
  getCertificateStatus: async () => {
    try {
      const response = await api.get('/certificate/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },

  
};

export { certificateAPI };