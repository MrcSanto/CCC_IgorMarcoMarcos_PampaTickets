// Mini auth store: usuário logado vive em localStorage e é exposto via hook.
// Mudanças são propagadas por um CustomEvent para que componentes em qualquer
// nível da árvore reajam sem precisar de Context Provider.

import { useEffect, useState } from "react";

import type { Usuario } from "../api/auth";

const USER_KEY = "pt_user";
const CHANGE_EVENT = "pt-auth-change";

const readStored = (): Usuario | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: Usuario | null) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

export const useCurrentUser = (): Usuario | null => {
  const [user, setUser] = useState<Usuario | null>(() => readStored());

  useEffect(() => {
    const sync = () => setUser(readStored());
    window.addEventListener(CHANGE_EVENT, sync);
    // Sincroniza com login/logout em outras abas via storage event nativo.
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
};

// Helpers utilizados em vários lugares.
export const initials = (nome: string): string => {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const firstName = (nome: string): string =>
  nome.trim().split(/\s+/)[0] ?? nome;
