import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Shuffle, 
  UploadCloud, 
  Printer, 
  Filter, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Check,
  X
} from 'lucide-react';

export default function ReviewScreen({
  questions,
  userAnswers,
  timeSpentSeconds,
  docTitle,
  onReconductSameQuiz,
  onNewShuffledQuiz,
  onUploadNewDocument
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'incorrect' | 'correct' | 'skipped'

  // Calculate score & statistics
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const reviewItems = questions.map((q, idx) => {
    const selected = userAnswers[idx];
    const isAnswered = selected !== undefined;
    const isCorrect = isAnswered && selected === q.correctAnswerIndex;

    if (!isAnswered) {
      skippedCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    return {
      ...q,
      originalIndex: idx,
      userSelected: selected,
      isCorrect,
      isAnswered
    };
  });

  const totalQuestions = questions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  // Trigger celebratory confetti on high scores
  useEffect(() => {
    if (scorePercent >= 60) {
      try {
        confetti({
          particleCount: scorePercent >= 80 ? 100 : 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    }
  }, [scorePercent]);

  // Filtered list
  const filteredList = reviewItems.filter(item => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'incorrect') return item.isAnswered && !item.isCorrect;
    if (filter === 'skipped') return !item.isAnswered;
    return true;
  });

  const formatTime = (secs) => {
    if (!secs) return 'N/A';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const getScoreBadge = () => {
    if (scorePercent >= 90) return { title: 'Exceptional Mastery! 🏆', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800' };
    if (scorePercent >= 75) return { title: 'Great Job! 🌟', color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/70 border-sky-300 dark:border-sky-800' };
    if (scorePercent >= 50) return { title: 'Good Effort! 📚', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800' };
    return { title: 'Needs More Practice! 💪', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800' };
  };

  const badge = getScoreBadge();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Score Summary Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Left: Score circle & badge */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className={
                    scorePercent >= 75
                      ? 'stroke-emerald-500'
                      : scorePercent >= 50
                      ? 'stroke-sky-500'
                      : 'stroke-rose-500'
                  }
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - scorePercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {scorePercent}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Accuracy
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                <Award className="w-3.5 h-3.5" />
                {badge.title}
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Quiz Review & Detailed Analysis
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Document: <span className="font-semibold text-slate-700 dark:text-slate-300">{docTitle}</span>
              </p>
            </div>
          </div>

          {/* Right: Metric Counters */}
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 w-full md:w-auto">
            
            {/* Correct */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Correct
              </span>
              <p className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-1">
                {correctCount}
              </p>
            </div>

            {/* Incorrect */}
            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 text-center">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Incorrect
              </span>
              <p className="text-xl font-black text-rose-800 dark:text-rose-200 mt-1">
                {incorrectCount}
              </p>
            </div>

            {/* Skipped */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-center">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Skipped
              </span>
              <p className="text-xl font-black text-amber-800 dark:text-amber-200 mt-1">
                {skippedCount}
              </p>
            </div>

          </div>

        </div>

        {/* Action Button Bar (Reconduct, Shuffle New, Upload New) */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Reconducting the same quiz */}
            <button
              onClick={onReconductSameQuiz}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-sm transition"
              title="Restarts the quiz with the exact same questions and options to test retention"
            >
              <RotateCcw className="w-4 h-4 text-sky-500" />
              <span>Reconduct Same Quiz</span>
            </button>

            {/* New Quiz with Shuffled Questions */}
            <button
              onClick={onNewShuffledQuiz}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/20 transition"
              title="Shuffles question order, shuffles options, and samples fresh questions from document"
            >
              <Shuffle className="w-4 h-4" />
              <span>New Quiz (Shuffled)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title="Print or Save PDF report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              onClick={onUploadNewDocument}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
              <span>Upload New Doc</span>
            </button>
          </div>

        </div>

      </div>

      {/* Filter Tabs & Question Review Header */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Question-by-Question Review
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({totalQuestions})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'incorrect'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'correct'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
              }`}
            >
              Correct ({correctCount})
            </button>
            {skippedCount > 0 && (
              <button
                onClick={() => setFilter('skipped')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === 'skipped'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
                }`}
              >
                Skipped ({skippedCount})
              </button>
            )}
          </div>
        </div>

        {/* Detailed Question Cards */}
        <div className="space-y-4">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
              No questions found for the selected filter.
            </div>
          ) : (
            filteredList.map((item, displayIdx) => {
              const qIndex = item.originalIndex;
              const hasUserAnswer = item.userSelected !== undefined;
              const correctLetter = String.fromCharCode(65 + item.correctAnswerIndex);
              const userLetter = hasUserAnswer ? String.fromCharCode(65 + item.userSelected) : 'None';

              return (
                <div
                  key={item.id || qIndex}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border-2 transition-all space-y-4 ${
                    item.isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/60'
                      : !hasUserAnswer
                      ? 'border-amber-200 dark:border-amber-900/60'
                      : 'border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  
                  {/* Top status indicator */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                        {qIndex + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Question {qIndex + 1} of {totalQuestions}
                      </span>
                    </div>

                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <Check className="w-3.5 h-3.5" /> Correct (+1)
                      </span>
                    ) : !hasUserAnswer ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <AlertCircle className="w-3.5 h-3.5" /> Skipped
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        <X className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {item.question}
                  </p>

                  {/* Options List with Review Highlighting */}
                  <div className="space-y-2.5 pt-1">
                    {item.options.map((optText, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isOptionCorrect = optIdx === item.correctAnswerIndex;
                      const isOptionChosen = optIdx === item.userSelected;

                      // Determine visual styling for this option
                      let optionClasses = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400';
                      let badgeTag = null;

                      if (isOptionCorrect && isOptionChosen) {
                        // User chose the correct answer!
                        optionClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500';
                        badgeTag = (
                          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white">
                            <Check className="w-3 h-3" /> Your Correct Choice
                          </span>
                        );
                      } else if (isOptionCorrect && !isOptionChosen) {
                        // This was the correct answer, but user didn't choose it
                        optionClasses = 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                        badgeTag = (
                          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                            <Check className="w-3 h-3 text-emerald-600" /> Correct Option
                          </span>
                        );
                      } else if (!isOptionCorrect && isOptionChosen) {
                        // User chose this wrong answer!
                        optionClasses = 'border-rose-400 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-semibold ring-1 ring-rose-400';
                        badgeTag = (
                          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-600 text-white">
                            <X className="w-3 h-3" /> Your Choice (Incorrect)
                          </span>
                        );
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs sm:text-sm transition-all ${optionClasses}`}
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            isOptionCorrect
                              ? 'bg-emerald-600 text-white'
                              : isOptionChosen
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {letter}
                          </span>

                          <span className="flex-1">{optText}</span>

                          {badgeTag}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation box */}
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-sky-500" />
                      Document Reference / Explanation:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.explanation || `The correct option is Option ${correctLetter}: "${item.options[item.correctAnswerIndex]}".`}
                    </p>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Floating Bottom Reconduct / New Quiz Bar */}
      <div className="sticky bottom-4 z-30 max-w-4xl mx-auto p-4 rounded-2xl glass-panel shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          Scored <span className="font-bold text-slate-900 dark:text-white">{correctCount}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalQuestions}</span> questions correctly ({scorePercent}%)
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onReconductSameQuiz}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 transition shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-500" />
            <span>Reconduct Same</span>
          </button>

          <button
            onClick={onNewShuffledQuiz}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 transition shadow-md shadow-sky-500/20"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>New Quiz (Shuffle)</span>
          </button>
        </div>
      </div>

    </div>
  );
}
