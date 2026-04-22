import { useCallback, useMemo, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import styles from "../styles/StartScreen.module.css";

const timeOptions = [
  { label: "Nelimitat", value: "unlimited" },
  { label: "10 secunde", value: 10 },
  { label: "15 secunde", value: 15 },
  { label: "20 secunde", value: 20 },
  { label: "30 secunde", value: 30 },
];

function StartScreen() {
  const { state, startQuiz } = useQuiz();
  const [username, setUsername] = useState(state.config.username || "");
  const [category, setCategory] = useState("Toate");
  const [amount, setAmount] = useState(5);
  const [timeLimit, setTimeLimit] = useState("unlimited");
  const [error, setError] = useState("");

  const availableCount = useMemo(() => {
    if (category === "Toate") return state.allQuestions.length;
    return state.questionCounts[category] || 0;
  }, [category, state.allQuestions.length, state.questionCounts]);

  const amountOptions = useMemo(() => {
    const defaults = [5, 10, 15, 20];
    const filtered = defaults.filter((value) => value <= availableCount);

    if (!filtered.length && availableCount > 0) {
      filtered.push(availableCount);
    }

    return [...filtered, "all"];
  }, [availableCount]);

  const handleCategoryChange = useCallback(
    (event) => {
      const nextCategory = event.target.value;
      setCategory(nextCategory);

      const nextAvailableCount =
        nextCategory === "Toate"
          ? state.allQuestions.length
          : state.questionCounts[nextCategory] || 0;

      const validNumericOptions = [5, 10, 15, 20].filter((value) => value <= nextAvailableCount);

      if (amount !== "all") {
        if (validNumericOptions.length > 0) {
          setAmount(validNumericOptions[0]);
        } else {
          setAmount("all");
        }
      }
    },
    [amount, state.allQuestions.length, state.questionCounts]
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!username.trim()) {
        setError("Introdu un nume de utilizator.");
        return;
      }

      setError("");

      startQuiz({
        username: username.trim(),
        category,
        amount,
        timeLimit,
      });
    },
    [username, category, amount, timeLimit, startQuiz]
  );

  return (
    <section className={styles.wrapper}>
      <div className={styles.infoCard}>
        <h2>Configureaza quiz-ul</h2>

        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span>Total intrebari</span>
            <strong>{state.allQuestions.length}</strong>
          </div>
          <div className={styles.statBox}>
            <span>Categorii</span>
            <strong>{state.categories.length}</strong>
          </div>
          <div className={styles.statBox}>
            <span>Disponibile acum</span>
            <strong>{availableCount}</strong>
          </div>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="username">Nume utilizator</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="category">Categorie</label>
          <select id="category" value={category} onChange={handleCategoryChange}>
            <option value="Toate">Toate</option>
            {state.categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="amount">Numar de intrebari</label>
          <select id="amount" value={amount} onChange={(event) => setAmount(event.target.value === "all" ? "all" : Number(event.target.value))}>
            {amountOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? `Toate disponibile (${availableCount})` : option}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="timeLimit">Timp per intrebare</label>
          <select id="timeLimit" value={timeLimit} onChange={(event) => setTimeLimit(event.target.value === "unlimited" ? "unlimited" : Number(event.target.value))}>
            {timeOptions.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.startButton} type="submit">
          Start quiz
        </button>
      </form>
    </section>
  );
}

export default StartScreen;