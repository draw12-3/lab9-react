import { useCallback, useMemo, useRef, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { useTimer } from "../hooks/useTimer";
import AnswerOption from "./AnswerOption";
import ProgressBar from "./ProgressBar";
import styles from "../styles/QuizScreen.module.css";

function QuizScreen() {
  const { state, answerQuestion } = useQuiz();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const timeoutRef = useRef(null);

  const currentQuestion = state.questions[state.currentIndex];
  const totalQuestions = state.questions.length;
  const progressValue = ((state.currentIndex + 1) / totalQuestions) * 100;

  const handleAdvance = useCallback(
    (payload) => {
      setIsLocked(true);
      setSelectedIndex(payload.selectedIndex);

      timeoutRef.current = setTimeout(() => {
        answerQuestion(payload);
        setSelectedIndex(null);
        setIsLocked(false);
      }, 1100);
    },
    [answerQuestion]
  );

  const handleExpire = useCallback(() => {
    if (isLocked) return;
    handleAdvance({ selectedIndex: null, timedOut: true });
  }, [handleAdvance, isLocked]);

  const timeLimit = state.config.timeLimit === "unlimited" ? null : Number(state.config.timeLimit);

  const { timeLeft, percentage } = useTimer({
    duration: timeLimit,
    onExpire: handleExpire,
    resetKey: state.currentIndex,
    enabled: state.phase === "quiz",
  });

  const handleSelect = useCallback(
    (index) => {
      if (isLocked) return;
      handleAdvance({ selectedIndex: index, timedOut: false });
    },
    [handleAdvance, isLocked]
  );

  const streakVisible = state.currentStreak >= 2;

  const optionRevealState = useMemo(() => {
    return currentQuestion.options.map((_, index) => {
      if (!isLocked) return "";

      if (index === currentQuestion.correctAnswer) return "correct";
      if (index === selectedIndex && index !== currentQuestion.correctAnswer) return "wrong";

      return "neutral";
    });
  }, [currentQuestion, isLocked, selectedIndex]);

  if (!currentQuestion) return null;

  return (
    <section className={styles.wrapper}>
      <div className={styles.topBar}>
        <div className={styles.metaCard}>
          <span>Utilizator</span>
          <strong>{state.config.username}</strong>
        </div>

        <div className={styles.metaCard}>
          <span>Progres</span>
          <strong>
            {state.currentIndex + 1} / {totalQuestions}
          </strong>
        </div>

        <div className={styles.metaCard}>
          <span>Categorie</span>
          <strong>{currentQuestion.category}</strong>
        </div>

        <div className={styles.metaCard}>
          <span>Dificultate</span>
          <strong>{currentQuestion.difficulty}</strong>
        </div>

        {streakVisible && (
          <div className={`${styles.metaCard} ${styles.streak}`}>
            <span>Streak</span>
            <strong>{state.currentStreak}</strong>
          </div>
        )}
      </div>

      <ProgressBar value={progressValue} />

      <div className={styles.questionCard}>
        <div className={styles.timerRow}>
          <div>
            <p className={styles.timerLabel}>Timer</p>
            <strong className={styles.timerValue}>
              {timeLimit === null ? "Nelimitat" : `${timeLeft}s`}
            </strong>
          </div>

          {timeLimit !== null && (
            <div className={styles.timerBarWrap}>
              <div className={styles.timerBar}>
                <div
                  className={styles.timerFill}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <h2 className={styles.question}>{currentQuestion.question}</h2>

        <div className={styles.answers}>
          {currentQuestion.options.map((option, index) => (
            <AnswerOption
              key={`${currentQuestion.id}-${index}`}
              option={option}
              index={index}
              onSelect={handleSelect}
              disabled={isLocked}
              revealState={optionRevealState[index]}
            />
          ))}
        </div>

        {isLocked && selectedIndex !== null && (
          <p className={styles.feedback}>
            {selectedIndex === currentQuestion.correctAnswer
              ? "Corect! Se trece la urmatoarea intrebare..."
              : "Gresit. Se trece la urmatoarea intrebare..."}
          </p>
        )}

        {isLocked && selectedIndex === null && (
          <p className={styles.feedback}>Timp expirat. Intrebarea a fost marcata ca incorecta...</p>
        )}
      </div>
    </section>
  );
}

export default QuizScreen;