import { useQuiz } from "./context/QuizContext";
import Header from "./components/Header";
import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";
import styles from "./styles/App.module.css";

function App() {
  const { state } = useQuiz();

  return (
    <div className={styles.app}>
      <div className={styles.overlay}></div>

      <div className={styles.container}>
        <Header />

        <main className={styles.main}>
          {state.phase === "start" && <StartScreen />}
          {state.phase === "quiz" && <QuizScreen />}
          {state.phase === "results" && <ResultsScreen />}
        </main>
      </div>
    </div>
  );
}

export default App;