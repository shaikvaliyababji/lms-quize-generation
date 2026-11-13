/**
 * Parser and Question Generator for Quiz Conductor
 * Handles:
 * 1. Structured quiz formats (MCQ with A/B/C/D and ANSWER key)
 * 2. Unstructured plain text documents (smart sentence/keyword-based question generation)
 */

// Cleans up unicode and normalize whitespace
export function normalizeText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\u00A0/g, ' ') // non-breaking space
    .trim();
}

/**
 * Checks if the text has structured quiz markers (e.g. A. / B. / C. and ANSWER: / Answer:)
 */
export function isStructuredQuiz(rawText) {
  const text = normalizeText(rawText);
  const optionMatches = text.match(/^[ \t]*[A-D][\.\)][ \t]+/gim);
  const answerMatches = text.match(/^[ \t]*(?:ANSWER|Answer|ANS|Ans|Correct Answer|CORRECT ANSWER)[:\s\-]+/gim);
  
  return (optionMatches && optionMatches.length >= 4) || (answerMatches && answerMatches.length >= 2);
}

/**
 * Parses structured questions from text.
 * Supports various formats:
 * - Questions with/without numbering (1., 1), Q1:)
 * - Options A., B., C., D. or A), B), C), D) or (A), (B), (C), (D)
 * - Answer lines: ANSWER: B, Answer: B, Ans: C, Correct Answer: (A), etc.
 * - Optional Explanations
 */
export function parseStructuredQuiz(rawText) {
  const text = normalizeText(rawText);
  const lines = text.split('\n');
  const questions = [];

  let currentQuestion = null;
  let currentOptions = [];
  let currentAnswer = null;
  let currentExplanation = '';
  let collectingExplanation = false;

  const optionRegex = /^[ \t]*(?:\(?([A-Da-d])[\.\)]|([A-Da-d])[\.\)])[ \t]+(.*)$/;
  const answerRegex = /^[ \t]*(?:ANSWER|Answer|ANS|Ans|Correct Answer|CORRECT ANSWER)[ \t]*[:\-][ \t]*(.*)$/i;
  const explanationRegex = /^[ \t]*(?:EXPLANATION|Explanation|EXPLAIN|Explain|Reason)[:\-][ \t]*(.*)$/i;
  const questionNumberRegex = /^(?:Question\s*\d+[:.]?|\d+[\.\)])\s*(.*)$/i;

  function commitQuestion() {
    if (currentQuestion && currentOptions.length >= 2) {
      // Resolve correct answer index
      let correctIndex = -1;

      if (currentAnswer) {
        const cleanAns = currentAnswer.trim();
        // Check single letter A, B, C, D
        const letterMatch = cleanAns.match(/^[\(\[]?([A-Da-d])[\)\]]?/);
        if (letterMatch) {
          const letter = letterMatch[1].toUpperCase();
          correctIndex = letter.charCodeAt(0) - 65; // A -> 0, B -> 1, C -> 2, D -> 3
        } else {
          // If answer is written as full option text, match option text
          const matchIdx = currentOptions.findIndex(
            opt => opt.toLowerCase().includes(cleanAns.toLowerCase()) || cleanAns.toLowerCase().includes(opt.toLowerCase())
          );
          if (matchIdx !== -1) {
            correctIndex = matchIdx;
          }
        }
      }

      // Default to 0 if not found
      if (correctIndex < 0 || correctIndex >= currentOptions.length) {
        correctIndex = 0;
      }

      const qText = currentQuestion.trim();
      const explanation = currentExplanation.trim() || 
        `The correct answer is Option ${String.fromCharCode(65 + correctIndex)}: "${currentOptions[correctIndex]}".`;

      questions.push({
        id: `q-${questions.length + 1}`,
        questionNumber: questions.length + 1,
        question: qText,
        options: [...currentOptions],
        correctAnswerIndex: correctIndex,
        explanation: explanation,
        source: 'structured'
      });
    }

    currentQuestion = null;
    currentOptions = [];
    currentAnswer = null;
    currentExplanation = '';
    collectingExplanation = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      // Empty line could be separator, but if we already have question + options + answer, commit
      if (currentQuestion && currentOptions.length >= 2 && currentAnswer !== null) {
        commitQuestion();
      }
      continue;
    }

    // Check for Answer line
    const ansMatch = line.match(answerRegex);
    if (ansMatch) {
      currentAnswer = ansMatch[1].trim();
      collectingExplanation = false;
      continue;
    }

    // Check for Explanation line
    const expMatch = line.match(explanationRegex);
    if (expMatch) {
      currentExplanation = expMatch[1].trim();
      collectingExplanation = true;
      continue;
    }

    // Check for Option line
    const optMatch = line.match(optionRegex);
    if (optMatch) {
      collectingExplanation = false;
      const optionLetter = (optMatch[1] || optMatch[2]).toUpperCase();
      const optionText = optMatch[3].trim();
      
      // If we see 'A' and we already had an answer, commit previous question
      if (optionLetter === 'A' && currentQuestion && currentAnswer !== null) {
        commitQuestion();
      }

      currentOptions.push(optionText);
      continue;
    }

    // If currently collecting explanation, append
    if (collectingExplanation) {
      currentExplanation += ' ' + line;
      continue;
    }

    // Otherwise, this line is question text or a new question
    if (currentOptions.length > 0 && currentAnswer !== null) {
      // We already have a complete question with options and answer, so this starts a new question
      commitQuestion();
      const qClean = line.replace(questionNumberRegex, '$1').trim() || line;
      currentQuestion = qClean;
    } else if (currentOptions.length === 0) {
      // Still collecting question text
      const qClean = line.replace(questionNumberRegex, '$1').trim() || line;
      if (currentQuestion) {
        currentQuestion += ' ' + qClean;
      } else {
        currentQuestion = qClean;
      }
    } else {
      // We have some options but no answer yet; might be a multi-line option
      if (currentOptions.length > 0) {
        currentOptions[currentOptions.length - 1] += ' ' + line;
      }
    }
  }

  // Commit last question if pending
  commitQuestion();

  return questions;
}

