import { Link } from "react-router-dom";

import { Logo } from "../../components/Logo";
import styles from "./AuthShell.module.css";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const AuthShell = ({ title, subtitle, children, footer }: Props) => (
  <div className={styles.page} data-theme="dark">
    <Link to="/" className={styles.brand}>
      <Logo size={32} />
    </Link>

    <div className={styles.card}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  </div>
);
