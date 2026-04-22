import styles from "../styles/ProgressBar.module.css";

function ProgressBar({ value }) {
  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: `${value}%` }}></div>
    </div>
  );
}

export default ProgressBar;