import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  Code2, 
  HelpCircle, 
  RefreshCw, 
  User, 
  Lightbulb, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  "Explain this concept with an intuitive real-world analogy.",
  "Show me a practical commented code example with edge cases.",
  "What are the most common mistakes beginners make here?",
  "Give me a conceptual practice problem to test my understanding.",
  "Why is this concept crucial in real-world software engineering?"
];

export default function AITutorPage() {
  const { activeSubjectId, user } = useOutletContext();
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  
  // Tabs: 'chat' vs 'explain'
  const [activeTab, setActiveTab] = useState('chat');

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Concept Deep Dive State
  const [explanation, setExplanation] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);

  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    if (selectedTopicId) {
      api.getTutorHistory(selectedTopicId)
        .then((hist) => {
          if (hist.length > 0) {
            setMessages(hist);
          } else {
            const currentTopic = topics.find((t) => t.id === Number(selectedTopicId));
            setMessages([
              {
                sender: 'assistant',
                message: `Hello ${user?.name || 'there'}! I am your AI Learning Assistant for **${currentTopic?.name || 'this topic'}**.\n\nHow can I help you master this concept today? You can ask for analogies, step-by-step code breakdowns, or practice challenges!`,
              },
            ]);
          }
        })
        .catch(console.error);
    }
  }, [selectedTopicId, topics]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = { sender: 'user', message: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const res = await api.sendTutorMessage({
        message: textToSend,
        topic_id: selectedTopicId ? Number(selectedTopicId) : null,
      });

      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', message: res.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          message: `I encountered an issue connecting to the AI tutor service: ${err.message}.`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDeepDiveExplain = async () => {
    setExplainLoading(true);
    try {
      const res = await api.explainConcept({
        topic_id: selectedTopicId ? Number(selectedTopicId) : null,
      });
      setExplanation(res);
    } catch (err) {
      alert(`Error fetching concept explanation: ${err.message}`);
    } finally {
      setExplainLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200/50">
            <Bot className="w-3.5 h-3.5 text-brand-600" />
            Module 5: Interactive AI Learning Assistant
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Your Dedicated AI STEM Tutor
          </h2>
        </div>

        {/* Topic Context Dropdown */}
        {topics.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Topic:</span>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'chat'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Conversational Tutor
        </button>
        <button
          onClick={() => {
            setActiveTab('explain');
            if (!explanation) handleDeepDiveExplain();
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'explain'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Structured Deep-Dive
        </button>
      </div>

      {/* TAB 1: Conversational Chat */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Quick Prompt Chips */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/70 overflow-x-auto flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 ml-1">
              Suggestions:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={chatLoading}
                className="shrink-0 px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-all shadow-2xs whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAssistant
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${
                      isAssistant
                        ? 'bg-slate-50 text-slate-800 border border-slate-200/70'
                        : 'bg-brand-600 text-white shadow-sm'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-brand-600" />
                  <span>LearnPath AI Tutor is analyzing and formulating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask your tutor anything about this concept..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || chatLoading}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Structured Deep-Dive */}
      {activeTab === 'explain' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pedagogical Breakdown: {topics.find((t) => t.id === Number(selectedTopicId))?.name || 'Concept'}
              </h3>
              <p className="text-xs text-slate-500">
                Tailored for {user?.education_level || 'Undergraduate'} level
              </p>
            </div>
            <button
              onClick={handleDeepDiveExplain}
              disabled={explainLoading}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${explainLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Breakdown</span>
            </button>
          </div>

          {explainLoading ? (
            <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-brand-600" />
              <span>Synthesizing structured pedagogical breakdown...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
              {explanation?.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
