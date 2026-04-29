import { Link } from "react-router-dom";

import type { EventoSample } from "../data/sample";
import { dateFull, moneyShort } from "../lib/format";
import styles from "./EventCard.module.css";

type Props = {
  ev: EventoSample;
  to?: string;
};

export const EventCard = ({ ev, to }: Props) => {
  const d = dateFull(ev.data);
  const href = to ?? `/app/eventos/${ev.id}`;
  return (
    <Link to={href} className={styles.card}>
      <div className={styles.cover} style={{ background: ev.img }}>
        {ev.urgente && (
          <div className={styles.badgeUrgent}>ÚLTIMOS INGRESSOS</div>
        )}
        <div className={styles.badgeCategory}>{ev.categoria}</div>
      </div>
      <div className={styles.body}>
        <div className={styles.dateBlock}>
          <div className={styles.mes}>{d.mes}</div>
          <div className={styles.dia}>{d.dia}</div>
          <div className={styles.semana}>{d.semana}</div>
        </div>
        <div className={styles.info}>
          <div className={styles.title}>{ev.nome}</div>
          <div className={styles.meta}>📍 {ev.local}</div>
          <div className={styles.price}>
            {ev.precoMin === 0
              ? "Grátis"
              : `a partir de ${moneyShort(ev.precoMin)}`}
          </div>
        </div>
      </div>
    </Link>
  );
};
