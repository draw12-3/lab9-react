import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import questions from "../data/questions.json";
import { buildQuizQuestions, getCategoryList, getQuestionCountsByCategory } from "../utils/quizHelpers";

const QuizContext = createContext(null);

const STORAGE_KEY = "quiz-active-session";
const HISTORY_KEY = "quiz-score-history";

const categories = getCategoryList(questions);
const questionCounts = getQuestionCountsByCategory(questions);

const initialState = {
  phase: "start",
  allQuestions: questions,
  categories,
  questionCounts,
  config: {
    username: "",
    category: "Toate",
    amount: 5,
    timeLimit: "unlimited",
  },
  questions: [],
  currentIndex: 0,
  answers: [],
  currentStreak: 0,
  maxStreak: 0,
  scoreHistory: [],
  startedAt: null,
  finishedAt: null,
};

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function finalizeQuizState(state) {
  const correctAnswers = state.answers.filter((item) => item.isCorrect).length;
  const total = state.questions.length;
  const percentage = total ? Number(((correctAnswers / total) * 100).toFixed(2)) : 0;

  const historyEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    username: state.config.username,
    score: correctAnswers,
    total,
    percentage,
    maxStreak: state.maxStreak,
    category: state.config.category,
    date: new Date().toLocaleString("ro-RO"),
  };

  const updatedHistory = [...state.scoreHistory, historyEntry];

  return {
    ...state,
    phase: "results",
    finishedAt: Date.now(),
    scoreHistory: updatedHistory,
  };
}

function quizReducer(state, action) {
  switch (action.type) {
    case "RESTORE_STATE":
      return {
        ...state,
        ...action.payload,
        allQuestions: questions,
        categories,
        questionCounts,
        scoreHistory: loadHistory(),
      };

    case "LOAD_HISTORY":
      return {
        ...state,
        scoreHistory: action.payload,
      };

    case "START_QUIZ": {
      const { username, category, amount, timeLimit } = action.payload;
      const selectedQuestions = buildQuizQuestions(questions, category, amount);

      return {
        ...state,
        phase: "quiz",
        config: {
          username,
          category,
          amount,
          timeLimit,
        },
        questions: selectedQuestions,
        currentIndex: 0,
        answers: [],
        currentStreak: 0,
        maxStreak: 0,
        startedAt: Date.now(),
        finishedAt: null,
      };
    }

    case "ANSWER_QUESTION": {
      const currentQuestion = state.questions[state.currentIndex];
      if (!currentQuestion) return state;

      const alreadyAnswered = state.answers.some(
        (answer) => answer.questionId === currentQuestion.id
      );

      if (alreadyAnswered) return state;

      const chosenIndex = action.payload.selectedIndex;
      const chosenText =
        chosenIndex === null || chosenIndex === undefined
          ? "Niciun raspuns"
          : currentQuestion.options[chosenIndex];

      const isCorrect = chosenIndex === currentQuestion.correctAnswer;
      const nextStreak = isCorrect ? state.currentStreak + 1 : 0;
      const nextMaxStreak = Math.max(state.maxStreak, nextStreak);

      const answerRecord = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        selectedIndex: chosenIndex,
        selectedText: chosenText,
        correctIndex: currentQuestion.correctAnswer,
        correctText: currentQuestion.options[currentQuestion.correctAnswer],
        isCorrect,
        timedOut: Boolean(action.payload.timedOut),
      };

      const nextAnswers = [...state.answers, answerRecord];
      const isLastQuestion = state.currentIndex >= state.questions.length - 1;

      if (isLastQuestion) {
        return finalizeQuizState({
          ...state,
          answers: nextAnswers,
          currentStreak: nextStreak,
          maxStreak: nextMaxStreak,
        });
      }

      return {
        ...state,
        answers: nextAnswers,
        currentIndex: state.currentIndex + 1,
        currentStreak: nextStreak,
        maxStreak: nextMaxStreak,
      };
    }

    case "RESET_TO_START":
      return {
        ...state,
        phase: "start",
        questions: [],
        currentIndex: 0,
        answers: [],
        currentStreak: 0,
        maxStreak: 0,
        startedAt: null,
        finishedAt: null,
      };

    case "CLEAR_ACTIVE_SESSION":
      return {
        ...state,
        phase: "start",
        questions: [],
        currentIndex: 0,
        answers: [],
        currentStreak: 0,
        maxStreak: 0,
        startedAt: null,
        finishedAt: null,
      };

    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, {
    ...initialState,
    scoreHistory: loadHistory(),
  });

  useEffect(() => {
    const savedSession = loadSession();
    if (savedSession && (savedSession.phase === "quiz" || savedSession.phase === "results")) {
      dispatch({ type: "RESTORE_STATE", payload: savedSession });
    } else {
      dispatch({ type: "LOAD_HISTORY", payload: loadHistory() });
    }
  }, []);

  useEffect(() => {
    if (state.phase === "quiz" || state.phase === "results") {
      saveSession({
        phase: state.phase,
        config: state.config,
        questions: state.questions,
        currentIndex: state.currentIndex,
        answers: state.answers,
        currentStreak: state.currentStreak,
        maxStreak: state.maxStreak,
        startedAt: state.startedAt,
        finishedAt: state.finishedAt,
      });
    } else {
      clearSession();
    }
  }, [
    state.phase,
    state.config,
    state.questions,
    state.currentIndex,
    state.answers,
    state.currentStreak,
    state.maxStreak,
    state.startedAt,
    state.finishedAt,
  ]);

  useEffect(() => {
    saveHistory(state.scoreHistory);
  }, [state.scoreHistory]);

  const startQuiz = (payload) => {
    dispatch({ type: "START_QUIZ", payload });
  };

  const answerQuestion = (payload) => {
    dispatch({ type: "ANSWER_QUESTION", payload });
  };

  const resetToStart = () => {
    clearSession();
    dispatch({ type: "RESET_TO_START" });
  };

  const value = useMemo(
    () => ({
      state,
      startQuiz,
      answerQuestion,
      resetToStart,
    }),
    [state]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error("useQuiz must be used inside QuizProvider");
  }

  return context;
}