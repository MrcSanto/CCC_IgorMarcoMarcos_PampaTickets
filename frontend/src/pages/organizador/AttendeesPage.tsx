import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  listarIngressosDoEvento,
  type IngressoOrganizador,
} from "../../api/ingressos";
import { PageHeader } from "../../components/PageHeader";
import { StatusPill } from "../../components/StatusPill";
import { useActiveEvent } from "../../lib/active-event";
import { extractErrorMessage } from "../../lib/errors";
import { dateLong } from "../../lib/format";

import shared from "./shared.module.css";
import styles from "./orgForms.module.css";

export const AttendeesPage = () => {
  const { evento } = useActiveEvent();
  const [ingressos, setIngressos] = useState<IngressoOrganizador[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!evento) return;
    let cancelled = false;
    listarIngressosDoEvento(evento.id)
      .then((data) => {
        if (!cancelled) setIngressos(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(extractErrorMessage(err, "Falha ao carregar participantes."));
      });
    return () => {
      cancelled = true;
    };
  }, [evento]);

  const filtrados = useMemo(() => {
    if (!ingressos) return null;
    const termo = busca.trim().toLowerCase();
    if (!termo) return ingressos;
    return ingressos.filter(
      (i) =>
        i.participante_nome.toLowerCase().includes(termo) ||
        i.participante_email.toLowerCase().includes(termo),
    );
  }, [ingressos, busca]);

  if (!evento) {
    return (
      <div className={shared.body}>
        <div className={shared.cardPadded}>
          <h3 className={shared.cardTitle}>Nenhum evento selecionado</h3>
          <p style={{ marginTop: 8, color: "var(--pt-org-text-dim)" }}>
            Volte para o painel e escolha um evento para ver os participantes.
          </p>
          <Link
            to="/organizador"
            className={shared.btnPrimary}
            style={{ marginTop: 16, display: "inline-block" }}
          >
            Ir para o painel →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb={`${evento.nome} / Participantes`}
        title="Participantes"
      />

      <div className={shared.body}>
        {error && (
          <div
            className={shared.cardPadded}
            style={{ borderColor: "#c8102e", color: "#c8102e", marginBottom: 16 }}
          >
            ⚠ {error}
          </div>
        )}

        {ingressos !== null && ingressos.length > 0 && (
          <input
            className={`${styles.input} ${styles.searchInput}`}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
          />
        )}

        <div className={shared.card}>
          {filtrados === null ? (
            <div className={styles.empty}>Carregando participantes…</div>
          ) : ingressos !== null && ingressos.length === 0 ? (
            <div className={styles.empty}>
              Nenhum ingresso vendido para este evento ainda.
            </div>
          ) : filtrados.length === 0 ? (
            <div className={styles.empty}>
              Nenhum participante encontrado para "{busca}".
            </div>
          ) : (
            <table className={shared.table}>
              <thead>
                <tr>
                  <th>Participante</th>
                  <th>Lote</th>
                  <th>Status</th>
                  <th>Emitido em</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div className={styles.bold}>{i.participante_nome}</div>
                      <div className={styles.dim}>{i.participante_email}</div>
                    </td>
                    <td>
                      <span className={styles.tipo}>{i.lote_nome}</span>
                    </td>
                    <td>
                      <StatusPill status={i.status} />
                    </td>
                    <td className={styles.dim}>{dateLong(i.emitido_em)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};
