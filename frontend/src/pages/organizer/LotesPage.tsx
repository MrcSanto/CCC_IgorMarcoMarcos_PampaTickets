import { PageHeader } from "../../components/PageHeader";
import { ProgressBar } from "../../components/ProgressBar";
import { StatusPill } from "../../components/StatusPill";
import { PT_EVENTS } from "../../data/sample";
import { money } from "../../lib/format";

import shared from "./shared.module.css";
import styles from "./LotesPage.module.css";

const CUPONS = [
  { c: "WINTER20", d: "20% OFF", u: "128 / 500" },
  { c: "AMIGOSPAMPA", d: "R$ 30 OFF", u: "42 / 100" },
  { c: "IMPRENSA", d: "50% OFF", u: "18 / 25" },
];

const PALETTE = ["var(--pt-accent)", "#6ba87f", "var(--pt-warn)", "#a8c98c"];

export const LotesPage = () => {
  const ev = PT_EVENTS[0];
  return (
    <>
      <PageHeader
        breadcrumb="Festival de Inverno / Lotes & vendas"
        title="Lotes & vendas"
        actions={<button className={shared.btnPrimary}>+ Criar lote</button>}
      />

      <div className={shared.body}>
        <div className={shared.card}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>Lote</th>
                <th>Tipo</th>
                <th className={styles.numeric}>Preço</th>
                <th className={styles.numeric}>Vendidos</th>
                <th style={{ width: 220 }}>Progresso</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ev.lotes.map((l, i) => {
                const pct = (l.total - l.restantes) / l.total;
                const esgotado = l.restantes === 0;
                return (
                  <tr key={i}>
                    <td className={styles.bold}>{l.nome}</td>
                    <td>
                      <span className={styles.tipo}>{l.tipo}</span>
                    </td>
                    <td className={`${styles.numeric} ${styles.bold}`}>
                      {money(l.preco)}
                    </td>
                    <td className={styles.numeric}>
                      {(l.total - l.restantes).toLocaleString("pt-BR")}/
                      {l.total.toLocaleString("pt-BR")}
                    </td>
                    <td>
                      <ProgressBar value={pct} />
                      <div className={styles.pct}>
                        {(pct * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td>
                      <StatusPill
                        status={esgotado ? "ESGOTADO" : "VENDENDO"}
                      />
                    </td>
                    <td className={styles.numeric}>
                      <button className={styles.menuBtn} aria-label="Menu">
                        ⋯
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.bottomRow}>
          <div className={shared.cardPadded}>
            <h3 className={shared.cardTitle}>Distribuição de receita</h3>
            <div className={styles.distBar}>
              {ev.lotes.map((l, i) => {
                const rec = (l.total - l.restantes) * l.preco;
                return (
                  <div
                    key={i}
                    className={styles.distSlice}
                    style={{
                      flex: rec || 1,
                      background: PALETTE[i % PALETTE.length],
                    }}
                  />
                );
              })}
            </div>
            {ev.lotes.map((l, i) => {
              const rec = (l.total - l.restantes) * l.preco;
              return (
                <div key={i} className={styles.distRow}>
                  <span className={styles.distLabel}>
                    <span
                      className={styles.distSwatch}
                      style={{ background: PALETTE[i % PALETTE.length] }}
                    />
                    {l.nome}
                  </span>
                  <span className={styles.bold}>{money(rec)}</span>
                </div>
              );
            })}
          </div>

          <div className={shared.cardPadded}>
            <h3 className={shared.cardTitle}>Cupons ativos</h3>
            {CUPONS.map((c, i) => (
              <div
                key={c.c}
                className={styles.cupom}
                style={
                  i > 0 ? { borderTop: "1px solid var(--pt-border)" } : undefined
                }
              >
                <div>
                  <div className={`pt-mono ${styles.cupomCode}`}>{c.c}</div>
                  <div className={styles.cupomMeta}>
                    {c.d} · usado {c.u}
                  </div>
                </div>
                <button className={shared.btnSecondary}>Editar</button>
              </div>
            ))}
            <button className={styles.dashedBtn}>+ Novo cupom</button>
          </div>
        </div>
      </div>
    </>
  );
};
