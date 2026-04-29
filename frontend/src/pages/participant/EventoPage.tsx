import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { obterEvento } from "../../api/eventos";
import type { EventoSample } from "../../data/sample";
import { dateFull, money } from "../../lib/format";

import styles from "./EventoPage.module.css";

export const EventoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ev, setEv] = useState<EventoSample | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});

  useEffect(() => {
    if (id) obterEvento(id).then(setEv);
  }, [id]);

  const totals = useMemo(() => {
    if (!ev) return { qty: 0, subtotal: 0 };
    let qty = 0;
    let subtotal = 0;
    ev.lotes.forEach((l, i) => {
      const n = selected[i] ?? 0;
      qty += n;
      subtotal += n * l.preco;
    });
    return { qty, subtotal };
  }, [ev, selected]);

  if (!ev) return null;

  const d = dateFull(ev.data);
  const taxa = totals.subtotal * 0.1;
  const total = totals.subtotal + taxa;

  const checkout = () => {
    sessionStorage.setItem(
      "pt_pending_order",
      JSON.stringify({
        eventoId: ev.id,
        itens: Object.entries(selected)
          .filter(([, n]) => n > 0)
          .map(([i, n]) => ({ loteIdx: +i, qty: n })),
        subtotal: totals.subtotal,
        taxa,
        total,
      }),
    );
    navigate(`/app/eventos/${ev.id}/checkout`);
  };

  return (
    <>
      <div className={styles.cover} style={{ background: ev.img }}>
        <div className={styles.coverOverlay} />
        <div className={styles.coverContent}>
          <div className={styles.dateBlock}>
            <div className={styles.dateMes}>{d.mes}</div>
            <div className={styles.dateDia}>{d.dia}</div>
            <div className={styles.dateSub}>
              {d.semana} · {d.hora}
            </div>
          </div>
          <div>
            <div className="pt-eyebrow">{ev.categoria}</div>
            <h1 className={styles.title}>{ev.nome}</h1>
            <div className={styles.location}>
              📍 {ev.local}, {ev.cidade}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <div>
          <h2 className={styles.heading}>Sobre o evento</h2>
          <p className={styles.lead}>{ev.descricao}</p>

          <h2 className={styles.heading} style={{ marginTop: 24 }}>
            Selecione seus ingressos
          </h2>
          <div className={styles.lotes}>
            {ev.lotes.map((l, i) => {
              const restantes = l.restantes;
              const esgotado = restantes === 0;
              const acabando = restantes > 0 && restantes / l.total < 0.1;
              const qty = selected[i] ?? 0;
              return (
                <div
                  key={i}
                  className={styles.lote}
                  data-selected={qty > 0 ? "1" : undefined}
                  data-esgotado={esgotado ? "1" : undefined}
                >
                  <div className={styles.loteInfo}>
                    <div className={styles.loteNome}>{l.nome}</div>
                    {acabando && !esgotado && (
                      <div className={styles.loteWarn}>
                        ⚠ Apenas {restantes} restantes
                      </div>
                    )}
                    {esgotado && (
                      <div className={styles.loteEsgotado}>Esgotado</div>
                    )}
                  </div>
                  <div className={styles.lotePreco}>{money(l.preco)}</div>
                  {!esgotado && (
                    <div className={styles.qtyControls}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() =>
                          setSelected((s) => ({
                            ...s,
                            [i]: Math.max(0, (s[i] ?? 0) - 1),
                          }))
                        }
                        aria-label="Remover"
                      >
                        −
                      </button>
                      <div className={styles.qtyValue}>{qty}</div>
                      <button
                        type="button"
                        className={styles.qtyBtnPrimary}
                        onClick={() =>
                          setSelected((s) => ({
                            ...s,
                            [i]: Math.min(restantes, (s[i] ?? 0) + 1),
                          }))
                        }
                        aria-label="Adicionar"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside>
          <div className={styles.sidebar}>
            <div className="pt-eyebrow">Resumo</div>
            <div className={styles.sidebarTitle}>{ev.nome}</div>
            <div className={styles.sidebarRow}>
              <span className={styles.sidebarLabel}>
                {totals.qty} ingresso{totals.qty !== 1 ? "s" : ""}
              </span>
              <span>{money(totals.subtotal)}</span>
            </div>
            <div className={styles.sidebarRow}>
              <span className={styles.sidebarLabel}>Taxa de serviço</span>
              <span>{money(taxa)}</span>
            </div>
            <div className={styles.sidebarTotal}>
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
            <button
              type="button"
              className={styles.cta}
              disabled={totals.qty === 0}
              onClick={checkout}
            >
              {totals.qty > 0
                ? "Continuar para pagamento →"
                : "Selecione ingressos"}
            </button>
            <div className={styles.secure}>
              🔒 Pagamento seguro · PIX, cartão ou boleto
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};