/**
 * Intelligent NLP/Keyword Extractor for Unstructured text (articles, notes, textbooks)
 * Converts key sentences into multiple choice questions with distractors.
 */
export function generateQuizFromUnstructuredText(rawText, maxLimit = 20) {
  const text = normalizeText(rawText);
  if (!text || text.length < 50) return [];

  // Split into sentences
  const sentenceRegex = /([A-Z][^\.!\?]+[\.!\?])/g;
  const rawSentences = text.match(sentenceRegex) || [];
  
  // Filter informative sentences (between 40 and 200 characters)
  const sentences = rawSentences
    .map(s => s.trim().replace(/\s+/g, ' '))
    .filter(s => s.length >= 35 && s.length <= 250 && !s.startsWith('http'));

  if (sentences.length === 0) return [];

  // Extract common candidate keywords across the document to use as distractors
  const words = text.match(/\b[A-Za-z0-9\-\_]{4,25}\b/g) || [];
  const wordFreq = {};
  const stopWords = new Set([
    'this', 'that', 'with', 'from', 'have', 'were', 'which', 'their', 'there',
    'about', 'would', 'could', 'should', 'these', 'those', 'where', 'while',
    'after', 'before', 'other', 'another', 'into', 'over', 'more', 'most', 'some'
  ]);

  words.forEach(w => {
    const lower = w.toLowerCase();
    if (!stopWords.has(lower) && !/^\d+$/.test(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  });

  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  const questions = [];
  const usedSentences = new Set();

  for (let i = 0; i < sentences.length && questions.length < maxLimit; i++) {
    const sentence = sentences[i];
    if (usedSentences.has(sentence)) continue;

    // Pattern 1: Definition or Role ("X is defined as...", "X refers to...", "X is responsible for...")
    const defMatch = sentence.match(/^([^,]+?)\s+(is defined as|refers to|is responsible for|primarily involves|is used to|is characterized by)\s+(.+)$/i);
    
    if (defMatch) {
      const subject = defMatch[1].trim();
      const relation = defMatch[2].trim();
      const definition = defMatch[3].replace(/[\.!\?]$/, '').trim();

      if (subject.length > 2 && subject.length < 50 && definition.length > 5) {
        // Find 3 plausible distractors from other sentences
        const otherSubjects = sentences
          .filter(s => s !== sentence)
          .map(s => s.split(' ')[0] + ' ' + (s.split(' ')[1] || ''))
          .filter(s => s.length > 3 && s.toLowerCase() !== subject.toLowerCase())
          .slice(0, 3);

        while (otherSubjects.length < 3) {
          const fallback = topKeywords.find(k => !otherSubjects.includes(k) && k.toLowerCase() !== subject.toLowerCase()) || 'Other Factors';
          otherSubjects.push(fallback);
        }

        const options = [subject, ...otherSubjects.slice(0, 3)];
        // Shuffle options and find correct index
        const correctIndex = 0; // subject is at 0

        questions.push({
          id: `gen-${questions.length + 1}`,
          questionNumber: questions.length + 1,
          question: `Which of the following ${relation} "${definition}"?`,
          options: options,
          correctAnswerIndex: correctIndex,
          explanation: `According to the document: "${sentence}"`,
          source: 'generated'
        });
        usedSentences.add(sentence);
        continue;
      }
    }

    // Pattern 2: Cloze / Keyword Fill-in-the-blank
    // Find a prominent keyword in the sentence
    const sentWords = sentence.split(/\s+/);
    const candidateWord = sentWords.find(w => {
      const clean = w.replace(/[^A-Za-z0-9]/g, '');
      return clean.length >= 5 && topKeywords.includes(clean);
    });

    if (candidateWord) {
      const cleanWord = candidateWord.replace(/[^A-Za-z0-9]/g, '');
      const blankedSentence = sentence.replace(candidateWord, '________');

      // Create distractors from topKeywords
      const distractors = topKeywords
        .filter(k => k.toLowerCase() !== cleanWord.toLowerCase() && Math.abs(k.length - cleanWord.length) <= 5)
        .slice(0, 3);

      while (distractors.length < 3) {
        const dummy = topKeywords.find(k => !distractors.includes(k) && k.toLowerCase() !== cleanWord.toLowerCase()) || 'General Factor';
        distractors.push(dummy);
      }

      const options = [cleanWord, ...distractors];

      questions.push({
        id: `gen-${questions.length + 1}`,
        questionNumber: questions.length + 1,
        question: `Fill in the blank: "${blankedSentence}"`,
        options: options,
        correctAnswerIndex: 0,
        explanation: `Original statement: "${sentence}"`,
        source: 'generated'
      });
      usedSentences.add(sentence);
    }
  }

  // Now properly shuffle the options for generated questions so correct answer isn't always 0
  return questions.map(q => {
    const optsWithFlag = q.options.map((opt, idx) => ({
      text: opt,
      isCorrect: idx === q.correctAnswerIndex
    }));
    // Randomize
    for (let i = optsWithFlag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optsWithFlag[i], optsWithFlag[j]] = [optsWithFlag[j], optsWithFlag[i]];
    }
    const newCorrectIdx = optsWithFlag.findIndex(o => o.isCorrect);
    return {
      ...q,
      options: optsWithFlag.map(o => o.text),
      correctAnswerIndex: newCorrectIdx >= 0 ? newCorrectIdx : 0
    };
  });
}

/**
 * Main entrance: extracts questions from any text (structured or unstructured)
 */
export function extractQuestionsFromText(text, maxLimit = null) {
  if (!text || text.trim().length === 0) {
    return { questions: [], type: 'empty', totalFound: 0 };
  }

  if (isStructuredQuiz(text)) {
    const parsed = parseStructuredQuiz(text);
    return {
      questions: parsed,
      type: 'structured',
      totalFound: parsed.length
    };
  } else {
    // Generate questions from the unstructured text
    const generated = generateQuizFromUnstructuredText(text, maxLimit || 30);
    return {
      questions: generated,
      type: 'generated',
      totalFound: generated.length
    };
  }
}
