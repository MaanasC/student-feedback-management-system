/**
 * Client API Service for connecting React Frontend to Express Backend
 * Supports REST API endpoints with automatic JWT Authorization header injection
 */

const rawApiUrl = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('edufeedback_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // System Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // Authentication (Experiment 6)
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('edufeedback_jwt_token', data.token);
    }
    return data;
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('edufeedback_jwt_token', data.token);
    }
    return data;
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  // Courses (Experiment 5 CRUD)
  getCourses: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE_URL}/courses?${query}` : `${API_BASE_URL}/courses`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  createCourse: async (courseData) => {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return await res.json();
  },

  updateCourse: async (courseId, courseData) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return await res.json();
  },

  deleteCourse: async (courseId) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  // Feedback Forms (Experiment 5 & 7)
  getFeedbackForms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE_URL}/feedback-forms?${query}` : `${API_BASE_URL}/feedback-forms`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  getFormById: async (formId) => {
    const res = await fetch(`${API_BASE_URL}/feedback-forms/${formId}`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  createFeedbackForm: async (formData) => {
    const res = await fetch(`${API_BASE_URL}/feedback-forms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData),
    });
    return await res.json();
  },

  updateFeedbackForm: async (formId, formData) => {
    const res = await fetch(`${API_BASE_URL}/feedback-forms/${formId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData),
    });
    return await res.json();
  },

  toggleFormStatus: async (formId) => {
    const res = await fetch(`${API_BASE_URL}/feedback-forms/${formId}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  deleteFeedbackForm: async (formId) => {
    const res = await fetch(`${API_BASE_URL}/feedback-forms/${formId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  // Feedback Submissions (Section 9.2 #7 Unique Compound Index)
  submitFeedback: async (feedbackPayload) => {
    const res = await fetch(`${API_BASE_URL}/feedback-responses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(feedbackPayload),
    });
    return await res.json();
  },

  getMySubmissions: async () => {
    const res = await fetch(`${API_BASE_URL}/feedback-responses/my`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  getAllResponses: async () => {
    const res = await fetch(`${API_BASE_URL}/feedback-responses`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  getResponseById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/feedback-responses/${id}`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  getResponsesByForm: async (formId) => {
    const res = await fetch(`${API_BASE_URL}/feedback-responses/form/${formId}`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  // Analytics & Reports (Experiment 5)
  getFacultyAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/faculty/dashboard`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  getCourseAnalysis: async (courseId) => {
    const res = await fetch(`${API_BASE_URL}/analytics/course/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  getAdminSummary: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/admin-summary`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  getReports: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE_URL}/analytics/reports${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  // Users Management (Admin only)
  getUsers: async (role) => {
    const url = role ? `${API_BASE_URL}/users?role=${role}` : `${API_BASE_URL}/users`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  createUser: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return await res.json();
  },

  updateUser: async (userId, userData) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return await res.json();
  },

  toggleUserStatus: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  deleteUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  // Notifications (Experiment 7 Real-time Persistent)
  getNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  deleteNotification: async (id) => {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },
};

export default api;
