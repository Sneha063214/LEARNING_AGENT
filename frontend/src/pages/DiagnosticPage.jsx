import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  Award
} from 'lucide-react';
import { api } from '../services/api';

export default function DiagnosticPage() {
  const { activeSubjectId, setActiveSubjectId } = useOutletContext();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmIncomplete, setConfirmIncomplete] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api.getSubjects().then(setSubjects).catch(console.error);
  }, []);

  useEffect(() => {
    if (activeSubjectId) {
      api.getSubjectTopics(activeSubjectId)
        .then((t) => {
          setTopics(t);
          setSelectedTopicId('');
        })
        .catch(console.error);
    }
  }, [activeSubjectId]);

  const handleStartDiagnostic = async () => {
    setError('');
    setLoading(true);
    setAssessment(null);
    setResult(null);
    setAnswers({});

    try {
      const data = await api.generateAssessment({
        subject_id: activeSubjectId,
        topic_id: selectedTopicId ? Number(selectedTopicId) : null,
        assessment_type: 'diagnostic',
        question_count: Number(questionCount),
      });
      setAssessment(data);
    } catch (err) {
      setError(err.message || 'Failed to generate diagnostic assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionValue) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue,
    }));
  };

  const submitAnswers = async () => {
    if (!assessment) return;
    setConfirmIncomplete(false);
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(assessment.assessment_id, { answers });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assessment) return;

    const unanswered = assessment.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0 && !confirmIncomplete) {
      setConfirmIncomplete(true);
      return;
    }
    await submitAnswers();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Configuration Header Card */}
      {!assessment && !result && (
        <section aria-labelledby="diagnostic-setup-heading" className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
                <Target className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Module 2: Initial Knowledge Assessment</span>
              </div>
              <h2 id="diagnostic-setup-heading" className="text-xl font-bold text-slate-900">
                Evaluate Your Current Subject Proficiency
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Our AI engine generates a customized diagnostic test to benchmark your conceptual understanding,
                classify topics into Weak, Moderate, or Strong proficiency, and synthesize your adaptive learning roadmap.
              </p>
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label htmlFor="diag-subject-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Subject
              </label>
              <select
                id="diag-subject-select"
                value={activeSubjectId}
                onChange={(e) => setActiveSubjectId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="diag-topic-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scope / Topic Focus
              </label>
              <select
                id="diag-topic-select"
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Full Subject Diagnostic (Recommended)</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.order_index}. {t.name} ({t.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="diag-count-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Number of Questions
              </label>
              <select
                id="diag-count-select"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value={3}>3 Questions (Quick Check)</option>
                <option value={5}>5 Questions (Standard Diagnostic)</option>
                <option value={8}>8 Questions (Deep Evaluation)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Sparkles className="w-4 h-4 text-brand-500" aria-hidden="true" />
              <span>Includes Multiple-Choice & Conceptual True/False verification</span>
            </div>
            <button
              type="button"
              onClick={handleStartDiagnostic}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Generating Assessment...</span>
                </>
              ) : (
                <>
                  <span>Launch Diagnostic Test</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Active Assessment Questions View */}
      {assessment && !result && (
        <form onSubmit={handleSubmit} aria-label="Diagnostic Assessment Questions" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                Diagnostic in Progress
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{assessment.title}</h3>
            </div>
            <div role="status" aria-live="polite" className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
              Answered: {Object.keys(answers).length} / {assessment.questions.length}
            </div>
          </div>

          <div className="space-y-4">
            {assessment.questions.map((q, idx) => (
              <fieldset
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4"
              >
                <legend className="sr-only">Question {idx + 1}: {q.question_text}</legend>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-brand-200/60"
                    >
                      {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {q.question_text}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                    {q.difficulty}
                  </span>
                </div>

                <div
                  role="radiogroup"
                  aria-label={`Options for question ${idx + 1}`}
                  className="grid grid-cols-1 gap-2.5 pl-9"
                >
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-brand-50/80 border-brand-500 text-brand-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt}</span>
                        <span
                          aria-hidden="true"
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {confirmIncomplete && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900"
            >
              <span>
                You still have unanswered questions. Submit anyway or review your responses first?
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmIncomplete(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100"
                >
                  Continue Reviewing
                </button>
                <button
                  type="button"
                  onClick={submitAnswers}
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setAssessment(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Evaluating & Updating Roadmap...' : 'Submit Diagnostic & Analyze Gaps'}
            </button>
          </div>
        </form>
      )}

      {/* Results & Instant Remediation Breakdown */}
      {result && (
        <section aria-labelledby="diagnostic-result-heading" aria-live="polite" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
                  <Award className="w-4 h-4" aria-hidden="true" />
                  Diagnostic Evaluation Complete
                </span>
                <h3 id="diagnostic-result-heading" className="text-2xl font-bold text-slate-900">
                  You scored {result.score_percentage}% ({result.correct_answers}/{result.total_questions})
                </h3>
                <p className="text-xs text-slate-600">
                  Knowledge Proficiency Classification:{' '}
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    result.proficiency_classification === 'Strong'
                      ? 'bg-emerald-100 text-emerald-800'
                      : result.proficiency_classification === 'Moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.proficiency_classification}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/roadmap')}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2"
                >
                  <span>View Updated Adaptive Roadmap</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => { setAssessment(null); setResult(null); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  Take Another Test
                </button>
              </div>
            </div>

            {/* Adaptive Engine Recommendation Banner */}
            {result.adaptive_recommendations?.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-brand-50/70 border border-brand-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
                  <Sparkles className="w-4 h-4 text-brand-600" aria-hidden="true" />
                  <span>Adaptive Recommendation Engine Triggered:</span>
                </div>
                <ul className="space-y-1.5 pl-6 list-disc text-xs text-brand-800">
                  {result.adaptive_recommendations.map((rec, i) => (
                    <li key={i}>
                      <strong>{rec.title}:</strong> {rec.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Question-by-Question Explanation Review */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 px-1">
              Detailed Question & Concept Review
            </h4>
            {result.questions_review.map((q, idx) => (
              <article
                key={q.id}
                className={`bg-white rounded-2xl border p-6 space-y-3 ${
                  q.is_correct ? 'border-emerald-200/80' : 'border-red-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    {q.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Question {idx + 1}</span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{q.question_text}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                    q.is_correct ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {q.is_correct ? 'Correct' : 'Needs Review'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Your Answer</span>
                    <span className={`font-semibold ${q.is_correct ? 'text-emerald-700' : 'text-red-700'}`}>
                      {q.user_answer || 'No Answer Submitted'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">Correct Answer</span>
                    <span className="font-semibold text-emerald-900">{q.correct_answer}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-100">
                  <strong className="text-slate-900">Concept Explanation: </strong>
                  {q.explanation}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}