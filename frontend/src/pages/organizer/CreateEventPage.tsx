import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { PT_EVENTS } from "../../data/sample";

import shared from "./shared.module.css";
import styles from "./CreateEventPage.module.css";

const STEPS = ["Informações", "Local & data", "Lotes & ingressos", "Publicação"];

const REVIEW_SECTIONS = [
  {
    l: "Informações",
    items: [
      ["Nome", "Festival de Inverno de Gramado"],
      ["Categoria", "Festival · Livre"],
      ["Descrição", "142 caracteres"],
      ["Capa", "Enviada ✓"],
    ],
  },
  {
    l: "Local & data",
    items: [
      ["Início", "18/jul/2026 · 20:00"],
      ["Local", "Centro de Eventos Serra Park"],
      ["Endereço", "Gramado, RS · 95670-000"],
    ],
  },
  {
    l: "Lotes & ingressos",
    items: [
      ["Total de lotes", "4"],
      ["Capacidade total", "1.280 ingressos"],
      ["Faixa de preço", "R$ 140 — R$ 480"],
    ],
  },
];

const SAMPLE_LOTES = [
  { n: "1º lote · Inteira", t: "INTEIRA", p: 280, q: 500 },
  { n: "1º lote · Meia", t: "MEIA", p: 140, q: 200 },
  { n: "2º lote · Inteira", t: "INTEIRA", p: 380, q: 500 },
  { n: "VIP Camarote", t: "PROMOCIONAL", p: 480, q: 80 },
];

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const next = () => {
    if (step < 4) setStep(step + 1);
    else navigate("/org/evento");
  };

  return (
    <>
      <PageHeader
        breadcrumb="Eventos / Novo evento"
        title="Criar evento"
        actions={
          <>
            <button className={shared.btnSecondary} onClick={() => navigate("/org")}>
              Cancelar
            </button>
            <button className={shared.btnSecondary}>Salvar rascunho</button>
          </>
        }
      />

      <div className={shared.body}>
        <div className={`${shared.cardPadded} ${styles.stepper}`}>
          {STEPS.map((s, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={s} className={styles.stepGroup}>
                <button
                  type="button"
                  className={styles.step}
                  onClick={() => setStep(n)}
                >
                  <div
                    className={styles.stepCircle}
                    data-active={active ? "1" : undefined}
                    data-done={done ? "1" : undefined}
                  >
                    {done ? "✓" : n}
                  </div>
                  <div className={styles.stepText}>
                    <div className={styles.stepEyebrow}>Etapa {n}</div>
                    <div
                      className={styles.stepLabel}
                      data-active={active || done ? "1" : undefined}
                    >
                      {s}
                    </div>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={styles.stepLine}
                    data-done={done ? "1" : undefined}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.layout}>
          <div className={shared.cardPadded}>
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 onEdit={setStep} />}

            <div className={styles.formActions}>
              <button
                type="button"
                className={shared.btnSecondary}
                onClick={() =>
                  step > 1 ? setStep(step - 1) : navigate("/org")
                }
              >
                ← Voltar
              </button>
              <button type="button" className={shared.btnPrimary} onClick={next}>
                {step < 4 ? "Continuar →" : "🚀 Publicar evento"}
              </button>
            </div>
          </div>

          <aside>
            <div className={styles.preview}>
              <div className={styles.previewHead}>👁 Preview ao vivo</div>
              <div
                className={styles.previewCover}
                style={{ background: PT_EVENTS[0].img }}
              />
              <div className={styles.previewBody}>
                <div className="pt-eyebrow">FESTIVAL · GRAMADO</div>
                <div className={styles.previewTitle}>
                  Festival de Inverno de Gramado
                </div>
                <div className={styles.previewMeta}>📅 18 jul · 20:00</div>
                <div className={styles.previewMeta}>📍 Serra Park</div>
                <div className={styles.previewPrice}>a partir de R$ 140</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

const Step1 = () => (
  <>
    <h2 className={styles.heading}>Conte sobre o evento</h2>
    <p className={styles.lead}>
      Comece com o essencial — você pode editar depois.
    </p>
    <Field label="Nome do evento *">
      <input
        className={styles.input}
        defaultValue="Festival de Inverno de Gramado"
      />
    </Field>
    <div className={styles.row}>
      <Field label="Categoria *">
        <select className={styles.input}>
          <option>Festival</option>
          <option>Show</option>
          <option>Esporte</option>
          <option>Cultural</option>
          <option>Comédia</option>
        </select>
      </Field>
      <Field label="Classificação etária">
        <select className={styles.input}>
          <option>Livre</option>
          <option>10+</option>
          <option>14+</option>
          <option>18+</option>
        </select>
      </Field>
    </div>
    <Field label="Descrição *">
      <textarea
        className={styles.textarea}
        rows={4}
        defaultValue="Três dias de música, gastronomia e cinema nas montanhas gaúchas. Atrações nacionais e internacionais."
      />
      <div className={styles.helper}>Mínimo 100 caracteres · 142/2000</div>
    </Field>
    <Field label="Imagem de capa *">
      <div className={styles.dropzone}>
        <div className={styles.dropIcon}>📷</div>
        <div className={styles.dropTitle}>
          Arraste uma imagem ou clique para enviar
        </div>
        <div className={styles.dropSub}>
          JPG, PNG · até 5MB · recomendado 1200×630px
        </div>
      </div>
    </Field>
  </>
);

const Step2 = () => (
  <>
    <h2 className={styles.heading}>Onde e quando vai acontecer?</h2>
    <p className={styles.lead}>Datas, horário e local do evento.</p>
    <div className={styles.row}>
      <Field label="Início *">
        <input
          type="datetime-local"
          className={styles.input}
          defaultValue="2026-07-18T20:00"
        />
      </Field>
      <Field label="Encerramento *">
        <input
          type="datetime-local"
          className={styles.input}
          defaultValue="2026-07-20T23:59"
        />
      </Field>
    </div>
    <Field label="Nome do local *">
      <input
        className={styles.input}
        defaultValue="Centro de Eventos Serra Park"
      />
    </Field>
    <div className={styles.row3}>
      <Field label="CEP">
        <input className={styles.input} defaultValue="95670-000" />
      </Field>
      <Field label="Cidade">
        <input className={styles.input} defaultValue="Gramado" />
      </Field>
      <Field label="Estado">
        <input className={styles.input} defaultValue="RS" />
      </Field>
    </div>
  </>
);

const Step3 = () => (
  <>
    <h2 className={styles.heading}>Configure os lotes</h2>
    <p className={styles.lead}>
      Você pode adicionar quantos lotes precisar — eles podem ser ativados em
      datas diferentes.
    </p>
    {SAMPLE_LOTES.map((l, i) => (
      <div key={i} className={styles.loteCard}>
        <Field label="Nome">
          <input className={styles.smallInput} defaultValue={l.n} />
        </Field>
        <Field label="Tipo">
          <select className={styles.smallInput} defaultValue={l.t}>
            <option>INTEIRA</option>
            <option>MEIA</option>
            <option>PROMOCIONAL</option>
          </select>
        </Field>
        <Field label="Preço">
          <input
            className={styles.smallInput}
            defaultValue={"R$ " + l.p.toFixed(2)}
          />
        </Field>
        <Field label="Qtd">
          <input className={styles.smallInput} defaultValue={l.q} />
        </Field>
        <button type="button" className={styles.menuBtn}>
          ⋯
        </button>
      </div>
    ))}
    <button type="button" className={styles.dashedBtn}>
      + Adicionar lote
    </button>
    <div className={styles.tip}>
      <span>💡</span>
      <p>
        <strong>Dica:</strong> A taxa da plataforma é de 8% por ingresso vendido
        + R$ 1,50 por transação. Você pode repassar a taxa ao comprador nas
        configurações avançadas.
      </p>
    </div>
  </>
);

const Step4 = ({ onEdit }: { onEdit: (n: number) => void }) => (
  <>
    <h2 className={styles.heading}>Pronto para publicar?</h2>
    <p className={styles.lead}>
      Revise as informações abaixo. Tudo pode ser editado depois.
    </p>
    {REVIEW_SECTIONS.map((s, i) => (
      <div
        key={s.l}
        className={styles.reviewSection}
        style={i > 0 ? { borderTop: "1px solid var(--pt-border)" } : undefined}
      >
        <div className={styles.reviewHead}>
          <div className={styles.reviewTitle}>{s.l}</div>
          <button
            type="button"
            className={styles.reviewEdit}
            onClick={() => onEdit(i + 1)}
          >
            Editar
          </button>
        </div>
        {s.items.map((kv) => (
          <div key={kv[0]} className={styles.reviewRow}>
            <span className={styles.reviewLabel}>{kv[0]}</span>
            <span className={styles.reviewValue}>{kv[1]}</span>
          </div>
        ))}
      </div>
    ))}
    <label className={styles.terms}>
      <input type="checkbox" defaultChecked />
      Concordo com os <a className={styles.termsLink}>termos de uso</a> e{" "}
      <a className={styles.termsLink}>política de privacidade</a>
    </label>
  </>
);

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
