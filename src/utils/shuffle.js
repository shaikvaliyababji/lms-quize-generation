/**
 * Standard Fisher-Yates array shuffle (returns a new array)
 */
export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles questions order AND shuffles the options inside each question,
 * correctly updating the correctAnswerIndex so scoring remains 100% accurate.
 */
export function shuffleQuiz(questions) {
  // First shuffle the order of questions
  const shuffledQuestions = shuffleArray(questions);

  // Then for each question, shuffle options while preserving the correct answer
  return shuffledQuestions.map((q, qIndex) => {
    // If no options or single option, return as is
    if (!q.options || q.options.length <= 1) {
      return { ...q, id: `q-${qIndex}-${Date.now()}` };
    }

    // Create array of option objects with their original index
    const indexedOptions = q.options.map((optText, idx) => ({
      text: optText,
      isCorrect: idx === q.correctAnswerIndex
    }));

    // Shuffle options
    const shuffledIndexedOptions = shuffleArray(indexedOptions);

    // Find the new index of the correct option
    const newCorrectIndex = shuffledIndexedOptions.findIndex(o => o.isCorrect);

    return {
      ...q,
      id: `q-${qIndex}-${Date.now()}`,
      options: shuffledIndexedOptions.map(o => o.text),
      correctAnswerIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
    };
  });
}
