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

  // ---------- Favoritos (uno por cuenta) ----------
  // La API todavía no tiene endpoint de favoritos, así que cada cuenta guarda
  // su lista en este navegador bajo su propia clave: amaru:favoritos:<idUsuario>.
  // Se guarda una copia resumida de cada inmueble para pintar la sección sin
  // pedirle nada más a la API (cuida el rate limit).
  const [favoritosLista, setFavoritosLista] = useState([]);
  const pendiente = useRef(null); // favorito tocado sin sesión: se guarda al ingresar
  const listaRef = useRef(favoritosLista);
  listaRef.current = favoritosLista;

  const guardarLista = useCallback((idUsuario, lista) => {
    setFavoritosLista(lista);
    listaRef.current = lista;
    try {
      localStorage.setItem(claveFavoritos(idUsuario), JSON.stringify(lista));
    } catch {
      /* almacenamiento bloqueado: la lista vive solo en memoria */
    }
  }, []);

  // Al cambiar de cuenta se carga su lista; sin sesión no hay favoritos.
  useEffect(() => {
    try {
      localStorage.removeItem('amaru:favoritos'); // clave vieja, compartida por todos
    } catch {
      /* nada */
    }
    if (!usuario) {
      setFavoritosLista([]);
      return;
    }
    let lista = [];
    try {
      const guardado = JSON.parse(localStorage.getItem(claveFavoritos(usuario.id)) ?? '[]');
      if (Array.isArray(guardado)) lista = guardado.filter((f) => f && typeof f.id === 'number');
    } catch {
      /* lista dañada: se empieza vacía */
    }
    if (pendiente.current && !lista.some((f) => f.id === pendiente.current.id)) {
      lista = [{ ...pendiente.current, guardado_en: Date.now() }, ...lista];
      pendiente.current = null;
      guardarLista(usuario.id, lista);
      setToast({ texto: 'Guardado en tus favoritos', visible: true });
      return;
    }
    pendiente.current = null;
    setFavoritosLista(lista);
  }, [usuario?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const favoritos = useMemo(() => new Set(favoritosLista.map((f) => f.id)), [favoritosLista]);

  /** Agrega o quita un inmueble. Sin sesión abre el ingreso y lo guarda después. */
  const alternarFavorito = useCallback(
    (inmueble) => {
      if (!usuario) {
        pendiente.current = resumenFavorito(inmueble);
        mostrarToast('Ingresa a tu cuenta para guardar favoritos');
        abrirModal('auth');
        return;
      }
      const actual = listaRef.current;
      const existe = actual.some((f) => f.id === inmueble.id);
      const lista = existe
        ? actual.filter((f) => f.id !== inmueble.id)
        : [{ ...resumenFavorito(inmueble), guardado_en: Date.now() }, ...actual];
      guardarLista(usuario.id, lista);
      mostrarToast(existe ? 'Quitado de favoritos' : 'Guardado en favoritos');
    },
    [usuario, guardarLista], // eslint-disable-line react-hooks/exhaustive-deps
  );

  /** Refresca la copia guardada con datos nuevos del inmueble (p. ej. desde el detalle). */
  const actualizarFavorito = useCallback(
    (inmueble) => {
      if (!usuario) return;
      const actual = listaRef.current;
      const i = actual.findIndex((f) => f.id === inmueble.id);
      if (i < 0) return;
      const lista = [...actual];
      lista[i] = { ...resumenFavorito(inmueble), guardado_en: actual[i].guardado_en };
      guardarLista(usuario.id, lista);
    },
    [usuario, guardarLista],
  );

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
      favoritosLista,
      alternarFavorito,
      actualizarFavorito,
      toast,
      mostrarToast,
      modal,
      abrirModal,
      cerrarModal,
    }),
    [usuario, sesionLista, login, registro, logout, catalogos, cargarCatalogos, favoritos, favoritosLista, alternarFavorito, actualizarFavorito, toast, mostrarToast, modal, abrirModal, cerrarModal],
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

const claveFavoritos = (idUsuario) => `amaru:favoritos:${idUsuario}`;

/** Copia mínima de un inmueble (del listado o del detalle) para la tarjeta. */
function resumenFavorito(i) {
  let imagen = i.imagen_principal ?? null;
  if (!imagen && Array.isArray(i.imagenes) && i.imagenes.length) {
    const im = i.imagenes.find((x) => x.es_principal) ?? i.imagenes[0];
    imagen = { miniatura_url: im.miniatura_url ?? im.url };
  }
  return {
    id: i.id,
    nombre: i.nombre,
    tipo: i.tipo,
    estado: i.estado,
    ciudad: i.ciudad ?? null,
    departamento: i.departamento,
    estrato: i.estrato ?? null,
    area_construida: i.area_construida ?? null,
    mas_admon: i.mas_admon ?? false,
    es_mio: i.es_mio ?? false,
    valor_arriendo: i.valor_arriendo ?? null,
    imagen_principal: imagen ? { miniatura_url: imagen.miniatura_url } : null,
  };
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
