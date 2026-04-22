import ThemeToggle from "./ThemeToggle";
import styles from "../styles/Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Quiz App</h1>
      </div>

      <ThemeToggle />
    </header>
  );
}

export default Header;