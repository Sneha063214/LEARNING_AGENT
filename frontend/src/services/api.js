const API_BASE_URL = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('learnpath_token') || '1';
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('learnpath_token', token);
  } else {
    localStorage.removeItem('learnpath_token');
  }
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('learnpath_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('learnpath_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('learnpath_user');
  }
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMessage = 'Request failed';
    try {
      const errData = await response.json();
      errMessage = errData.error || errData.message || errMessage;
    } catch {
      errMessage = `HTTP error ${response.status}`;
    }
    throw new Error(errMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Subjects & Topics
  getSubjects: () => request('/subjects'),
  getSubjectTopics: (subjectId) => request(`/subjects/${subjectId}/topics`),

  // Assessments
  generateAssessment: (payload) => request('/assessment/generate', { method: 'POST', body: JSON.stringify(payload) }),
  submitAssessment: (payload) => request('/assessment/submit', { method: 'POST', body: JSON.stringify(payload) }),
  getAssessmentHistory: () => request('/assessment/history'),
  getAssessmentDetail: (id) => request(`/assessment/${id}`),

  // Knowledge Gaps
  getGapAnalysis: (subjectId) => request(`/gap-analysis${subjectId ? `?subject_id=${subjectId}` : ''}`),

  // Roadmap
  getRoadmap: (subjectId) => request(`/roadmap/${subjectId}`),
  regenerateRoadmap: (subjectId) => request(`/roadmap/regenerate/${subjectId}`, { method: 'POST' }),
  toggleTask: (taskId) => request(`/roadmap/task/${taskId}/toggle`, { method: 'POST' }),
  getDownloadPdfUrl: (pathId) => `${API_BASE_URL}/roadmap/${pathId}/download-pdf`,

  // AI Tutor
  sendTutorMessage: (payload) => request('/tutor/chat', { method: 'POST', body: JSON.stringify(payload) }),
  getTutorHistory: (topicId) => request(`/tutor/history${topicId ? `?topic_id=${topicId}` : ''}`),
  explainConcept: (payload) => request('/tutor/explain', { method: 'POST', body: JSON.stringify(payload) }),

  // Analytics
  getDashboardAnalytics: () => request('/analytics/dashboard'),

  // Resources
  getResources: (topicId) => request(`/resources${topicId ? `?topic_id=${topicId}` : ''}`),

  // Health
  checkHealth: () => request('/health'),
};
