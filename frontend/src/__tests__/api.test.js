import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAuthToken,
  setAuthToken,
  getCurrentUser,
  setCurrentUser,
  normalizeAssessmentSubmission,
} from '../services/api';

describe('API Service Auth Storage & Payload Normalization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults auth token to demo student ID 1 and persists updates', () => {
    expect(getAuthToken()).toBe('1');
    setAuthToken('signed.hmac.token');
    expect(getAuthToken()).toBe('signed.hmac.token');
    setAuthToken(null);
    expect(getAuthToken()).toBe('1');
  });

  it('serializes and clears current user state safely', () => {
    expect(getCurrentUser()).toBeNull();
    setCurrentUser({ id: 7, name: 'Test Learner' });
    expect(getCurrentUser()).toEqual({ id: 7, name: 'Test Learner' });
    setCurrentUser(null);
    expect(getCurrentUser()).toBeNull();
  });

  it('normalizes both object-map and array assessment submissions', () => {
    const fromMap = normalizeAssessmentSubmission(12, { answers: { 101: 'True', 102: '24' } });
    expect(fromMap).toEqual({
      assessment_id: 12,
      answers: [
        { question_id: 101, selected_answer: 'True' },
        { question_id: 102, selected_answer: '24' },
      ],
    });

    const fromObj = normalizeAssessmentSubmission({
      assessment_id: '15',
      answers: [{ question_id: 201, selected_answer: 'O(log n)' }],
    });
    expect(fromObj.assessment_id).toBe(15);
    expect(fromObj.answers).toHaveLength(1);
  });
});
