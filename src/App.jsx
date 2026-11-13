import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DocumentUploader from './components/DocumentUploader';
import QuizScreen from './components/QuizScreen';
import ReviewScreen from './components/ReviewScreen';
import { shuffleArray, shuffleQuiz } from './utils/shuffle';
import { SAMPLE_QUIZ_TEXT } from './utils/sampleDocument';
import { extractQuestionsFromText } from './utils/quizParser';

export default function App() {
  // Navigation / stage: 'upload' | 'quiz' | 'review'
  const [currentStage, setCurrentStage] = useState('upload');

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quiz_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('quiz_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('quiz_dark_mode', 'false');
    }
  }, [darkMode]);

  // Document & Question Data
  const [allDocQuestions, setAllDocQuestions] = useState([]);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState([]);
  const [quizConfig, setQuizConfig] = useState({
    questionLimit: 10,
    shuffleQuestions: true,
    shuffleOptions: true,
    enableTimer: true,
    timerSeconds: 600,
    docTitle: 'Document Quiz'
  });

  // Quiz submission results
  const [quizResults, setQuizResults] = useState({
    userAnswers: {},
    timeSpentSeconds: null
  });

  // Starts the quiz with given config
  const handleStartQuiz = (config) => {
    setQuizConfig(config);
    setAllDocQuestions(config.allQuestions);

    let preparedPool = [...config.allQuestions];

    // If shuffle requested, shuffle the pool before slicing
    if (config.shuffleQuestions) {
      preparedPool = shuffleArray(preparedPool);
    }

    // Limit questions to max set by user
    let selected = preparedPool.slice(0, config.questionLimit);

    // If option shuffle requested, shuffle options
    if (config.shuffleOptions) {
      selected = shuffleQuiz(selected);
    }

    setActiveQuizQuestions(selected);
    setCurrentStage('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when quiz is submitted
  const handleFinishQuiz = ({ userAnswers, timeSpentSeconds }) => {
    setQuizResults({
      userAnswers,
      timeSpentSeconds
    });
    setCurrentStage('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reconduct the EXACT SAME quiz again
  const handleReconductSameQuiz = () => {
    // Keep activeQuizQuestions identical (same questions, same options order)
    setQuizResults({
      userAnswers: {},
      timeSpentSeconds: null
    });
    setCurrentStage('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Conduct a NEW QUIZ with shuffled questions
  const handleNewShuffledQuiz = () => {
    // Take the full pool from document, shuffle questions and options, and pick fresh questions
    let freshPool = [...allDocQuestions];
    
    // Shuffle the master question pool
    freshPool = shuffleArray(freshPool);

    // Slice according to limit
    let freshSelected = freshPool.slice(0, quizConfig.questionLimit);

    // Shuffle questions and options
    freshSelected = shuffleQuiz(freshSelected);

    setActiveQuizQuestions(freshSelected);
    setQuizResults({
      userAnswers: {},
      timeSpentSeconds: null
    });
    setCurrentStage('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetToUpload = () => {
    setCurrentStage('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1-Click Load Sample into Quiz Config
  const handleLoadSampleFromNavbar = () => {
    const parsed = extractQuestionsFromText(SAMPLE_QUIZ_TEXT);
    if (parsed.questions && parsed.questions.length > 0) {
      handleStartQuiz({
        allQuestions: parsed.questions,
        questionLimit: 10,
        shuffleQuestions: true,
        shuffleOptions: true,
        enableTimer: true,
        timerSeconds: 600,
        docTitle: 'Bioreactor & Waste-to-Energy (100 Questions)'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Top Navigation */}
      <Navbar
        currentStage={currentStage}
        totalQuestions={activeQuizQuestions.length}
        docTitle={quizConfig.docTitle}
        onResetToUpload={handleResetToUpload}
        onLoadSample={handleLoadSampleFromNavbar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentStage === 'upload' && (
          <DocumentUploader
            onStartQuiz={handleStartQuiz}
            preloadedText={SAMPLE_QUIZ_TEXT}
          />
        )}

        {currentStage === 'quiz' && (
          <QuizScreen
            questions={activeQuizQuestions}
            docTitle={quizConfig.docTitle}
            enableTimer={quizConfig.enableTimer}
            initialTimerSeconds={quizConfig.timerSeconds}
            onFinishQuiz={handleFinishQuiz}
            onExitQuiz={handleResetToUpload}
          />
        )}

        {currentStage === 'review' && (
          <ReviewScreen
            questions={activeQuizQuestions}
            userAnswers={quizResults.userAnswers}
            timeSpentSeconds={quizResults.timeSpentSeconds}
            docTitle={quizConfig.docTitle}
            onReconductSameQuiz={handleReconductSameQuiz}
            onNewShuffledQuiz={handleNewShuffledQuiz}
            onUploadNewDocument={handleResetToUpload}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          QuizConductor • Extract from TXT & PDF • Limit, Conduct, Review & Reconduct with Shuffling
        </p>
      </footer>

    </div>
  );
}
