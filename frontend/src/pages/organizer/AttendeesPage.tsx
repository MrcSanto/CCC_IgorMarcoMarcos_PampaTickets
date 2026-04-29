import { useMemo, useState } from "react";

import { PageHeader } from "../../components/PageHeader";
import { StatusPill } from "../../components/StatusPill";

import shared from "./shared.module.css";
import styles from "./AttendeesPage.module.css";

const LIST = [
  { n: "Maria Silva", e: "maria@email.com", cpf: "123.456.789-00", l: "VIP Camarote", s: "CHECK-IN", d: "18 jul · 19:42", p: "#PT-48291" },
  { n: "João Martins", e: "joao.m@gmail.com", cpf: "987.654.321-00", l: "2º lote · Inteira", s: "CONFIRMADO", d: "—", p: "#PT-48290" },
  { n: "Ana Lima", e: "ana.l@outlook.com", cpf: "456.123.789-00", l: "1º lote · Meia", s: "CONFIRMADO", d: "—", p: "#PT-48289" },
  { n: "Pedro Reis", e: "pedro@email.com", cpf: "321.654.987-00", l: "2º lote · Inteira", s: "CHECK-IN", d: "18 jul · 19:38", p: "#PT-48288" },
  { n: "Carla Fernandes", e: "carla.f@gmail.com", cpf: "741.852.963-00", l: "VIP Camarote", s: "CANCELADO", d: "—", p: "#PT-48287" },
  { n: "Lucas Oliveira", e: "lucas@email.com", cpf: "852.963.741-00", l: "2º lote · Inteira", s: "CHECK-IN", d: "18 jul · 19:51", p: "#PT-48286" },
  { n: "Beatriz Costa", e: "bia.costa@gmail.com", cpf: "963.741.852-00", l: "1º lote · Inteira", s: "CONFIRMADO", d: "—", p: "#PT-48285" },
  { n: "Rafael Souza", e: "rafael.s@email.com", cpf: "147.258.369-00", l: "2º lote · Inteira", s: "PENDENTE", d: "—", p: "#PT-48284" },
];

export const AttendeesPage = () => {
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      LIST.filter(
        (p) =>
          !q ||
          p.n.toLowerCase().includes(q.toLowerCase()) ||
          p.e.toLowerCase().includes(q.toLowerCase()) ||
          p.p.includes(q),
      ),
    [q],
  );

  return (
    <>
      <PageHeader
        breadcrumb="Festival de Inverno / Participantes"
        title={
          <>
            Participantes
            <span className={styles.titleHint}>· 1.842 confirmados</span>
          </>
        }
        actions={
          <>
            <button className={shared.btnSecondary}>↓ Exportar CSV</button>
            <button className={shared.btnPrimary}>+ Cortesia</button>
          </>
        }
      />

      <div className={shared.body}>
        <div className={styles.stats}>
          {[
            { l: "Total confirmados", v: "1.842" },
            { l: "Já fizeram check-in", v: "847", s: "46%" },
            { l: "Pendentes", v: "23", tone: "warn" as const },
            { l: "Cancelados", v: "14", tone: "danger" as const },
            { l: "Cortesias", v: "38", s: "de 50" },
          ].map((c) => (
            <div key={c.l} className={shared.cardPadded}>
              <div className={styles.statLabel}>{c.l}</div>
              <div className={styles.statValue} data-tone={c.tone}>
                {c.v}
              </div>
              {c.s && <div className={styles.statSub}>{c.s}</div>}
            </div>
          ))}
        </div>

        <div className={`${shared.cardPadded} ${styles.searchBar}`}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, e-mail, CPF ou número do pedido…"
              className={styles.searchInput}
            />
          </div>
          <select className={styles.select}>
            <option>Todos os lotes</option>
            <option>1º lote · Inteira</option>
            <option>1º lote · Meia</option>
            <option>2º lote · Inteira</option>
            <option>VIP Camarote</option>
          </select>
          <select className={styles.select}>
            <option>Todos os status</option>
            <option>Confirmado</option>
            <option>Check-in</option>
            <option>Pendente</option>
            <option>Cancelado</option>
          </select>
        </div>

        <div className={shared.card}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" className={styles.checkbox} />
                </th>
                <th>Participante</th>
                <th>Lote</th>
                <th>Status</th>
                <th>Check-in</th>
                <th>Pedido</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.p}>
                  <td>
                    <input type="checkbox" className={styles.checkbox} />
                  </td>
                  <td>
                    <div className={styles.participant}>
                      <div className={styles.avatar}>
                        {p.n.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className={styles.bold}>{p.n}</div>
                        <div className={styles.muted}>
                          {p.e} · {p.cpf}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.smallText}>{p.l}</td>
                  <td>
                    <StatusPill status={p.s} />
                  </td>
                  <td className={styles.muted}>{p.d}</td>
                  <td className={`pt-mono ${styles.smallText}`}>{p.p}</td>
                  <td className={styles.numeric}>
                    <button className={styles.menuBtn}>⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.tableFoot}>
            <span>
              Mostrando {filtered.length} de 1.842 participantes
            </span>
            <div className={styles.pagination}>
              {["‹", "1", "2", "3", "...", "184", "›"].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.pageBtn}
                  data-active={p === "1" ? "1" : undefined}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
