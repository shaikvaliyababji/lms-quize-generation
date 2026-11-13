import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileType, 
  Sparkles, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  HelpCircle, 
  Shuffle, 
  Clock, 
  ChevronRight,
  BookOpen,
  Layers
} from 'lucide-react';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { extractQuestionsFromText } from '../utils/quizParser';
import { SAMPLE_QUIZ_TEXT } from '../utils/sampleDocument';

export default function DocumentUploader({ 
  onStartQuiz, 
  preloadedText = '',
  onPreloadSample 
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [rawText, setRawText] = useState(preloadedText || '');
  const [fileName, setFileName] = useState(preloadedText ? 'Bioreactor_Sample_Quiz.txt' : '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Quiz configuration settings
  const [extractedData, setExtractedData] = useState(() => {
    if (preloadedText) {
      return extractQuestionsFromText(preloadedText);
    }
    return null;
  });
  
  const [questionLimit, setQuestionLimit] = useState(10);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [enableTimer, setEnableTimer] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState(10); // 10 minutes default
  
  const fileInputRef = useRef(null);

  // Parse text whenever rawText changes
  const processTextContent = (text, name = 'document.txt') => {
    setErrorMsg('');
    setIsProcessing(true);
    setProgressMsg('Analyzing document and extracting questions...');

    try {
      const result = extractQuestionsFromText(text);
      if (!result.questions || result.questions.length === 0) {
        setErrorMsg('No questions could be extracted. Ensure the document has clear questions or enough text to generate questions.');
        setExtractedData(null);
      } else {
        setExtractedData(result);
        setRawText(text);
        setFileName(name);
        // Default limit: min(10, total questions)
        const defaultLimit = Math.min(10, result.questions.length);
        setQuestionLimit(defaultLimit);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process document: ' + err.message);
    } finally {
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  // Handle file upload (.txt or .pdf)
  const handleFileUpload = async (file) => {
    if (!file) return;

    setErrorMsg('');
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      const isTxt = file.name.toLowerCase().endsWith('.txt') || file.type.includes('text');

      if (isPdf) {
        setProgressMsg('Reading PDF document pages...');
        const extracted = await extractTextFromPdf(file, (curr, total) => {
          setProgressMsg(`Extracting text from PDF (Page ${curr} of ${total})...`);
        });
        processTextContent(extracted, file.name);
      } else if (isTxt || file.type === '' || true) {
        // Read text file
        setProgressMsg('Reading text file...');
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          processTextContent(content, file.name);
        };
        reader.onerror = () => {
          setErrorMsg('Failed to read text file.');
          setIsProcessing(false);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error parsing file.');
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Load the user's provided 100-question sample
  const handleLoadSample = () => {
    processTextContent(SAMPLE_QUIZ_TEXT, 'Bioreactors_WasteToEnergy_100Q.txt');
  };

  // Ready to launch quiz
  const handleStart = () => {
    if (!extractedData || extractedData.questions.length === 0) return;

    onStartQuiz({
      allQuestions: extractedData.questions,
      questionLimit: Math.min(questionLimit, extractedData.questions.length),
      shuffleQuestions,
      shuffleOptions,
      enableTimer,
      timerSeconds: enableTimer ? timerMinutes * 60 : null,
      docTitle: fileName || 'Uploaded Document'
    });
  };

  const totalAvailable = extractedData?.questions?.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Hero Welcome */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          Supports .TXT and .PDF Documents
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Smart Document <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">Quiz Conductor</span>
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Upload any text or PDF document. The app automatically extracts questions or synthesizes a quiz, lets you set question limits, conducts the test with interactive reviews, and supports retakes and shuffling!
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Tab Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload File (.TXT / .PDF)
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition ${
              activeTab === 'paste'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Text or Questions
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'upload' ? (
            <div>
              {/* Dropzone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-50/60 dark:bg-slate-800/30 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,text/plain,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-300 group-hover:scale-110 transition shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  Click to browse or drag and drop your document here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports structured or unstructured <span className="font-semibold text-sky-600 dark:text-sky-400">.TXT</span> and <span className="font-semibold text-indigo-600 dark:text-indigo-400">.PDF</span> files
                </p>

                {/* Pre-fill quick sample pill */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center justify-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Don't have a document ready?</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSample();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/70 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    Load 100-Question Bioreactor Sample
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Paste your questions or article text below:
              </label>
              <textarea
                rows={9}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Paste questions with A, B, C, D options and ANSWER: keys, or paste study notes...\n\nExample:\nWhat is the primary function of a bioreactor?\nA. To store chemicals\nB. To cultivate microorganisms\nC. To separate solid wastes\nD. To generate electricity\nANSWER: B`}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-xs sm:text-sm"
              />
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  Load 100-Question Sample Text
                </button>
                <button
                  type="button"
                  onClick={() => processTextContent(rawText, 'Pasted_Text.txt')}
                  disabled={!rawText.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20 disabled:opacity-50 transition"
                >
                  Extract Questions
                </button>
              </div>
            </div>
          )}

          {/* Loading status */}
          {isProcessing && (
            <div className="mt-4 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 flex items-center gap-3 text-sky-700 dark:text-sky-300 text-sm animate-pulse">
              <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
              <span>{progressMsg}</span>
            </div>
          )}

          {/* Error status */}
          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Questions Preview & Configuration Section */}
      {extractedData && extractedData.questions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 space-y-6 animate-slide-up">
          
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Document Successfully Extracted!
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                File: <span className="font-medium text-slate-700 dark:text-slate-200">{fileName}</span> • Type: {extractedData.type === 'structured' ? 'Pre-formatted Questions' : 'Auto-generated from document notes'}
              </p>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-start sm:self-auto">
              <BookOpen className="w-4 h-4" />
              {totalAvailable} Questions Available
            </div>
          </div>

          {/* Quiz Configuration Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Setting 1: Max Questions Limit */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-500" />
                  Max Quiz Questions Limit
                </label>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-600 text-white">
                  {questionLimit} Questions
                </span>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose how many questions to conduct in this quiz session out of {totalAvailable} total.
              </p>

              {/* Slider */}
              <input
                type="range"
                min="1"
                max={totalAvailable}
                value={questionLimit}
                onChange={(e) => setQuestionLimit(parseInt(e.target.value, 10))}
                className="w-full accent-sky-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[5, 10, 20, 50, 100].filter(n => n <= totalAvailable).map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuestionLimit(n)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition border ${
                      questionLimit === n
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {n} Qs
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setQuestionLimit(totalAvailable)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition border ${
                    questionLimit === totalAvailable
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All ({totalAvailable})
                </button>
              </div>
            </div>

            {/* Setting 2: Shuffling & Timer */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-indigo-500" />
                Shuffle & Conduct Options
              </h4>

              {/* Toggle Question Shuffle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Shuffle Question Order
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Randomizes question order on start and on "New Quiz"
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
              </label>

              {/* Toggle Option Shuffle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Shuffle Option Choices (A, B, C, D)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Scrambles answer choices while preserving correct tracking
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
              </label>

              {/* Timer Toggle */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Enable Quiz Timer
                  <input
                    type="checkbox"
                    checked={enableTimer}
                    onChange={(e) => setEnableTimer(e.target.checked)}
                    className="w-4 h-4 ml-1 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                </label>

                {enableTimer && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-14 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-center font-bold"
                    />
                    <span className="text-slate-500 dark:text-slate-400">min</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sample Question Preview Collapsible */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                Sample Preview of Question 1:
              </span>
              <span className="text-slate-400">
                Options: {extractedData.questions[0]?.options.length || 4}
              </span>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">
                {extractedData.questions[0]?.question}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {extractedData.questions[0]?.options.map((opt, i) => (
                  <div 
                    key={i} 
                    className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                      i === extractedData.questions[0].correctAnswerIndex
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                    {i === extractedData.questions[0].correctAnswerIndex && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold">
                        Correct Key
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Launch Quiz CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 hover:from-sky-600 hover:via-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Conduct Quiz ({questionLimit} Questions)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
