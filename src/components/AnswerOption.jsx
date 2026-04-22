import { memo } from "react";
import styles from "../styles/AnswerOption.module.css";

function AnswerOption({ option, index, onSelect, disabled, revealState }) {
  let className = styles.option;

  if (revealState === "correct") className = `${styles.option} ${styles.correct}`;
  if (revealState === "wrong") className = `${styles.option} ${styles.wrong}`;
  if (revealState === "neutral") className = `${styles.option} ${styles.neutral}`;

  return (
    <button
      type="button"
      className={className}
      onClick={() => onSelect(index)}
      disabled={disabled}
    >
      <span className={styles.badge}>{String.fromCharCode(65 + index)}</span>
      <span>{option}</span>
    </button>
  );
}

export default memo(AnswerOption);