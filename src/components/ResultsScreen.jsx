import { useCallback, useMemo, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import ResultCard from "./ResultCard";
import styles from "../styles/ResultsScreen.module.css";

function ResultsScreen() {
  const { state, resetToStart } = useQuiz();
  const [tab, setTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("Toate");

  const total = state.questions.length;
  const correct = state.answers.filter((item) => item.isCorrect).length;
  const percentage = total ? ((correct / total) * 100).toFixed(2) : "0.00";

  const categoryStats = useMemo(() => {
    return state.questions.reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = { total: 0, correct: 0 };
      }

      acc[question.category].total += 1;

      const answer = state.answers.find((item) => item.questionId === question.id);
      if (answer?.isCorrect) {
        acc[question.category].correct += 1;
      }

      return acc;
    }, {});
  }, [state.questions, state.answers]);

  const filteredAnswers = useMemo(() => {
    return state.answers.filter((item) => {
      const matchTab =
        tab === "all" ||
        (tab === "correct" && item.isCorrect) ||
        (tab === "wrong" && !item.isCorrect);

      const matchCategory =
        categoryFilter === "Toate" || item.category === categoryFilter;

      return matchTab && matchCategory;
    });
  }, [state.answers, tab, categoryFilter]);

  const sortedHistory = useMemo(() => {
    return [...state.scoreHistory].sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      if (b.score !== a.score) return b.score - a.score;
      return b.maxStreak - a.maxStreak;
    });
  }, [state.scoreHistory]);

  const handleReset = useCallback(() => {
    resetToStart();
  }, [resetToStart]);

  return (
    <section className={styles.wrapper}>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>Utilizator</span>
          <strong>{state.config.username}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Scor final</span>
          <strong>
            {correct} / {total}
          </strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Procentaj</span>
          <strong>{percentage}%</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Streak maxim</span>
          <strong>{state.maxStreak}</strong>
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeader}>
          <h2>Performanta pe categorii</h2>
          <button className={styles.retryButton} onClick={handleReset} type="button">
            Incearca din nou
          </button>
        </div>

        <div className={styles.categoryGrid}>
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div key={category} className={styles.categoryCard}>
              <span>{category}</span>
              <strong>
                {stats.correct} / {stats.total}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeader}>
          <h2>Revizuire raspunsuri</h2>

          <div className={styles.filters}>
            <div className={styles.tabs}>
              <button
                type="button"
                className={tab === "all" ? styles.activeTab : ""}
                onClick={() => setTab("all")}
              >
                Toate
              </button>
              <button
                type="button"
                className={tab === "correct" ? styles.activeTab : ""}
                onClick={() => setTab("correct")}
              >
                Corecte
              </button>
              <button
                type="button"
                className={tab === "wrong" ? styles.activeTab : ""}
                onClick={() => setTab("wrong")}
              >
                Gresite
              </button>
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="Toate">Toate categoriile</option>
              {state.categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.reviewGrid}>
          {filteredAnswers.length > 0 ? (
            filteredAnswers.map((item) => <ResultCard key={item.questionId} item={item} />)
          ) : (
            <p className={styles.empty}>Nu exista raspunsuri pentru filtrul selectat.</p>
          )}
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeader}>
          <h2>Top scoruri</h2>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Utilizator</th>
                <th>Scor</th>
                <th>Procent</th>
                <th>Streak maxim</th>
                <th>Categorie</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.username}</td>
                  <td>
                    {item.score}/{item.total}
                  </td>
                  <td>{item.percentage}%</td>
                  <td>{item.maxStreak}</td>
                  <td>{item.category}</td>
                  <td>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ResultsScreen;