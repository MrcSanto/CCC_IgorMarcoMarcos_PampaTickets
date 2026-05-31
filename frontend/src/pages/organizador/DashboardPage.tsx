import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  baixarRelatorio,
  gradientFor,
  listarEventosOrganizador,
  obterResumoRelatorio,
  type Evento,
  type RelatorioResumo,
} from "../../api/eventos";
import { MetricCard } from "../../components/MetricCard";
import { PageHeader } from "../../components/PageHeader";
import { StatusPill } from "../../components/StatusPill";
import {
  getActiveEventId,
  setActiveEventId,
} from "../../lib/active-event";
import { firstName, useCurrentUser } from "../../lib/auth-store";
import { extractErrorMessage } from "../../lib/errors";
import { dateLong, money } from "../../lib/format";

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
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(getActiveEventId());
  const [resumo, setResumo] = useState<RelatorioResumo | null>(null);
  const [resumoError, setResumoError] = useState<string | null>(null);
  const [baixando, setBaixando] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listarEventosOrganizador()
      .then((data) => {
        if (cancelled) return;
        setEventos(data);
        if (!getActiveEventId() && data.length > 0) {
          setActiveEventId(data[0].id);
          setActiveId(data[0].id);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(extractErrorMessage(err, "Falha ao carregar seus eventos."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeId) {
      setResumo(null);
      return;
    }
    let cancelled = false;
    setResumo(null);
    setResumoError(null);
    obterResumoRelatorio(activeId)
      .then((data) => {
        if (!cancelled) setResumo(data);
      })
      .catch((err) => {
        if (!cancelled)
          setResumoError(extractErrorMessage(err, "Falha ao carregar métricas."));
      });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const selecionar = (id: string) => {
    setActiveEventId(id);
    setActiveId(id);
    navigate("/organizador/evento");
  };

  const baixarPdf = async () => {
    if (!activeId) return;
    setBaixando(true);
    try {
      await baixarRelatorio(activeId);
    } catch (err) {
      setResumoError(extractErrorMessage(err, "Falha ao baixar o relatório."));
    } finally {
      setBaixando(false);
    }
  };

  const titulo = `${greeting()}, ${user ? firstName(user.nome) : "organizador"} 👋`;

  return (
    <>
      <PageHeader
        breadcrumb="Visão geral"
        title={titulo}
        actions={
          <button
            type="button"
            className={styles.cta}
            onClick={() => navigate("/organizador/eventos/novo")}
          >
            + Novo evento
          </button>
        }
      />

      <div className={styles.body}>
        <section className={styles.tableCard}>
          <div className={styles.tableHead}>
            <h3 className={styles.cardTitle}>Meus eventos</h3>
          </div>

          {error && <div className={styles.empty}>{error}</div>}
          {!error && eventos === null && (
            <div className={styles.empty}>Carregando seus eventos…</div>
          )}
          {!error && eventos?.length === 0 && (
            <div className={styles.empty}>
              Você ainda não criou nenhum evento.{" "}
              <button
                type="button"
                className={styles.inlineCta}
                onClick={() => navigate("/organizador/eventos/novo")}
              >
                Criar o primeiro
              </button>
              .
            </div>
          )}

          {eventos && eventos.length > 0 && (
            <div className={styles.eventGrid}>
              {eventos.map((ev) => {
                const ativo = ev.id === activeId;
                return (
                  <button
                    type="button"
                    key={ev.id}
                    className={styles.eventCard}
                    data-active={ativo ? "1" : undefined}
                    onClick={() => selecionar(ev.id)}
                  >
                    <div
                      className={styles.eventCover}
                      style={{ background: gradientFor(ev.id) }}
                    />
                    <div className={styles.eventBody}>
                      <div className={styles.eventTopRow}>
                        <div className={styles.eventTitle}>{ev.nome}</div>
                        <StatusPill status={ev.status} />
                      </div>
                      <div className={styles.eventMeta}>
                        📅 {dateLong(ev.data_inicio)}
                      </div>
                      <div className={styles.eventMeta}>📍 {ev.local}</div>
                      {ativo && (
                        <div className={styles.eventActiveTag}>Evento ativo</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.tableCard}>
          <div className={styles.tableHead}>
            <h3 className={styles.cardTitle}>Métricas e financeiro</h3>
            {resumo && (
              <button
                type="button"
                className={styles.inlineCta}
                onClick={baixarPdf}
                disabled={baixando}
              >
                {baixando ? "Gerando…" : "Baixar relatório PDF"}
              </button>
            )}
          </div>

          {!activeId && (
            <div className={styles.empty}>
              Selecione um evento acima para ver as métricas financeiras.
            </div>
          )}
          {activeId && resumoError && (
            <div className={styles.empty}>{resumoError}</div>
          )}
          {activeId && !resumoError && resumo === null && (
            <div className={styles.empty}>Carregando métricas…</div>
          )}
          {activeId && resumo && (
            <div className={styles.metrics}>
              <MetricCard
                label="Receita líquida"
                value={money(resumo.receita_liquida)}
                tone="ok"
                sub={`Bruta: ${money(resumo.receita_bruta)}`}
              />
              <MetricCard
                label="Descontos (cupons)"
                value={money(resumo.desconto_cupons)}
                sub={`Reembolsos: ${money(resumo.valor_reembolsado)}`}
              />
              <MetricCard
                label="Ingressos vendidos"
                value={resumo.total_ingressos.toLocaleString("pt-BR")}
                sub={`Check-ins: ${resumo.total_checkins.toLocaleString("pt-BR")}`}
              />
              <MetricCard
                label="Comparecimento"
                value={`${(resumo.taxa_comparecimento * 100).toFixed(0)}%`}
              />
            </div>
          )}
        </section>
      </div>
    </>
  );
};
