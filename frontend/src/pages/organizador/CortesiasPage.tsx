import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  cancelarCortesia,
  emitirCortesia,
  listarCortesias,
  type Cortesia,
  type CortesiaCreate,
} from "../../api/cortesias";
import { listarLotesOrganizador, type Lote } from "../../api/lotes";
import { PageHeader } from "../../components/PageHeader";
import { StatusPill } from "../../components/StatusPill";
import { useActiveEvent } from "../../lib/active-event";
import { extractErrorMessage } from "../../lib/errors";
import { dateLong } from "../../lib/format";

import shared from "./shared.module.css";
import styles from "./orgForms.module.css";

export const CortesiasPage = () => {
  const { evento } = useActiveEvent();
  const [cortesias, setCortesias] = useState<Cortesia[] | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [loteId, setLoteId] = useState("");
  const [email, setEmail] = useState("");
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!evento) return;
    let cancelled = false;
    Promise.all([
      listarCortesias(evento.id),
      listarLotesOrganizador(evento.id),
    ])
      .then(([cs, ls]) => {
        if (cancelled) return;
        setCortesias(cs);
        setLotes(ls);
      })
      .catch((err) => {
        if (!cancelled)
          setError(extractErrorMessage(err, "Falha ao carregar cortesias."));
      });
    return () => {
      cancelled = true;
    };
  }, [evento]);

  const cancelar = async (cortesia: Cortesia) => {
    if (!confirm(`Cancelar a cortesia de "${cortesia.beneficiado_nome}"?`)) return;
    try {
      await cancelarCortesia(cortesia.id);
      setCortesias((prev) =>
        prev ? prev.filter((c) => c.id !== cortesia.id) : prev,
      );
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao cancelar cortesia."));
    }
  };

  const emitirNova = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evento) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const payload: CortesiaCreate = {
        lote_id: loteId,
        email_beneficiado: email,
        motivo: motivo || null,
      };
      const nova = await emitirCortesia(evento.id, payload);
      setCortesias((prev) => (prev ? [nova, ...prev] : [nova]));
      setLoteId("");
      setEmail("");
      setMotivo("");
      setShowForm(false);
    } catch (err) {
      setFormError(extractErrorMessage(err, "Falha ao emitir cortesia."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!evento) {
    return (
      <div className={shared.body}>
        <div className={shared.cardPadded}>
          <h3 className={shared.cardTitle}>Nenhum evento selecionado</h3>
          <p style={{ marginTop: 8, color: "var(--pt-org-text-dim)" }}>
            Volte para o painel e escolha um evento para emitir cortesias.
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
        breadcrumb={`${evento.nome} / Cortesias`}
        title="Cortesias"
        actions={
          <button
            className={showForm ? shared.btnSecondary : shared.btnPrimary}
            onClick={() => {
              setShowForm((v) => !v);
              setFormError(null);
            }}
            disabled={!showForm && lotes.length === 0}
            title={
              lotes.length === 0
                ? "Crie ao menos um lote antes de emitir cortesias"
                : undefined
            }
          >
            {showForm ? "Cancelar" : "+ Emitir cortesia"}
          </button>
        }
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

        {showForm && (
          <div className={shared.cardPadded}>
            <h3 className={shared.cardTitle}>Nova cortesia</h3>
            <p style={{ marginTop: 6, marginBottom: 4 }} className={styles.dim}>
              O e-mail informado precisa pertencer a um participante já cadastrado.
            </p>
            <form className={styles.form} onSubmit={emitirNova}>
              <div className={styles.row}>
                <Field label="Lote *">
                  <select
                    className={styles.input}
                    value={loteId}
                    onChange={(e) => setLoteId(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecione um lote
                    </option>
                    {lotes.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nome}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="E-mail do beneficiado *">
                  <input
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="participante@email.com"
                    required
                  />
                </Field>
              </div>

              <Field label="Motivo (opcional)">
                <input
                  className={styles.input}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Patrocinador da edição 2026"
                  maxLength={500}
                />
              </Field>

              {formError && <div className={styles.formError}>⚠ {formError}</div>}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={shared.btnSecondary}
                  onClick={() => {
                    setShowForm(false);
                    setFormError(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={shared.btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? "Emitindo…" : "Emitir cortesia"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={shared.card}>
          {cortesias === null ? (
            <div className={styles.empty}>Carregando cortesias…</div>
          ) : cortesias.length === 0 ? (
            <div className={styles.empty}>Nenhuma cortesia emitida ainda.</div>
          ) : (
            <table className={shared.table}>
              <thead>
                <tr>
                  <th>Beneficiado</th>
                  <th>Lote</th>
                  <th>Emitida em</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cortesias.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className={styles.bold}>{c.beneficiado_nome}</div>
                      <div className={styles.dim}>{c.beneficiado_email}</div>
                    </td>
                    <td>
                      <span className={styles.tipo}>{c.lote_nome}</span>
                    </td>
                    <td className={styles.dim}>{dateLong(c.emitida_em)}</td>
                    <td>
                      <StatusPill
                        status={c.ingresso_id ? "ATIVO" : "PENDENTE"}
                      />
                    </td>
                    <td className={styles.numeric}>
                      <button
                        className={shared.btnSecondary}
                        onClick={() => cancelar(c)}
                      >
                        Cancelar
                      </button>
                    </td>
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

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className={styles.field}>
    <div className={styles.fieldLabel}>{label}</div>
    {children}
  </div>
);
