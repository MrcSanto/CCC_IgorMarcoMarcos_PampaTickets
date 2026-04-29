import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { obterEvento } from "../../api/eventos";
import type { EventoSample } from "../../data/sample";
import { useCurrentUser } from "../../lib/auth-store";
import { dateFull } from "../../lib/format";

import styles from "./TicketsPage.module.css";

export const TicketsPage = () => {
  const { id } = useParams();
  const [ev, setEv] = useState<EventoSample | null>(null);
  const user = useCurrentUser();

  useEffect(() => {
    if (id) obterEvento(id).then(setEv);
  }, [id]);

  if (!ev) return null;
  return <TicketsView ev={ev} portador={user?.nome ?? "Convidado"} />;
};

const TicketsView = ({
  ev,
  portador,
}: {
  ev: EventoSample;
  portador: string;
}) => {
  const d = dateFull(ev.data);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.checkmark}>✓</div>
        <h1 className={styles.title}>Pedido confirmado!</h1>
        <p className={styles.lead}>
          Seus ingressos estão prontos. Enviamos cópia para o seu e-mail.
        </p>
      </header>

      {[1, 2].map((n) => (
        <Ticket key={n} n={n} ev={ev} d={d} portador={portador} />
      ))}

      <div className={styles.actions}>
        <button type="button" className={styles.secondary}>
          📥 Baixar PDF
        </button>
        <Link to="/app" className={styles.primary}>
          Voltar para home
        </Link>
      </div>
    </div>
  );
};

type Parts = ReturnType<typeof dateFull>;

const Ticket = ({
  ev,
  n,
  d,
  portador,
}: {
  ev: EventoSample;
  n: number;
  d: Parts;
  portador: string;
}) => {
  const qrPattern = useMemo(
    () =>
      Array.from({ length: 64 }).map((_, i) =>
        (i * 7 + n * 3) % 3 === 0 || i % 9 === 0,
      ),
    [n],
  );

  return (
    <div className={styles.ticket}>
      <div className={styles.ticketHead} style={{ background: ev.img }}>
        <div className={styles.ticketHeadInfo}>
          <div className={styles.ticketBrand}>PAMPATICKETS</div>
          <div className={styles.ticketEvent}>{ev.nome}</div>
        </div>
        <div className={styles.ticketNum}>#{n}</div>
      </div>
      <div className={styles.ticketBody}>
        <div className={styles.ticketDetails}>
          {[
            { l: "Data", v: `${d.dia} ${d.mes} · ${d.hora}` },
            { l: "Local", v: ev.local },
            { l: "Setor", v: "Inteira" },
            { l: "Portador", v: portador },
          ].map((kv) => (
            <div key={kv.l}>
              <div className={styles.ticketLabel}>{kv.l}</div>
              <div className={styles.ticketValue}>{kv.v}</div>
            </div>
          ))}
        </div>
        <div className={styles.qr} aria-label="QR Code do ingresso">
          {qrPattern.map((on, i) => (
            <div key={i} className={on ? styles.qrOn : styles.qrOff} />
          ))}
        </div>
      </div>
    </div>
  );
};
