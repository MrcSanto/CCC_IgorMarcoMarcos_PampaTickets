import { useState } from "react";
import { Link } from "react-router-dom";

import { baixarRelatorio } from "../../api/eventos";
import { PageHeader } from "../../components/PageHeader";
import { useActiveEvent } from "../../lib/active-event";
import { extractErrorMessage } from "../../lib/errors";

import shared from "./shared.module.css";

export const FinancePage = () => {
  const { evento, loading } = useActiveEvent();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!evento) return;
    setBusy(true);
    setError(null);
    try {
      await baixarRelatorio(evento.id);
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao gerar o relatório."));
    } finally {
      setBusy(false);
    }
  };

  if (loading && !evento) {
    return (
      <>
        <PageHeader breadcrumb="Painel / Financeiro" title="Financeiro" />
        <div className={shared.body}>
          <div className={shared.cardPadded}>Carregando…</div>
        </div>
      </>
    );
  }

  if (!evento) {
    return (
      <>
        <PageHeader breadcrumb="Painel / Financeiro" title="Financeiro" />
        <div className={shared.body}>
          <div className={shared.cardPadded}>
            <h3 className={shared.cardTitle}>Nenhum evento selecionado</h3>
            <p style={{ marginTop: 8, color: "var(--pt-org-text-dim)" }}>
              Volte para o painel e escolha um evento para gerar o relatório.
            </p>
            <Link
              to="/organizador"
              className={shared.btnSecondary}
              style={{ marginTop: 16, display: "inline-block" }}
            >
              ← Ir para o painel
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader breadcrumb="Painel / Financeiro" title="Financeiro" />

      <div className={shared.body}>
        {error && (
          <div
            className={shared.cardPadded}
            style={{ borderColor: "#c8102e", color: "#c8102e", marginBottom: 16 }}
          >
            ⚠ {error}
          </div>
        )}

        <div className={shared.cardPadded}>
          <div className={shared.eyebrow}>Evento</div>
          <h3 className={shared.cardTitle} style={{ marginTop: 4 }}>
            {evento.nome}
          </h3>

          <p style={{ marginTop: 12, color: "var(--pt-org-text-dim)", lineHeight: 1.6 }}>
            Gere o relatório financeiro completo deste evento em PDF. Ele inclui
            receita bruta, descontos de cupons, cortesias, reembolsos, receita
            líquida e taxa de comparecimento por lote.
          </p>

          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              className={shared.btnPrimary}
              onClick={handleDownload}
              disabled={busy}
            >
              {busy ? "Gerando…" : "Baixar relatório PDF"}
            </button>
            <Link to="/organizador/evento" className={shared.btnSecondary}>
              ← Voltar para o evento
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
