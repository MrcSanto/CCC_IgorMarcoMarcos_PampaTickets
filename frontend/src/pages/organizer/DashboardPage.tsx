import { Link, useNavigate } from "react-router-dom";

import { MetricCard } from "../../components/MetricCard";
import { PageHeader } from "../../components/PageHeader";
import { ProgressBar } from "../../components/ProgressBar";
import { StatusPill } from "../../components/StatusPill";
import { PT_EVENTS, PT_ORG_DATA } from "../../data/sample";
import { firstName, useCurrentUser } from "../../lib/auth-store";
import { money, moneyShort } from "../../lib/format";

import styles from "./DashboardPage.module.css";

const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const m = PT_ORG_DATA.metricas;
  const evento = PT_EVENTS[0];
  const max = Math.max(...PT_ORG_DATA.vendas7d.map((v) => v.valor));
  const titulo = `${greeting()}, ${user ? firstName(user.nome) : "organizador"} 👋`;

  return (
    <>
      <PageHeader
        breadcrumb="Visão geral"
        title={titulo}
        actions={
          <>
            <button type="button" className={styles.range}>
              Últimos 7 dias ▾
            </button>
            <button
              type="button"
              className={styles.cta}
              onClick={() => navigate("/org/novo-evento")}
            >
              + Novo evento
            </button>
          </>
        }
      />

      <div className={styles.body}>
        <div className={styles.metrics}>
          <MetricCard
            label="Receita total"
            value={money(m.receita)}
            delta={m.receitaDelta}
            sub="em 7 dias"
          />
          <MetricCard
            label="Ingressos vendidos"
            value={m.ingressos.toLocaleString("pt-BR")}
            delta={m.ingressosDelta}
            sub="de 2.500 disponíveis"
          />
          <MetricCard
            label="Taxa de conversão"
            value={`${(m.conversao * 100).toFixed(1)}%`}
            delta={m.conversaoDelta}
            sub="visitantes → compra"
          />
          <MetricCard
            label="Ticket médio"
            value={money(m.ticketMedio)}
            delta={m.ticketMedioDelta}
            sub="por pedido"
          />
        </div>

        <div className={styles.charts}>
          <section className={styles.chartCard}>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle}>Vendas dos últimos 7 dias</h3>
                <div className={styles.cardSub}>
                  Festival de Inverno de Gramado
                </div>
              </div>
              <div className={styles.legend}>
                <span className={styles.legendDot} /> Receita
              </div>
            </div>
            <div className={styles.chart}>
              {[40000, 30000, 20000, 10000, 0].map((y, i) => (
                <div key={i} className={styles.gridLine} style={{ top: i * 55 }}>
                  <span className={styles.gridLabel}>
                    {(y / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
              {PT_ORG_DATA.vendas7d.map((d, i) => {
                const h = (d.valor / max) * 100;
                return (
                  <div key={i} className={styles.barWrap}>
                    <div className={styles.bar} style={{ height: `${h}%` }}>
                      {i === 5 && (
                        <div className={styles.barTooltip}>
                          {money(d.valor)}
                        </div>
                      )}
                    </div>
                    <div className={styles.barLabel}>{d.dia}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.lotesCard}>
            <h3 className={styles.cardTitle}>Status dos lotes</h3>
            {evento.lotes.map((l, i) => {
              const pct = (l.total - l.restantes) / l.total;
              return (
                <div key={i} className={styles.loteRow}>
                  <div className={styles.loteHead}>
                    <span className={styles.loteName}>{l.nome}</span>
                    <span className={styles.loteCount}>
                      {l.total - l.restantes}/{l.total}
                    </span>
                  </div>
                  <ProgressBar value={pct} />
                  <div className={styles.loteSub}>
                    {(pct * 100).toFixed(0)}% vendido · {moneyShort(l.preco)}
                  </div>
                </div>
              );
            })}
            <Link to="/org/lotes" className={styles.lotesLink}>
              Gerenciar lotes →
            </Link>
          </section>
        </div>

        <section className={styles.tableCard}>
          <div className={styles.tableHead}>
            <h3 className={styles.cardTitle}>Pedidos recentes</h3>
            <Link to="/org/financeiro" className={styles.tableLink}>
              Ver todos →
            </Link>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Participante</th>
                <th>Método</th>
                <th className={styles.numeric}>Valor</th>
                <th>Status</th>
                <th className={styles.numeric}>Há</th>
              </tr>
            </thead>
            <tbody>
              {PT_ORG_DATA.pedidosRecentes.map((p) => (
                <tr key={p.id}>
                  <td className="pt-mono">{p.id}</td>
                  <td>{p.participante}</td>
                  <td className={styles.dim}>{p.metodo}</td>
                  <td className={`${styles.numeric} ${styles.bold}`}>
                    {money(p.valor)}
                  </td>
                  <td>
                    <StatusPill status={p.status} />
                  </td>
                  <td className={`${styles.numeric} ${styles.dim}`}>
                    {p.minutos}min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
};
