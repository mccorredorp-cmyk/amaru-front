import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../api/amaru.js';

const AppContext = createContext(null);

/**
 * Estado global de la app: sesión, catálogos, favoritos, toast y modales.
 */
export function AppProvider({ children }) {
  // ---------- Sesión ----------
  const [usuario, setUsuario] = useState(null);
  const [sesionLista, setSesionLista] = useState(false);

  useEffect(() => {
    api
      .sesionActual()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setSesionLista(true));
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await api.iniciarSesion(email, password);
    setUsuario(u);
    return u;
  }, []);

  const registro = useCallback(async (nombre, email, password) => {
    const u = await api.registrarse(nombre, email, password);
    setUsuario(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api.cerrarSesion().catch(() => {});
    setUsuario(null);
  }, []);

  // ---------- Catálogos ----------
  const [catalogos, setCatalogos] = useState({ departamentos: [], tipos: [], listo: false, error: null });

  const cargarCatalogos = useCallback(() => {
    setCatalogos((c) => ({ ...c, error: null }));
    Promise.all([api.listarDepartamentos(), api.listarTipos()])
      .then(([departamentos, tipos]) => setCatalogos({ departamentos, tipos, listo: true, error: null }))
      .catch((error) => setCatalogos((c) => ({ ...c, listo: true, error })));
  }, []);

  useEffect(cargarCatalogos, [cargarCatalogos]);

  // ---------- Favoritos (solo en este navegador) ----------
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('amaru:favoritos') ?? '[]'));
    } catch {
      return new Set();
    }
  });

  const alternarFavorito = useCallback((id) => {
    let agregado = false;
    setFavoritos((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else {
        nuevo.add(id);
        agregado = true;
      }
      try {
        localStorage.setItem('amaru:favoritos', JSON.stringify([...nuevo]));
      } catch {
        /* almacenamiento bloqueado: los favoritos viven solo en memoria */
      }
      return nuevo;
    });
    return agregado;
  }, []);

  // ---------- Toast ----------
  const [toast, setToast] = useState({ texto: '', visible: false });
  const timer = useRef();
  const mostrarToast = useCallback((texto) => {
    setToast({ texto, visible: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3200);
  }, []);

  // ---------- Modales ----------
  // { tipo: 'auth' | 'publicar' | 'detalle', datos }
  const [modal, setModal] = useState(null);
  const abrirModal = useCallback((tipo, datos = null) => setModal({ tipo, datos }), []);
  const cerrarModal = useCallback(() => setModal(null), []);

  const valor = useMemo(
    () => ({
      usuario,
      sesionLista,
      login,
      registro,
      logout,
      catalogos,
      cargarCatalogos,
      favoritos,
      alternarFavorito,
      toast,
      mostrarToast,
      modal,
      abrirModal,
      cerrarModal,
    }),
    [usuario, sesionLista, login, registro, logout, catalogos, cargarCatalogos, favoritos, alternarFavorito, toast, mostrarToast, modal, abrirModal, cerrarModal],
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
