import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Flag, 
  HelpCircle, 
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';

export default function QuizScreen({
  questions,
  docTitle,
  enableTimer,
  initialTimerSeconds,
  onFinishQuiz,
  onExitQuiz
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIndex]: selectedOptionIndex }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { [questionIndex]: boolean }
  const [timeLeft, setTimeLeft] = useState(initialTimerSeconds || null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!enableTimer || timeLeft === null) return;

    if (timeLeft <= 0) {
      // Auto submit when time runs out
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [enableTimer, timeLeft]);

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQ) * 100);

  // Format timer seconds into MM:SS
  const formatTime = (secs) => {
    if (secs === null) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };

  const handleClearAnswer = () => {
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentIndex];
      return copy;
    });
  };

  const handleSubmit = () => {
    onFinishQuiz({
      userAnswers,
      timeSpentSeconds: initialTimerSeconds ? initialTimerSeconds - (timeLeft || 0) : null
    });
  };

  const unansweredCount = totalQ - answeredCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* Top Bar: Progress, Timer, Document info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center text-sm">
              {currentIndex + 1}
            </span>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Question {currentIndex + 1} <span className="text-slate-400 font-normal">of {totalQ}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {docTitle}
              </p>
            </div>
          </div>

          {/* Right Status (Timer & Answered Counter) */}
          <div className="flex items-center gap-3">
            {enableTimer && timeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
                timeLeft < 60
                  ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/80 dark:border-rose-800 animate-pulse'
                  : timeLeft < 180
                  ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/80 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
              <span>{answeredCount} of {totalQ} Answered</span>
            </div>

            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition"
            >
              Finish & Review
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 space-y-6 animate-slide-up">
        
        {/* Question Header & Flag button */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Select One Option
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          <button
            onClick={handleToggleFlag}
            className={`p-2 rounded-xl text-xs flex items-center gap-1 transition border flex-shrink-0 ${
              flaggedQuestions[currentIndex]
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="Flag question for later review"
          >
            <Flag className={`w-4 h-4 ${flaggedQuestions[currentIndex] ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">
              {flaggedQuestions[currentIndex] ? 'Flagged' : 'Flag'}
            </span>
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((optionText, optIndex) => {
            const isSelected = userAnswers[currentIndex] === optIndex;
            const letter = String.fromCharCode(65 + optIndex);

            return (
              <button
                key={optIndex}
                onClick={() => handleSelectOption(optIndex)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-slate-900 dark:text-white shadow-md shadow-sky-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                {/* Option Letter Indicator */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all flex-shrink-0 ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-sm scale-105'
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 group-hover:border-sky-400'
                  }`}
                >
                  {letter}
                </div>

                {/* Option Text */}
                <span className={`text-sm sm:text-base flex-1 ${isSelected ? 'font-semibold' : ''}`}>
                  {optionText}
                </span>

                {/* Selection Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-sky-600 bg-sky-600'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 gap-3">
          
          <button
            onClick={handleClearAnswer}
            disabled={userAnswers[currentIndex] === undefined}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-40 transition"
          >
            Clear Selection
          </button>

          <div className="flex items-center gap-2">
            {/* Prev Question */}
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Next or Finish */}
            {currentIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(totalQ - 1, prev + 1))}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-500/20 transition"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 transition"
              >
                <Award className="w-4 h-4" />
                <span>Submit & Review All</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Question Palette / Navigator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Question Palette ({totalQ} total)
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Answered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" /> Unanswered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Flagged
            </span>
          </div>
        </div>

        {/* Bubbles Grid */}
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
          {questions.map((_, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = userAnswers[idx] !== undefined;
            const isFlagged = flaggedQuestions[idx];

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative ${
                  isCurrent
                    ? 'ring-2 ring-sky-500 ring-offset-2 dark:ring-offset-slate-900 bg-sky-600 text-white font-extrabold scale-105'
                    : isAnswered
                    ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 hover:bg-sky-200 border border-sky-300 dark:border-sky-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {idx + 1}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white dark:border-slate-900" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Finish & Review Quiz?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to see your answers and comprehensive review?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Questions:</span>
                <span className="font-bold text-slate-900 dark:text-white">{totalQ}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Answered:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Unanswered:</span>
                <span className={`font-bold ${unansweredCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {unansweredCount}
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Notice: You still have {unansweredCount} unanswered questions. Unanswered questions will be marked incorrect during review.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
              >
                Keep Answering
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmit();
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 transition"
              >
                Submit & Review Answers
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
