import styles from "./Logo.module.css";

type LogoProps = {
  size?: number;
};

export const Logo = ({ size = 28 }: LogoProps) => (
  <div className={styles.logo}>
    <div
      className={styles.mark}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.5),
        borderRadius: Math.round(size * 0.22),
      }}
    >
      P
    </div>
    <span className={styles.wordmark} style={{ fontSize: Math.round(size * 0.65) }}>
      pampa<em>tickets</em>
    </span>
  </div>
);
