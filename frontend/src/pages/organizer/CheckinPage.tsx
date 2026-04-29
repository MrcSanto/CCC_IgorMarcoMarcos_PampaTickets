import { useEffect, useState } from "react";

import { MetricCard } from "../../components/MetricCard";
import { PageHeader } from "../../components/PageHeader";
import { ProgressBar } from "../../components/ProgressBar";
import { StatusPill } from "../../components/StatusPill";

import shared from "./shared.module.css";
import styles from "./CheckinPage.module.css";

const STREAM = [
  { n: "Lucas Oliveira", s: "Inteira · 2º Lote", t: "agora", ok: true },
  { n: "Carla Fernandes", s: "VIP Camarote", t: "12s", ok: true },
  { n: "Pedro Reis", s: "Inteira · 2º Lote", t: "34s", ok: true },
  { n: "#PT-48127", s: "Já utilizado", t: "1m", ok: false },
  { n: "Ana Lima", s: "Meia · 1º Lote", t: "1m 12s", ok: true },
  { n: "João Martins", s: "Inteira · 2º Lote", t: "1m 48s", ok: true },
];

const GATES = [
  { n: "Portão A · Norte", c: 412, t: 600 },
  { n: "Portão B · Sul", c: 298, t: 600 },
  { n: "Portão VIP", c: 104, t: 200 },
  { n: "Imprensa", c: 33, t: 80 },
];

export const CheckinPage = () => {
  const [scanned, setScanned] = useState(847);

  useEffect(() => {
    const t = setInterval(() => setScanned((s) => s + 1), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <PageHeader
        breadcrumb="Festival de Inverno / Check-in ao vivo"
        title="Check-in ao vivo"
        actions={<StatusPill status="AO VIVO" pulse />}
      />

      <div className={shared.body}>
        <div className={styles.metrics}>
          <MetricCard
            label="Validados agora"
            value={scanned.toLocaleString("pt-BR")}
            sub="no portão"
            tone="ok"
          />
          <MetricCard
            label="Pendentes"
            value="995"
            sub="ainda chegando"
            tone="warn"
          />
          <MetricCard
            label="Capacidade"
            value="46%"
            sub="do total esperado"
          />
          <MetricCard
            label="Ritmo"
            value="127/min"
            sub="média 5 min"
            tone="ok"
          />
        </div>

        <div className={styles.charts}>
          <div className={shared.card}>
            <div className={shared.tableHead}>
              <h3 className={shared.cardTitle}>Stream de check-ins</h3>
              <span className={styles.streamMeta}>últimos 6</span>
            </div>
            <div>
              {STREAM.map((p, i) => (
                <div
                  key={i}
                  className={styles.streamRow}
                  style={i > 0 ? { borderTop: "1px solid var(--pt-border)" } : undefined}
                >
                  <div
                    className={styles.streamMark}
                    data-ok={p.ok ? "1" : undefined}
                  >
                    {p.ok ? "✓" : "✗"}
                  </div>
                  <div className={styles.streamInfo}>
                    <div className={styles.streamName}>{p.n}</div>
                    <div className={styles.streamSub}>{p.s}</div>
                  </div>
                  <div className={`${styles.streamTime} pt-mono`}>{p.t}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={shared.cardPadded}>
            <h3 className={shared.cardTitle}>Por portão</h3>
            <div className={styles.gateList}>
              {GATES.map((g) => (
                <div key={g.n} className={styles.gateRow}>
                  <div className={styles.gateHead}>
                    <span className={styles.gateName}>{g.n}</span>
                    <span className={styles.gateCount}>
                      {g.c}/{g.t}
                    </span>
                  </div>
                  <ProgressBar value={g.c / g.t} />
                </div>
              ))}
            </div>

            <div className={styles.scanner}>
              <div
                className={styles.scannerQr}
                aria-label="Placeholder de QR scanner"
              >
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={
                      (i * 5) % 3 === 0 || i % 7 === 0
                        ? styles.scannerOn
                        : styles.scannerOff
                    }
                  />
                ))}
              </div>
              <div className={styles.scannerInfo}>
                <div className={styles.scannerTitle}>Scanner mobile</div>
                <div className={styles.scannerSub}>
                  Aponte a câmera para validar
                </div>
                <button className={shared.btnPrimary} style={{ marginTop: 6 }}>
                  Abrir scanner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
