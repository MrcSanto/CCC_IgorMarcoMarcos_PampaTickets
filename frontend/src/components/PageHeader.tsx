import type { ReactNode } from "react";

import styles from "./PageHeader.module.css";

type Props = {
  breadcrumb?: string;
  title: ReactNode;
  actions?: ReactNode;
};

export const PageHeader = ({ breadcrumb, title, actions }: Props) => (
  <header className={styles.header}>
    {breadcrumb && <div className={styles.breadcrumb}>{breadcrumb}</div>}
    <div className={styles.row}>
      <h1 className={styles.title}>{title}</h1>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  </header>
);
