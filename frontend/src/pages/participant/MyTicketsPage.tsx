import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { logout } from "../../api/auth";
import { listarEventos } from "../../api/eventos";
import { StatusPill } from "../../components/StatusPill";
import type { EventoSample } from "../../data/sample";
import { initials, useCurrentUser } from "../../lib/auth-store";
import { dateFull } from "../../lib/format";

import styles from "./MyTicketsPage.module.css";

type Tab = "proximos" | "passados" | "salvos";

const TABS: { id: Tab; l: string; n: number }[] = [
  { id: "proximos", l: "Próximos eventos", n: 2 },
  { id: "passados", l: "Histórico", n: 17 },
  { id: "salvos", l: "Salvos", n: 5 },
];

export const MyTicketsPage = () => {
  const [events, setEvents] = useState<EventoSample[]>([]);
  const [tab, setTab] = useState<Tab>("proximos");
  const user = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    listarEventos().then(setEvents);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const memberSince = user
    ? new Date(user.criado_em).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      })
    : null;

  const meus = events.length
    ? [
        { ev: events[0], qtd: 2, status: "CONFIRMADO" as const, pedido: "#PT-48291" },
        { ev: events[3] ?? events[0], qtd: 4, status: "CONFIRMADO" as const, pedido: "#PT-48190" },
        { ev: events[2] ?? events[0], qtd: 1, status: "PASSADO" as const, pedido: "#PT-47120" },
      ]
    : [];

  const filtered = meus.filter((m) =>
    tab === "proximos" ? m.status === "CONFIRMADO" : tab === "passados" ? m.status === "PASSADO" : false,
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.avatar}>{user ? initials(user.nome) : "?"}</div>
        <div>
          <h1 className={styles.title}>
            Olá, {user ? user.nome.split(/\s+/)[0] : "visitante"} 👋
          </h1>
          <div className={styles.email}>
            {user
              ? `${user.email}${memberSince ? ` · Membro desde ${memberSince}` : ""}`
              : "Entre para acompanhar seus ingressos"}
          </div>
        </div>
        <div className={styles.headerActions}>
          {user ? (
            <>
              <button type="button" className={styles.secondary}>
                Editar perfil
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={handleLogout}
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.secondary}>
              Entrar
            </Link>
          )}
        </div>
      </header>

      <div className={styles.stats}>
        {[
          { l: "Próximos", v: "2", s: "eventos confirmados" },
          { l: "Já fui", v: "17", s: "eventos no histórico" },
          { l: "Investido", v: "R$ 4.280", s: "em ingressos · 24 meses" },
          { l: "Categoria favorita", v: "Festival", s: "8 eventos" },
        ].map((s) => (
          <div key={s.l} className={styles.statCard}>
            <div className={styles.statLabel}>{s.l}</div>
            <div className={styles.statValue}>{s.v}</div>
            <div className={styles.statSub}>{s.s}</div>
          </div>
        ))}
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            className={styles.tab}
            data-active={tab === t.id ? "1" : undefined}
            onClick={() => setTab(t.id)}
          >
            {t.l}
            <span className={styles.tabCount}>{t.n}</span>
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            Nenhum item nessa aba ainda. Que tal{" "}
            <Link to="/app/explorar" style={{ color: "var(--pt-accent)" }}>
              explorar eventos
            </Link>
            ?
          </div>
        ) : (
          filtered.map((m, i) => {
            const d = dateFull(m.ev.data);
            const passado = m.status === "PASSADO";
            return (
              <div
                key={i}
                className={styles.row}
                style={{ opacity: passado ? 0.6 : 1 }}
              >
                <div className={styles.rowCover} style={{ background: m.ev.img }}>
                  <div className={styles.rowCoverOverlay} />
                  <div className={styles.rowDate}>
                    <div className={styles.rowMes}>{d.mes}</div>
                    <div className={styles.rowDia}>{d.dia}</div>
                  </div>
                </div>
                <div className={styles.rowBody}>
                  <div className={styles.rowEyebrow}>
                    <span className="pt-eyebrow">{m.ev.categoria}</span>
                    <StatusPill status={passado ? "PASSADO" : "CONFIRMADO"} />
                  </div>
                  <div className={styles.rowTitle}>{m.ev.nome}</div>
                  <div className={styles.rowMeta}>
                    <span>
                      📅 {d.semana}, {d.dia} {d.mes} · {d.hora}
                    </span>
                    <span>📍 {m.ev.local}</span>
                    <span>
                      🎟 {m.qtd} ingresso{m.qtd > 1 ? "s" : ""}
                    </span>
                    <span className="pt-mono">{m.pedido}</span>
                  </div>
                </div>
                <div className={styles.rowActions}>
                  {!passado ? (
                    <>
                      <Link
                        to={`/app/eventos/${m.ev.id}/ingressos`}
                        className={styles.primary}
                      >
                        Ver ingressos
                      </Link>
                      <button type="button" className={styles.secondary}>
                        Transferir
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className={styles.secondary}>
                        Avaliar evento
                      </button>
                      <button type="button" className={styles.ghost}>
                        Baixar comprovante
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
