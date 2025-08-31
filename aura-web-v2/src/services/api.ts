// src/services/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('aura_token')}`,
  'Content-Type': 'application/json'
});

// For debugging in production
if (import.meta.env.DEV) {
  console.log('🚀 API Base URL:', API_BASE_URL);
}