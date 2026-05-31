import styles from "./Logo.module.css";

type LogoProps = {
  size?: number;
};

export const Logo = ({ size = 28 }: LogoProps) => (
  <div className={styles.logo}>
    <img
      className={styles.img}
      src="/logo.png"
      alt="PampaTickets"
      style={{ height: size }}
    />
    <span className={styles.wordmark} style={{ fontSize: Math.round(size * 0.65) }}>
      pampa<em>tickets</em>
    </span>
  </div>
);
