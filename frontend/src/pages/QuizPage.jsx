import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCw, 
  BookOpen, 
  Clock, 
  Target,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function QuizPage() {
  const { activeSubjectId } = useOutletContext();
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (activeSubjectId) {
      api.getSubjectTopics(activeSubjectId)
        .then((t) => {
          setTopics(t);
          if (t.length > 0) setSelectedTopicId(t[0].id);
        })
        .catch(console.error);
    }
  }, [activeSubjectId]);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const data = await api.generateAssessment({
        subject_id: activeSubjectId,
        topic_id: selectedTopicId ? Number(selectedTopicId) : null,
        assessment_type: 'quiz',
        difficulty,
        count,
      });
      setQuiz(data);
    } catch (err) {
      alert(`Quiz generation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, option) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const formattedAnswers = quiz.questions.map((q) => ({
        question_id: q.id,
        selected_answer: answers[q.id] || '',
      }));

      const res = await api.submitAssessment({
        assessment_id: quiz.assessment_id,
        answers: formattedAnswers,
      });
      setResult(res);
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
          <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
          Module 6: AI Dynamic Assessment Generator
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Practice & Adaptive Quizzes
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Take targeted, topic-wise practice quizzes to test concept mastery, reinforce memory, and adapt your learning path.
        </p>
      </div>

      {/* Quiz Configurator */}
      {!quiz && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            Quiz Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Target Topic</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Difficulty</label>
              <div className="grid grid-cols-3 gap-1.5">
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
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Question Count</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Dynamic Quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Start Practice Quiz</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Quiz Interface */}
      {quiz && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/60">
                {quiz.difficulty} &bull; {quiz.assessment_type}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{quiz.title}</h3>
            </div>
            {!result && (
              <span className="text-xs font-semibold text-slate-500">
                {Object.keys(answers).length} of {quiz.total_questions} answered
              </span>
            )}
          </div>

          {/* Results Score Banner */}
          {result && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quiz Score</span>
                  <div className="flex items-center gap-3 mt-1">
                    <h3 className="text-3xl font-extrabold text-slate-900">{result.score_percentage}%</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        result.proficiency_level === 'Weak'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : result.proficiency_level === 'Moderate'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {result.proficiency_level} Proficiency
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQuiz(null);
                      setResult(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                  >
                    Take Another Quiz
                  </button>
                  <Link
                    to="/roadmap"
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <span>Check Updated Roadmap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
              const resDetail = result?.detailed_results?.find((r) => r.question_id === q.id);
              const selected = answers[q.id];

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl bg-white border transition-all ${
                    resDetail
                      ? resDetail.is_correct
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : 'border-red-200 bg-red-50/10'
                      : 'border-slate-200/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                    {resDetail && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                          resDetail.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {resDetail.is_correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {resDetail.is_correct ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-4">{q.question_text}</p>

                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isOptionSelected = selected === opt;
                      let optionStyle = 'border-slate-200 text-slate-700 hover:bg-slate-50';

                      if (resDetail) {
                        if (opt === resDetail.correct_answer) {
                          optionStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold';
                        } else if (isOptionSelected && !resDetail.is_correct) {
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
                          disabled={Boolean(result)}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {isOptionSelected && !result && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {resDetail && (
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs">
                      <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                        Explanation:
                      </p>
                      <p className="text-slate-600 leading-relaxed">{resDetail.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!result ? (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Submitting...' : 'Submit Answers'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setQuiz(null);
                  setResult(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                &larr; Configure New Quiz
              </button>
              <Link
                to="/roadmap"
                className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm flex items-center gap-2"
              >
                <span>View Adapted Roadmap</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
