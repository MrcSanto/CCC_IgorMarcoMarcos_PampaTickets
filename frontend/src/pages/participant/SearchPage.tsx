import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { listarEventos } from "../../api/eventos";
import {
  PT_CATEGORIES,
  type EventoSample,
} from "../../data/sample";
import { dateFull, moneyShort } from "../../lib/format";

import styles from "./SearchPage.module.css";

const CITIES = [
  "Todas",
  "Porto Alegre",
  "Gramado",
  "Caxias do Sul",
  "Pelotas",
  "Atlântida",
  "Esteio",
];

export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const [events, setEvents] = useState<EventoSample[]>([]);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [city, setCity] = useState("Todas");
  const [cat, setCat] = useState<string | null>(params.get("cat"));
  const [priceMin, setPriceMin] = useState(0);
  const [sort, setSort] = useState<"Data" | "Preço" | "Popularidade">("Data");

  useEffect(() => {
    listarEventos().then(setEvents);
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (cat) next.set("cat", cat);
    setParams(next, { replace: true });
  }, [q, cat, setParams]);

  const filtered = useMemo(() => {
    let list = events.filter((e) => {
      if (q && !e.nome.toLowerCase().includes(q.toLowerCase())) return false;
      if (city !== "Todas" && e.cidade !== city) return false;
      if (cat) {
        const found = PT_CATEGORIES.find((c) => c.id === cat);
        if (found && e.categoria !== found.label) return false;
      }
      if (e.precoMin < priceMin) return false;
      return true;
    });
    if (sort === "Preço") list = [...list].sort((a, b) => a.precoMin - b.precoMin);
    if (sort === "Popularidade")
      list = [...list].sort((a, b) => b.vendidos - a.vendidos);
    return list;
  }, [events, q, city, cat, priceMin, sort]);

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar evento, artista, local…"
          className={styles.searchInput}
        />
        <button className={styles.searchBtn}>Buscar</button>
      </div>

      <div className={styles.layout}>
        <aside className={styles.filters}>
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Cidade</div>
            <div className={styles.cityList}>
              {CITIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={styles.cityRow}
                  data-active={city === c ? "1" : undefined}
                  onClick={() => setCity(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Categoria</div>
            <div className={styles.chips}>
              {PT_CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={styles.chip}
                  data-active={cat === c.id ? "1" : undefined}
                  onClick={() => setCat(cat === c.id ? null : c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Preço mínimo</div>
            <input
              type="range"
              min={0}
              max={500}
              value={priceMin}
              onChange={(e) => setPriceMin(+e.target.value)}
              className={styles.range}
            />
            <div className={styles.rangeMeta}>
              <span>R$ 0</span>
              <span>R$ {priceMin}</span>
              <span>R$ 500+</span>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Quando</div>
            <div className={styles.whenGrid}>
              {["Hoje", "Amanhã", "Esta semana", "Este mês"].map((w) => (
                <button type="button" key={w} className={styles.whenChip}>
                  {w}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              setQ("");
              setCity("Todas");
              setCat(null);
              setPriceMin(0);
            }}
          >
            Limpar filtros
          </button>
        </aside>

        <section>
          <div className={styles.resultsHead}>
            <div className={styles.resultsCount}>
              <strong>{filtered.length} eventos</strong>
              {city !== "Todas" && ` em ${city}`}
            </div>
            <div className={styles.sortGroup}>
              <span className={styles.sortLabel}>Ordenar por:</span>
              {(["Data", "Preço", "Popularidade"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  className={styles.sortBtn}
                  data-active={sort === s ? "1" : undefined}
                  onClick={() => setSort(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.grid}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                Nenhum evento encontrado com esses filtros.
              </div>
            ) : (
              filtered.map((e) => <ResultCard key={e.id} ev={e} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const ResultCard = ({ ev }: { ev: EventoSample }) => {
  const d = dateFull(ev.data);
  return (
    <Link to={`/app/eventos/${ev.id}`} className={styles.resultCard}>
      <div className={styles.resultCover} style={{ background: ev.img }}>
        <div className={styles.resultDate}>
          <div className={styles.resultMes}>{d.mes}</div>
          <div className={styles.resultDia}>{d.dia}</div>
        </div>
      </div>
      <div className={styles.resultBody}>
        <div className="pt-eyebrow">{ev.categoria}</div>
        <div className={styles.resultTitle}>{ev.nome}</div>
        <div className={styles.resultMeta}>
          <span>📍 {ev.cidade}</span>
          <span>
            {d.semana} · {d.hora}
          </span>
        </div>
        <div className={styles.resultBottom}>
          <div className={styles.resultPrice}>
            {ev.precoMin === 0 ? "Grátis" : `a partir de ${moneyShort(ev.precoMin)}`}
          </div>
          {ev.urgente && <div className={styles.resultUrgent}>⚠ ÚLTIMOS</div>}
        </div>
      </div>
    </Link>
  );
};
