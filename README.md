# 🧠 QuizConductor - Smart Document Quiz Application

A React-based Quiz Conductor application that allows users to upload documents in **.TXT** or **.PDF** format, automatically extracts questions (or generates them using smart NLP analysis), sets custom question limits, conducts quizzes with interactive palettes and timers, provides detailed answer reviews, and enables re-taking the same quiz or generating a new quiz with shuffled questions and options.

---

## ✨ Features

1. **Dual Document Support (.TXT & .PDF)**:
   - Drag & drop or browse `.txt` and `.pdf` files.
   - Built-in PDF text extraction engine powered by PDF.js (with multi-page progress tracking).
   - Also supports direct text pasting.
   - Pre-loaded with the user's **100-Question Bioreactors & Waste-to-Energy** sample quiz with 1-click loading.

2. **Smart Question Extraction & Synthesis**:
   - **Structured MCQ Extraction**: Parses questions with options (A, B, C, D) and answer keys (`ANSWER: B`).
   - **Intelligent Text Generator**: When plain study notes or textbook chapters are uploaded, it extracts key concepts, definitions, and facts to generate multiple-choice questions with contextual distractors.

3. **Customizable Quiz Limits**:
   - Slider and preset buttons (`5 Qs`, `10 Qs`, `20 Qs`, `50 Qs`, `All Qs`) to set the maximum number of questions to conduct.
   - Optional countdown timer with real-time alerts.

4. **Interactive Quiz Conductor Interface**:
   - Question palette allowing direct jumps to any question.
   - Question flagging for later review.
   - Clear option selection and instant progress indicator.
   - Confirmation dialog preventing accidental early submission.

5. **Comprehensive Review Screen**:
   - Displays overall score, percentage accuracy, and celebratory confetti on high scores.
   - Question-by-question breakdown:
     - **Green highlighting** for user's correct choice.
     - **Red highlighting** for incorrect choices.
     - **Emerald highlighting** identifying the actual correct option.
     - Document reference & detailed explanation for each answer.
   - Filters: View *All*, *Incorrect Only*, *Correct Only*, or *Skipped*.
   - Print or save PDF report button.

6. **Reconduct vs. New Shuffled Quiz**:
   - 🔄 **Reconduct Same Quiz**: Retakes the exact same questions and options in the same order so the user can test their retention and correct mistakes.
   - 🔀 **New Quiz (Shuffled)**: Randomizes the question order and option positions (A, B, C, D) while maintaining accurate answer tracking. If the document has more questions than the limit (e.g. 10 out of 100), it draws a fresh random batch of questions!

7. **Themes**:
   - Full Light / Dark mode toggle with persistent preference.

---

## 🚀 Running the Project

### Development Server
The application is currently running at:
```bash
npm run dev
# Accessible at: http://localhost:5173/
```

### Production Build
```bash
npm run build
npm run preview
```
