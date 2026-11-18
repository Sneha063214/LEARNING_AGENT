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
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

// Helper to normalize assessment answers whether passed as an Object map {qId: ans} or Array
function normalizeAssessmentSubmission(firstArg, secondArg) {
  let assessment_id = null;
  let rawAnswers = {};

  if (typeof firstArg === 'object' && firstArg !== null && !secondArg) {
    assessment_id = firstArg.assessment_id;
    rawAnswers = firstArg.answers || {};
  } else {
    assessment_id = firstArg;
    rawAnswers = (secondArg && secondArg.answers) || secondArg || {};
  }

  const answersArray = Array.isArray(rawAnswers)
    ? rawAnswers
    : Object.entries(rawAnswers).map(([qId, ans]) => ({
        question_id: Number(qId),
        selected_answer: ans,
      }));

  return { assessment_id: Number(assessment_id), answers: answersArray };
}

export const api = {
  // Auth
  login: (credentials) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (data) =>
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Subjects & Topics
  getSubjects: () => request('/subjects'),
  getSubjectTopics: (subjectId) => request(`/subjects/${subjectId}/topics`),

  // Assessments (normalizes count/question_count and object/array answers)
  generateAssessment: (payload) =>
    request('/assessment/generate', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        count: payload.count || payload.question_count || 5,
      }),
    }),
  submitAssessment: (firstArg, secondArg) => {
    const bodyPayload = normalizeAssessmentSubmission(firstArg, secondArg);
    return request('/assessment/submit', {
      method: 'POST',
      body: JSON.stringify(bodyPayload),
    }).then((res) => ({
      ...res,
      proficiency_classification:
        res.proficiency_classification || res.proficiency_level || 'Moderate',
      adaptive_recommendations:
        res.adaptive_recommendations || res.recommendations || [],
      questions_review: (res.questions_review || res.detailed_results || []).map((q, i) => ({
        ...q,
        id: q.id || q.question_id || i,
        user_answer: q.user_answer ?? q.selected_answer ?? '',
      })),
    }));
  },
  getAssessmentHistory: () => request('/assessment/history'),
  getAssessmentDetail: (id) => request(`/assessment/${id}`),

  // Knowledge Gaps (normalizes backend response shape for both Dashboard & GapAnalysisPage)
  getGapAnalysis: (subjectId) =>
    request(`/gap-analysis${subjectId ? `?subject_id=${subjectId}` : ''}`).then((res) => {
      const rawTopics = res.topics || res.topic_gaps || [];
      const topics = rawTopics.map((t, idx) => ({
        ...t,
        topic_id: t.topic_id || t.id || idx + 1,
        topic_name: t.topic_name || t.name || 'Topic',
        difficulty: t.difficulty || t.difficulty_level || 'Intermediate',
        proficiency_level: t.proficiency_level || 'Unassessed',
        average_score: t.average_score ?? t.score_percentage ?? 0,
        latest_score: t.latest_score ?? t.score_percentage ?? 0,
        attempts_count: t.attempts_count ?? t.total_attempts ?? (t.score_percentage != null ? 1 : 0),
        recommended_action:
          t.recommended_action ||
          t.reasoning ||
          'Complete a diagnostic assessment to benchmark your mastery.',
      }));

      const weak_count =
        res.summary?.weak_count ??
        topics.filter((t) => t.proficiency_level === 'Weak').length;
      const moderate_count =
        res.summary?.moderate_count ??
        topics.filter((t) => t.proficiency_level === 'Moderate').length;
      const strong_count =
        res.summary?.strong_count ??
        topics.filter((t) => t.proficiency_level === 'Strong').length;
      const unassessed_count =
        res.summary?.unassessed_count ??
        topics.filter((t) => t.proficiency_level === 'Unassessed').length;

      return {
        ...res,
        topics,
        summary: {
          ...res.summary,
          weak_count,
          moderate_count,
          strong_count,
          unassessed_count,
          total_topics: topics.length,
        },
      };
    }),

  // Roadmap (normalizes task toggle & regeneration responses)
  getRoadmap: (subjectId) =>
    request(`/roadmap/${subjectId}`).then((res) => {
      const tasks = res.tasks || [];
      const completed = tasks.filter((t) => t.status === 'completed').length;
      return {
        ...res,
        description: res.description || res.summary || '',
        total_tasks: res.total_tasks ?? tasks.length,
        completed_tasks: res.completed_tasks ?? completed,
        progress_percentage:
          res.progress_percentage ??
          (tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0),
      };
    }),
  regenerateRoadmap: (arg) => {
    const subjectId = typeof arg === 'object' && arg !== null ? arg.subject_id : arg;
    return request(`/roadmap/regenerate/${subjectId}`, { method: 'POST' }).then((res) => {
      const rm = res.roadmap || res;
      return { ...res, roadmap: rm };
    });
  },
  toggleTask: (taskId) =>
    request(`/roadmap/task/${taskId}/toggle`, { method: 'POST' }),
  updateRoadmapTask: async (taskId) => {
    const res = await request(`/roadmap/task/${taskId}/toggle`, { method: 'POST' });
    if (res.roadmap) return res.roadmap;
    // Fetch fresh roadmap for active subject if toggle endpoint only returns status
    const subjId = res.subject_id || 1;
    return api.getRoadmap(subjId);
  },
  getDownloadPdfUrl: (pathId) => `${API_BASE_URL}/roadmap/${pathId}/download-pdf`,

  // AI Tutor
  sendTutorMessage: (payload) =>
    request('/tutor/chat', { method: 'POST', body: JSON.stringify(payload) }),
  getTutorHistory: (topicId) =>
    request(`/tutor/history${topicId ? `?topic_id=${topicId}` : ''}`),
  explainConcept: (payload) =>
    request('/tutor/explain', { method: 'POST', body: JSON.stringify(payload) }).then((res) => ({
      ...res,
      content: res.content || res.explanation || '',
    })),

  // Analytics (supports both method names)
  getDashboardAnalytics: () => request('/analytics/dashboard'),
  getAnalyticsDashboard: () => request('/analytics/dashboard'),

  // Resources (supports both curated and live search calls)
  getResources: (topicId) =>
    request(`/resources${topicId ? `?topic_id=${topicId}` : ''}`),
  getCuratedResources: async (subjectId) => {
    const topics = await request(`/subjects/${subjectId}/topics`);
    const gapData = await api.getGapAnalysis(subjectId);
    const profMap = {};
    (gapData.topics || []).forEach((t) => {
      profMap[t.topic_id] = t.proficiency_level;
    });

    const enrichedTopics = await Promise.all(
      topics.map(async (t) => {
        let resList = [];
        try {
          const rData = await request(`/resources?topic_id=${t.id}`);
          resList = Array.isArray(rData) ? rData : rData.resources || [];
        } catch {
          resList = [];
        }
        return {
          topic_id: t.id,
          topic_name: t.name,
          description: t.description,
          difficulty: t.difficulty_level || t.difficulty || 'Intermediate',
          proficiency_level: profMap[t.id] || 'Unassessed',
          resources: resList.map((r) => ({
            ...r,
            type: r.type || r.resource_type || 'article',
          })),
        };
      })
    );
    return { topics: enrichedTopics };
  },
  searchResources: (query) =>
    request(`/resources?query=${encodeURIComponent(query)}`).then((res) => ({
      results: (Array.isArray(res) ? res : res.resources || res.results || []).map((r) => ({
        ...r,
        type: r.type || r.resource_type || 'tutorial',
      })),
    })),

  // Health
  checkHealth: () => request('/health'),
};