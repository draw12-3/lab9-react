import { memo } from "react";
import styles from "../styles/ResultCard.module.css";

function ResultCard({ item }) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={item.isCorrect ? styles.correctBadge : styles.wrongBadge}>
          {item.isCorrect ? "Corect" : "Gresit"}
        </span>
        <span className={styles.category}>{item.category}</span>
        <span className={styles.difficulty}>{item.difficulty}</span>
      </div>

      <h4 className={styles.question}>{item.question}</h4>

      <p>
        <strong>Raspuns dat:</strong> {item.selectedText}
      </p>

      {!item.isCorrect && (
        <p>
          <strong>Raspuns corect:</strong> {item.correctText}
        </p>
      )}

      {item.timedOut && <p className={styles.timeout}>Timp expirat</p>}
    </article>
  );
}

export default memo(ResultCard);