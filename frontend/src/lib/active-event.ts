// Hidratação do evento do organizador a partir do id da rota (/organizador/eventos/:id).
// A fonte da verdade é a URL — não há mais "evento ativo" em localStorage.

import { useEffect, useState } from "react";

import { obterEventoOrganizador, type Evento } from "../api/eventos";

export const useEvento = (id: string | null | undefined) => {
  const [evento, setEvento] = useState<Evento | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      setEvento(null);
      setError(false);
      return;
    }
    let cancelled = false;
    setError(false);
    obterEventoOrganizador(id)
      .then((data) => {
        if (!cancelled) setEvento(data);
      })
      .catch(() => {
        if (!cancelled) {
          setEvento(null);
          setError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // `loading` é derivado: temos id mas ainda não temos o evento certo hidratado e não falhou.
  return {
    evento: id ? evento : null,
    loading: id != null && evento?.id !== id && !error,
    error,
  };
};
