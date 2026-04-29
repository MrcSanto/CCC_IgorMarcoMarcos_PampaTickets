import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { obterEvento } from "../../api/eventos";
import type { EventoSample } from "../../data/sample";
import { useCurrentUser } from "../../lib/auth-store";
import { dateLong, formatCelular, formatCpfCnpj, money } from "../../lib/format";

import styles from "./CheckoutPage.module.css";

type Pending = {
  eventoId: string;
  itens: { loteIdx: number; qty: number }[];
  subtotal: number;
  taxa: number;
  total: number;
};

const METODOS = [
  { id: "PIX", l: "PIX", s: "Aprovação imediata" },
  { id: "CARTAO", l: "Cartão", s: "até 12x sem juros" },
  { id: "BOLETO", l: "Boleto", s: "1-3 dias úteis" },
] as const;

export const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [ev, setEv] = useState<EventoSample | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [metodo, setMetodo] = useState<(typeof METODOS)[number]["id"]>("PIX");

  useEffect(() => {
    if (id) obterEvento(id).then(setEv);
    const raw = sessionStorage.getItem("pt_pending_order");
    if (raw) setPending(JSON.parse(raw) as Pending);
  }, [id]);

  if (!ev || !pending) return null;

  const confirm = () => navigate(`/app/eventos/${ev.id}/ingressos`);

  const fields = [
    { l: "Nome completo", v: user?.nome ?? "" },
    { l: "CPF", v: user ? formatCpfCnpj(user.cpf_cnpj) : "" },
    { l: "E-mail", v: user?.email ?? "" },
    { l: "Celular", v: user ? formatCelular(user.celular) : "" },
  ];

  return (
    <div className={styles.page}>
      <Link to={`/app/eventos/${ev.id}`} className={styles.back}>
        ← Voltar
      </Link>
      <h1 className={styles.title}>Finalizar compra</h1>
      <div className={styles.subtitle}>
        {ev.nome} · {dateLong(ev.data)}
      </div>

      <div className={styles.layout}>
        <div className={styles.column}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>1 · Seus dados</h3>
            <div className={styles.fieldGrid}>
              {fields.map((f) => (
                <div key={f.l}>
                  <label className={styles.label}>{f.l}</label>
                  <input
                    className={styles.input}
                    defaultValue={f.v}
                    placeholder={user ? undefined : "Faça login para preencher"}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>2 · Forma de pagamento</h3>
            <div className={styles.metodos}>
              {METODOS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  className={styles.metodo}
                  data-active={metodo === m.id ? "1" : undefined}
                  onClick={() => setMetodo(m.id)}
                >
                  <div className={styles.metodoLabel}>{m.l}</div>
                  <div className={styles.metodoSub}>{m.s}</div>
                </button>
              ))}
            </div>
            {metodo === "PIX" && (
              <div className={styles.metodoHint}>
                Após confirmar, você receberá o QR Code do PIX. Pagamento
                confirmado em segundos.
              </div>
            )}
            {metodo === "CARTAO" && (
              <div className={styles.cardInputs}>
                <div className={styles.cardInputFull}>
                  <label className={styles.label}>Número do cartão</label>
                  <input className={styles.input} placeholder="0000 0000 0000 0000" />
                </div>
                <div className={styles.cardInputRow}>
                  <div>
                    <label className={styles.label}>Validade</label>
                    <input className={styles.input} placeholder="MM/AA" />
                  </div>
                  <div>
                    <label className={styles.label}>CVV</label>
                    <input className={styles.input} placeholder="000" />
                  </div>
                  <div>
                    <label className={styles.label}>Parcelas</label>
                    <select className={styles.input}>
                      <option>1x sem juros</option>
                      <option>3x sem juros</option>
                      <option>6x sem juros</option>
                      <option>12x sem juros</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {metodo === "BOLETO" && (
              <div className={styles.metodoHint}>
                O boleto será gerado e enviado para o seu e-mail. Compensação em
                até 3 dias úteis.
              </div>
            )}
          </section>
        </div>

        <aside>
          <div className={styles.summary}>
            <h3 className={styles.cardTitle}>Resumo do pedido</h3>
            {pending.itens.map((it, i) => {
              const lote = ev.lotes[it.loteIdx];
              if (!lote) return null;
              return (
                <div key={i} className={styles.summaryRow}>
                  <span>
                    {it.qty} × {lote.nome}
                  </span>
                  <span>{money(it.qty * lote.preco)}</span>
                </div>
              );
            })}
            <div className={`${styles.summaryRow} ${styles.summaryDim}`}>
              <span>Taxa de serviço</span>
              <span>{money(pending.taxa)}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>{money(pending.total)}</span>
            </div>
            <button type="button" className={styles.cta} onClick={confirm}>
              Confirmar pagamento
            </button>
            <div className={styles.secure}>
              🔒 Conexão segura · Asaas Gateway
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
