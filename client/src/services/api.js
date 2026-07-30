const API_URL = 'http://localhost:5000/api';

// Helper for HTTP requests
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };

  // Only add content type if not uploading FormData (Multipart)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { success: false, message: 'Invalid server response' };
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (resetData) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(resetData) }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Aptitude
  getAptitudeQuestions: (category, difficulty) => {
    let query = '';
    if (category || difficulty) {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      query = `?${params.toString()}`;
    }
    return request(`/aptitude/questions${query}`);
  },
  submitAptitudeTest: (answers, timeTaken, category) => request('/aptitude/submit', {
    method: 'POST',
    body: JSON.stringify({ answers, timeTaken, category }),
  }),
  getAptitudeHistory: () => request('/aptitude/history'),

  // Coding
  getCodingQuestions: (difficulty, tag) => {
    let query = '';
    if (difficulty || tag) {
      const params = new URLSearchParams();
      if (difficulty) params.append('difficulty', difficulty);
      if (tag) params.append('tag', tag);
      query = `?${params.toString()}`;
    }
    return request(`/coding/questions${query}`);
  },
  getCodingQuestionDetails: (id) => request(`/coding/questions/${id}`),
  submitCodingSolution: (id, code, language) => request(`/coding/questions/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ code, language }),
  }),

  // Resume
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return request('/resume/upload', {
      method: 'POST',
      body: formData,
    });
  },
  analyzeResume: (file = null, resumeText = '') => {
    if (file) {
      const formData = new FormData();
      formData.append('resume', file);
      return request('/resume/analyze', {
        method: 'POST',
        body: formData,
      });
    } else {
      return request('/resume/analyze', {
        method: 'POST',
        body: JSON.stringify({ resumeText }),
      });
    }
  },

  // AI Interview
  generateInterviewQuestions: (company, type) => request('/interview/generate', {
    method: 'POST',
    body: JSON.stringify({ company, type }),
  }),
  submitInterviewAnswers: (company, type, responses) => request('/interview/submit', {
    method: 'POST',
    body: JSON.stringify({ company, type, responses }),
  }),
  getInterviewHistory: () => request('/interview/history'),

  // Companies
  getCompanies: () => request('/companies'),
  getCompanyDetails: (id) => request(`/companies/${id}`),

  // Admin
  getAdminUsers: () => request('/admin/users'),
  getAdminAnalytics: () => request('/admin/analytics'),
  addAptitudeQuestion: (questionData) => request('/admin/aptitude', {
    method: 'POST',
    body: JSON.stringify(questionData),
  }),
  addCodingQuestion: (questionData) => request('/admin/coding', {
    method: 'POST',
    body: JSON.stringify(questionData),
  }),
  deleteQuestion: (type, id) => request(`/admin/questions/${type}/${id}`, {
    method: 'DELETE',
  }),
};

export default api;
