import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  Award
} from 'lucide-react';
import { api } from '../services/api';

export default function QuizPage() {
  const { activeSubjectId } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(location.state?.topicId || '');
  const [questionCount, setQuestionCount] = useState(4);

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeSubjectId) {
      api.getSubjectTopics(activeSubjectId)
        .then((t) => {
          setTopics(t);
          if (!selectedTopicId && t.length > 0) {
            setSelectedTopicId(t[0].id);
          }
        })
        .catch(console.error);
    }
  }, [activeSubjectId]);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    setResult(null);
    setAnswers({});

    try {
      const data = await api.generateAssessment({
        subject_id: activeSubjectId,
        topic_id: selectedTopicId ? Number(selectedTopicId) : null,
        assessment_type: 'quiz',
        question_count: Number(questionCount),
      });
      setQuiz(data);
    } catch (err) {
      alert(`Failed to generate quiz: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!quiz) return;

    setSubmitting(true);
    try {
      const res = await api.submitAssessment(quiz.assessment_id, { answers });
      setResult(res);
    } catch (err) {
      alert(`Error submitting quiz: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Setup Box */}
      <section aria-labelledby="quiz-setup-heading" className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Module 6: Interactive Quizzes & Dynamic Re-Routing</span>
            </div>
            <h2 id="quiz-setup-heading" className="text-xl font-bold text-slate-900">Topic Mastery Verification Quiz</h2>
            <p className="text-xs text-slate-600 mt-1">
              Every quiz submission automatically updates your topic proficiency and re-prioritizes your adaptive roadmap.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="quiz-topic-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Topic to Practice
            </label>
            <select
              id="quiz-topic-select"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.order_index}. {t.name} ({t.difficulty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quiz-count-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Question Count
            </label>
            <select
              id="quiz-count-select"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value={3}>3 Questions</option>
              <option value={4}>4 Questions</option>
              <option value={6}>6 Questions</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Start Practice Quiz</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Active Quiz Form */}
      {quiz && !result && (
        <form onSubmit={handleSubmitQuiz} aria-label="Topic Practice Quiz Questions" className="space-y-4">
          {quiz.questions.map((q, idx) => (
            <fieldset key={q.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <legend className="sr-only">Question {idx + 1}: {q.question_text}</legend>
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5"
                >
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold text-slate-900">{q.question_text}</p>
              </div>

              <div
                role="radiogroup"
                aria-label={`Answer choices for question ${idx + 1}`}
                className="grid grid-cols-1 gap-2 pl-9"
              >
                {q.options.map((opt, oIdx) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 text-brand-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      <span
                        aria-hidden="true"
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20"
            >
              {submitting ? 'Grading Quiz...' : 'Submit Quiz Answers'}
            </button>
          </div>
        </form>
      )}

      {/* Quiz Result & Adaptive Feedback */}
      {result && (
        <section aria-labelledby="quiz-result-heading" aria-live="polite" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-brand-600">
                  <Award className="w-4 h-4" aria-hidden="true" />
                  <span>Quiz Completed</span>
                </div>
                <h3 id="quiz-result-heading" className="text-2xl font-bold text-slate-900 mt-1">
                  Score: {result.score_percentage}% ({result.correct_answers}/{result.total_questions})
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Updated Proficiency Status:{' '}
                  <strong className="text-slate-900">{result.proficiency_classification}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/roadmap')}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 self-start"
              >
                <span>Check Roadmap Adaptation</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {result.adaptive_recommendations?.length > 0 && (
              <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-900 space-y-1">
                <strong className="block font-bold">Adaptive Learning Path Update:</strong>
                {result.adaptive_recommendations.map((r, i) => (
                  <p key={i}>• <strong>{r.title}:</strong> {r.reason}</p>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {result.questions_review.map((q, idx) => (
              <article
                key={q.id}
                className={`bg-white p-5 rounded-2xl border space-y-2 ${
                  q.is_correct ? 'border-emerald-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Q{idx + 1}. {q.question_text}
                  </span>
                  {q.is_correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  Your answer: <strong>{q.user_answer || 'None'}</strong> | Correct: <strong className="text-emerald-700">{q.correct_answer}</strong>
                </p>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {q.explanation}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}