import React from 'react';
import { 
  Sparkles, 
  FileText, 
  RotateCcw, 
  Moon, 
  Sun, 
  CheckCircle2, 
  BrainCircuit, 
  HelpCircle
} from 'lucide-react';

export default function Navbar({ 
  currentStage, 
  totalQuestions, 
  docTitle, 
  onResetToUpload, 
  onLoadSample,
  darkMode,
  setDarkMode 
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
              <BrainCircuit className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 dark:from-white dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  QuizConductor
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 rounded-full border border-sky-200 dark:border-sky-800">
                  AI & Doc
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Extract from PDF/TXT • Conduct • Review • Reconduct & Shuffle
              </p>
            </div>
          </div>

          {/* Center Stage Tracker (on quiz / review) */}
          {currentStage !== 'upload' && (
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/60 text-xs">
              <span className={`flex items-center gap-1 font-medium ${
                currentStage === 'quiz' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-400 dark:text-slate-500'
              }`}>
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                1. Quiz Active
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className={`flex items-center gap-1 font-medium ${
                currentStage === 'review' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                2. Score & Review
              </span>
            </div>
          )}

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Sample Button */}
            {currentStage === 'upload' && (
              <button
                onClick={onLoadSample}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 transition shadow-sm"
                title="Loads the 100-question Bioreactor & Waste-to-Energy sample document"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Load 100-Q Sample
              </button>
            )}

            {/* Change Document / Reset */}
            {currentStage !== 'upload' && (
              <button
                onClick={onResetToUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
                title="Upload or configure a different document"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Change Document</span>
                <span className="sm:hidden">Upload</span>
              </button>
            )}

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
              aria-label="Toggle Dark Mode"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
