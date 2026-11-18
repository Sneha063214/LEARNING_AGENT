import React, { useEffect, useState } from 'react';
import { Sparkles, Layers, ChevronDown } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ activeSubjectId, onSubjectChange, pageTitle }) {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.getSubjects().then(setSubjects).catch(console.error);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Subject Context Selector */}
        {subjects.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-medium text-slate-500">Subject:</span>
            <select
              value={activeSubjectId}
              onChange={(e) => onSubjectChange(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* AI Agent Engine Status Pill */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Adaptive Agent Active
          </span>
        </div>
      </div>
    </header>
  );
}
