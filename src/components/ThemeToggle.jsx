import { useTheme } from "../context/ThemeContext";
import styles from "../styles/ThemeToggle.module.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className={styles.toggle} onClick={toggleTheme} type="button">
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

export default ThemeToggle;