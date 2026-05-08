// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const login = (email, password) => api.post('/Auth/login', { email, password });
export const register = (data) => api.post('/Auth/register', data);

// ==================== CHAT ====================
export const sendMessage = (data) => api.post('/Chat/send', data);
export const getConversations = () => api.get('/Chat/conversations');
export const getConversation = (id) => api.get(`/Chat/conversations/${id}`);
export const deleteConversation = (id) => api.delete(`/Chat/conversations/${id}`);
export const archiveConversation = (id) => api.put(`/Chat/conversations/${id}/archive`);
export const markMessageAsRead = (messageId) => api.put(`/Chat/messages/${messageId}/read`);
export const searchMessages = (query) => api.get(`/Chat/messages/search?q=${query}`);

// Student to Advisor
export const sendToAdvisor = (message) => api.post('/Chat/send-to-advisor', { message });
export const getAdvisorStudentConversation = (studentId) => api.get(`/Chat/advisor/student-conversation/${studentId}`);
export const replyToStudent = (studentId, message) => api.post('/Chat/advisor/reply-to-student', { studentId, message });

// ==================== USER ====================
export const getProfile = () => api.get('/User/profile');
export const updateProfile = (data) => api.put('/User/profile', data);
export const changePassword = (oldPassword, newPassword) => api.post('/User/change-password', { oldPassword, newPassword });
export const getUserStats = () => api.get('/User/stats');

// ==================== ADMIN ====================
export const getDashboardStats = () => api.get('/Admin/dashboard');
export const getAdminAnalytics = () => api.get('/Admin/analytics');
export const getUsers = () => api.get('/Admin/users');
export const getUserById = (id) => api.get(`/Admin/users/${id}`);
export const toggleUserStatus = (userId) => api.put(`/Admin/users/${userId}/toggle-status`);
export const deleteUser = (userId) => api.delete(`/Admin/users/${userId}`);
export const changeUserRole = (userId, newRole) => api.put(`/Admin/users/${userId}/change-role`, { newRole });
export const updateUserRole = (userId, role) => api.put(`/Admin/users/${userId}/role`, { role });
export const chooseAdvisor = (advisorId) => api.post('/Student/choose-advisor', null, { params: { advisorId } });
export const getUniversityEmails = () => api.get('/Admin/university-emails');
export const addUniversityEmail = (email) => api.post('/Admin/add-university-email', { email });
export const addMultipleUniversityEmails = (emails) => api.post('/Admin/add-university-emails', { emails });
export const deleteUniversityEmail = (id) => api.delete(`/Admin/university-emails/${id}`);
export const deleteAllUniversityEmails = () => api.delete('/Admin/university-emails-all');


// ==================== REGULATIONS ====================
// ✅ للطلاب والمشرفين (من Chat Controller)
export const getRegulations = () => api.get('/Chat/regulations');
export const getRegulationById = (id) => api.get(`/Chat/regulations/${id}`);


export const submitRegistration = (formData) => api.post('/Registration/submit', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getMyRegistrations = () => api.get('/Registration/my-registrations');

export const getAllRegistrations = () => api.get('/Advisor/students/submitted-forms');

export const getAdminRegulations = () => api.get('/Admin/regulations');
export const createRegulation = (data) => api.post('/Admin/regulations', data);
export const updateRegulation = (id, data) => api.put(`/Admin/regulations/${id}`, data);
export const deleteRegulation = (id) => api.delete(`/Admin/regulations/${id}`);

// ==================== ADVISOR ====================
export const getStudents = () => api.get('/Advisor/students');
export const getStudentById = (studentId) => api.get(`/Advisor/students/${studentId}`);
export const getStudentByEmail = (email) => api.get(`/Advisor/student-by-email/${encodeURIComponent(email)}`);
export const getStudentsByLevel = (level) => api.get(`/Advisor/students/by-level/${level}`);
export const getStudentConversations = (studentId) => api.get(`/Advisor/students/${studentId}/conversations`);
export const getAdvisorConversation = (conversationId) => api.get(`/Advisor/conversations/${conversationId}`);
export const sendMessageToStudent = (studentId, message) => api.post(`/Advisor/students/${studentId}/send-message`, message);
export const broadcastToLevel = (level, message) => api.post('/Advisor/broadcast-to-level', { level, message });
export const getAdvisorAnalytics = () => api.get('/Advisor/analytics');
export const getAvailableAdvisors = () => api.get('/Advisor/available-advisors');

export const getStudentStatsByLevel = () => api.get('/Advisor/students/stats-by-level');
export const getStudentsWithSubmittedForms = (level = null) => {
  const url = level ? `/Advisor/students/submitted-forms?level=${level}` : '/Advisor/students/submitted-forms';
  return api.get(url);
};

// ==================== SYSTEM ====================
export const getSystemHealth = () => api.get('/System/health');
export const getSystemStats = () => api.get('/System/stats');
export const getAuditLogs = (page = 1, pageSize = 50) => api.get(`/System/audit-logs?page=${page}&pageSize=${pageSize}`);

// ==================== EXPORTS FOR COMPATIBILITY ====================
export const adminAPI = {
  getDashboard: getDashboardStats,
  getAnalytics: getAdminAnalytics,
  getUsers: getUsers,
  getUserById: getUserById,
  toggleUserStatus: toggleUserStatus,
  deleteUser: deleteUser,
  changeUserRole: changeUserRole,
  updateUserRole: updateUserRole,
  getRegulations: getRegulations,
  createRegulation: createRegulation,
  updateRegulation: updateRegulation,
  deleteRegulation: deleteRegulation,
    getUniversityEmails: getUniversityEmails,  
  addUniversityEmail: addUniversityEmail,
  addMultipleUniversityEmails: addMultipleUniversityEmails,
  deleteUniversityEmail: deleteUniversityEmail,
  deleteAllUniversityEmails: deleteAllUniversityEmails,
};


export const advisorAPI = {
  getStudents: getStudents,
  getStudentById: getStudentById,
  getStudentByEmail: getStudentByEmail,
  getStudentsByLevel: getStudentsByLevel,
  getStudentConversations: getStudentConversations,
  getAdvisorConversation: getAdvisorConversation,
  sendMessageToStudent: sendMessageToStudent,
  broadcastToLevel: broadcastToLevel,
  getAnalytics: getAdvisorAnalytics,
  getStudentStatsByLevel: getStudentStatsByLevel,
  getStudentsWithSubmittedForms: getStudentsWithSubmittedForms,
};

export default api;