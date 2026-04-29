import styles from "./ProgressBar.module.css";

type Props = {
  value: number;
  height?: number;
};

const tone = (v: number) =>
  v >= 1 ? "danger" : v > 0.9 ? "warn" : "ok";

export const ProgressBar = ({ value, height = 6 }: Props) => (
  <div className={styles.track} style={{ height }}>
    <div
      className={styles.fill}
      data-tone={tone(value)}
      style={{ width: `${Math.min(100, value * 100)}%` }}
    />
  </div>
);
