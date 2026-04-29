import { Link } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { ProgressBar } from "../../components/ProgressBar";
import { StatusPill } from "../../components/StatusPill";
import { PT_EVENTS } from "../../data/sample";
import { dateLong, money } from "../../lib/format";

import shared from "./shared.module.css";
import styles from "./OrgEventoPage.module.css";

const TASKS = [
  { l: "Aprovar 12 cortesias pendentes", tone: "warn" as const, i: "⚠" },
  { l: "1º lote esgotado — abrir 3º?", tone: "danger" as const, i: "!" },
  { l: "Configurar webhook de pagamento", tone: "ok" as const, i: "○" },
];

export const OrgEventoPage = () => {
  const ev = PT_EVENTS[0];
  return (
    <>
      <PageHeader
        breadcrumb={`Eventos / ${ev.nome}`}
        title={ev.nome}
        actions={
          <>
            <StatusPill status="PUBLICADO" />
            <button className={shared.btnSecondary}>Pré-visualizar</button>
            <button className={shared.btnDark}>Editar evento</button>
          </>
        }
      />

      <div className={shared.body}>
        <div className={styles.layout}>
          <div className={shared.card}>
            <div className={styles.cover} style={{ background: ev.img }} />
            <div className={styles.coverInfo}>
              <div className={styles.metaGrid}>
                <div>
                  <div className={shared.eyebrow}>Início</div>
                  <div className={styles.metaValue}>{dateLong(ev.data)}</div>
                </div>
                <div>
                  <div className={shared.eyebrow}>Encerramento</div>
                  <div className={styles.metaValue}>
                    {ev.dataFim ? dateLong(ev.dataFim) : "—"}
                  </div>
                </div>
                <div>
                  <div className={shared.eyebrow}>Local</div>
                  <div className={styles.metaValue}>{ev.local}</div>
                </div>
              </div>
              <div className={styles.descBlock}>
                <div className={shared.eyebrow}>Descrição</div>
                <p className={styles.desc}>{ev.descricao}</p>
              </div>
            </div>
          </div>

          <div className={styles.aside}>
            <div className={shared.cardPadded}>
              <div className={shared.eyebrow}>Faturamento</div>
              <div className={styles.bigNum}>{money(487320)}</div>
              <div className={styles.delta}>↑ 12.4% vs semana anterior</div>
              <div className={styles.divider} />
              <div className={styles.metaRow}>
                <span className={styles.dim}>Vendidos</span>
                <span className={styles.bold}>1.842 / 2.500</span>
              </div>
              <ProgressBar value={0.74} height={8} />
              <div className={styles.smallSub}>74% da capacidade preenchida</div>
            </div>

            <div className={shared.cardPadded}>
              <div className={styles.tasksHead}>
                <h3 className={shared.cardTitle}>Próximas tarefas</h3>
                <span className={styles.tasksMeta}>3 itens</span>
              </div>
              {TASKS.map((t, i) => (
                <div
                  key={i}
                  className={styles.taskRow}
                  style={i > 0 ? { borderTop: "1px solid var(--pt-border)" } : undefined}
                >
                  <div className={styles.taskIcon} data-tone={t.tone}>
                    {t.i}
                  </div>
                  <div className={styles.taskLabel}>{t.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/org/lotes" className={shared.btnPrimary}>
            Gerenciar lotes & vendas →
          </Link>
          <Link to="/org/checkin" className={shared.btnSecondary}>
            Iniciar check-in →
          </Link>
        </div>
      </div>
    </>
  );
};
