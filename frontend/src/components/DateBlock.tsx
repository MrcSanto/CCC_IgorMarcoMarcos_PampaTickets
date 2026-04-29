import { dateFull } from "../lib/format";
import styles from "./DateBlock.module.css";

type DateBlockProps = {
  iso: string;
  size?: "sm" | "md" | "lg";
  showWeekday?: boolean;
  showHour?: boolean;
};

const SIZES = {
  sm: { dia: 20, mes: 9, padding: "4px 6px", minWidth: 44 },
  md: { dia: 26, mes: 10, padding: "8px 10px", minWidth: 56 },
  lg: { dia: 32, mes: 11, padding: "10px 14px", minWidth: 72 },
};

export const DateBlock = ({
  iso,
  size = "md",
  showWeekday = false,
  showHour = false,
}: DateBlockProps) => {
  const d = dateFull(iso);
  const sz = SIZES[size];
  return (
    <div
      className={styles.block}
      style={{ padding: sz.padding, minWidth: sz.minWidth }}
    >
      <div className={styles.mes} style={{ fontSize: sz.mes }}>
        {d.mes}
      </div>
      <div className={styles.dia} style={{ fontSize: sz.dia }}>
        {d.dia}
      </div>
      {(showWeekday || showHour) && (
        <div className={styles.sub}>
          {showWeekday ? d.semana : null}
          {showWeekday && showHour ? " · " : null}
          {showHour ? d.hora : null}
        </div>
      )}
    </div>
  );
};
