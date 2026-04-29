import { Link } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { StatusPill } from "../../components/StatusPill";
import { money } from "../../lib/format";

import shared from "./shared.module.css";
import styles from "./FinancePage.module.css";

const BREAKDOWN = [
  { l: "Receita bruta", v: "R$ 487.320", s: "1.842 ingressos · 7 dias" },
  { l: "Taxas plataforma", v: "-R$ 38.985", s: "8% sobre receita" },
  { l: "Estornos", v: "-R$ 4.200", s: "14 cancelamentos" },
  { l: "Receita líquida", v: "R$ 444.135", s: "91.1% da bruta" },
];

const TXS = [
  { d: "Saque automático D+30", t: "SAÍDA", dt: "28 abr · 09:14", s: "PROCESSANDO", v: -89400 },
  { d: "Venda · 2× Inteira (#PT-48291)", t: "ENTRADA", dt: "27 abr · 18:42", s: "CONFIRMADO", v: 760 },
  { d: "Estorno · #PT-48180", t: "ESTORNO", dt: "27 abr · 14:20", s: "CONCLUÍDO", v: -380 },
  { d: "Venda · 4× VIP Camarote", t: "ENTRADA", dt: "27 abr · 11:08", s: "CONFIRMADO", v: 1920 },
  { d: "Taxa plataforma · semana 17", t: "TAXA", dt: "26 abr · 23:59", s: "CONCLUÍDO", v: -8740 },
  { d: "Saque manual · banco Inter", t: "SAÍDA", dt: "24 abr · 16:32", s: "CONCLUÍDO", v: -50000 },
  { d: "Venda · 1× Plateia A", t: "ENTRADA", dt: "24 abr · 10:15", s: "CONFIRMADO", v: 180 },
];

const TX_TONE: Record<string, string> = {
  ENTRADA: "ok",
  SAÍDA: "warn",
  ESTORNO: "danger",
  TAXA: "warn",
};

const FILTERS = ["Tudo", "Entradas", "Saídas", "Estornos"];

export const FinancePage = () => (
  <>
    <PageHeader
      breadcrumb="Painel / Financeiro"
      title="Financeiro"
      actions={<button className={shared.btnPrimary}>↓ Exportar relatório</button>}
    />

    <div className={shared.body}>
      <div className={styles.balance}>
        <div className={styles.balanceMain}>
          <div className={styles.balanceLabel}>
            Saldo disponível para saque
          </div>
          <div className={styles.balanceValue}>
            R$ 387.140<span className={styles.balanceCents}>,00</span>
          </div>
          <div className={styles.balanceSub}>
            Próxima liberação automática: 02/mai/2026
          </div>
        </div>
        <div>
          <div className={styles.balanceLabel}>A liberar</div>
          <div className={styles.balanceSecondary}>R$ 100.180,00</div>
          <div className={styles.balanceTertiary}>D+30 (PIX) · D+5 (cartão)</div>
        </div>
        <div className={styles.balanceActions}>
          <button className={styles.balanceCta}>Solicitar saque</button>
          <button className={styles.balanceGhost}>Configurar conta</button>
        </div>
      </div>

      <div className={styles.breakdown}>
        {BREAKDOWN.map((c) => (
          <div key={c.l} className={shared.cardPadded}>
            <div className={styles.breakdownLabel}>{c.l}</div>
            <div className={styles.breakdownValue}>{c.v}</div>
            <div className={styles.breakdownSub}>{c.s}</div>
          </div>
        ))}
      </div>

      <div className={shared.card}>
        <div className={shared.tableHead}>
          <h3 className={shared.cardTitle}>Movimentações recentes</h3>
          <div className={styles.filters}>
            {FILTERS.map((f, i) => (
              <button
                key={f}
                type="button"
                className={styles.filter}
                data-active={i === 0 ? "1" : undefined}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <table className={shared.table}>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Status</th>
              <th className={styles.numeric}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {TXS.map((r, i) => (
              <tr key={i}>
                <td>{r.d}</td>
                <td>
                  <span
                    className={styles.txType}
                    data-tone={TX_TONE[r.t] ?? "neutral"}
                  >
                    {r.t}
                  </span>
                </td>
                <td className={styles.dim}>{r.dt}</td>
                <td>
                  <StatusPill
                    status={r.s === "PROCESSANDO" ? "PENDENTE" : "CONFIRMADO"}
                  />
                </td>
                <td
                  className={`${styles.numeric} pt-mono`}
                  style={{
                    fontWeight: 700,
                    color: r.v > 0 ? "var(--pt-accent)" : "var(--pt-text)",
                  }}
                >
                  {r.v > 0 ? "+" : ""}
                  {money(r.v)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link to="/org" className={shared.btnSecondary} style={{ alignSelf: "flex-start" }}>
        ← Voltar para visão geral
      </Link>
    </div>
  </>
);
