import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { 
  Target, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  Layers,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export default function DiagnosticPage() {
  const { activeSubjectId } = useOutletContext();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(activeSubjectId || 1);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    api.getSubjects().then(setSubjects).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      api.getSubjectTopics(selectedSubjectId)
        .then((t) => {
          setTopics(t);
          if (t.length > 0) setSelectedTopicId(t[0].id);
        })
        .catch(console.error);
    }
  }, [selectedSubjectId]);

  const handleStartDiagnostic = async () => {
    setLoading(true);
    setResults(null);
    setUserAnswers({});
    try {
      const data = await api.generateAssessment({
        subject_id: selectedSubjectId,
        topic_id: selectedTopicId ? Number(selectedTopicId) : null,
        assessment_type: 'diagnostic',
        difficulty,
        count: questionCount,
      });
      setAssessment(data);
    } catch (err) {
      alert(`Error generating diagnostic test: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    if (results) return; // locked after submission
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    // Check if all answered
    const unanswered = assessment.questions.filter((q) => !userAnswers[q.id]);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const formattedAnswers = assessment.questions.map((q) => ({
        question_id: q.id,
        selected_answer: userAnswers[q.id] || '',
      }));

      const res = await api.submitAssessment({
        assessment_id: assessment.assessment_id,
        answers: formattedAnswers,
      });

      setResults(res);
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200/50">
          <Target className="w-3.5 h-3.5 text-brand-600" />
          Module 2: Diagnostic Knowledge Assessment
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Evaluate Your Baseline Knowledge
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Take an intelligent diagnostic test to identify your strengths and pinpoint exact conceptual gaps.
        </p>
      </div>

      {/* Assessment Generator Form */}
      {!assessment && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            Configure Diagnostic Test
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Topic Focus</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.difficulty_level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Target Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      difficulty === lvl
                        ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Number of Questions</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value={3}>3 Questions (Quick Check)</option>
                <option value={5}>5 Questions (Standard Diagnostic)</option>
                <option value={7}>7 Questions (In-Depth Assessment)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartDiagnostic}
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Diagnostic with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Diagnostic Assessment</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Assessment Player & Questions */}
      {assessment && (
        <div className="space-y-6">
          {/* Test Status Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/60">
                {assessment.difficulty} Difficulty
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{assessment.title}</h3>
              <p className="text-xs text-slate-500">{assessment.subject_name} &bull; {assessment.total_questions} Questions</p>
            </div>

            {!results && (
              <div className="text-xs text-slate-600 font-medium">
                Answered: <strong className="text-slate-900">{Object.keys(userAnswers).length}</strong> / {assessment.total_questions}
              </div>
            )}
          </div>

          {/* Results Summary Card (Shown after submission) */}
          {results && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Diagnostic Outcome
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h3 className="text-3xl font-extrabold text-slate-900">{results.score_percentage}%</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        results.proficiency_level === 'Weak'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : results.proficiency_level === 'Moderate'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      Proficiency: {results.proficiency_level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {results.correct_answers} of {results.total_questions} answers verified correct
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/gaps"
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
                  >
                    <span>View Gap Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/roadmap"
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
                  >
                    <span>See Adaptive Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Explainable Gap Reasons */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-brand-600" />
                  Performance Diagnostics & Reasoning
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {results.gap_report?.reasons?.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-brand-500 font-bold">&bull;</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-5">
            {assessment.questions.map((q, idx) => {
              const resultDetail = results?.detailed_results?.find((r) => r.question_id === q.id);
              const selected = userAnswers[q.id];

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl bg-white border transition-all ${
                    resultDetail
                      ? resultDetail.is_correct
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : 'border-red-200 bg-red-50/10'
                      : 'border-slate-200/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                    {resultDetail && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                          resultDetail.is_correct
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {resultDetail.is_correct ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-4 leading-relaxed">
                    {q.question_text}
                  </p>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {q.options.map((opt) => {
                      const isOptionSelected = selected === opt;
                      let optionStyle = 'border-slate-200 text-slate-700 hover:bg-slate-50';

                      if (resultDetail) {
                        if (opt === resultDetail.correct_answer) {
                          optionStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold';
                        } else if (isOptionSelected && !resultDetail.is_correct) {
                          optionStyle = 'border-red-300 bg-red-50 text-red-900 line-through';
                        } else {
                          optionStyle = 'border-slate-100 text-slate-400 opacity-60';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = 'border-brand-500 bg-brand-50 text-brand-900 font-semibold ring-1 ring-brand-500';
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={Boolean(results)}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {isOptionSelected && !results && (
                            <div className="w-2 h-2 rounded-full bg-brand-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {resultDetail && (
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs">
                      <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                        Explanation:
                      </p>
                      <p className="text-slate-600 leading-relaxed">{resultDetail.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => {
                setAssessment(null);
                setResults(null);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              &larr; Configure New Test
            </button>

            {!results ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Evaluating Answers...' : 'Submit Diagnostic'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/roadmap"
                className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <span>Continue to Roadmap</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
