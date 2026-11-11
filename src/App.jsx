import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Inmuebles from './components/Inmuebles.jsx';
import MapaCiudades from './components/MapaCiudades.jsx';
import ComoFunciona from './components/ComoFunciona.jsx';
import Equipo from './components/Equipo.jsx';
import Contacto from './components/Contacto.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import DetalleInmueble from './components/DetalleInmueble.jsx';
import AuthModal from './components/AuthModal.jsx';
import PublicarModal from './components/PublicarModal.jsx';
import { useApp } from './context/AppContext.jsx';
import { CIUDAD_BETA } from './data/ciudades.js';
import { normalizar } from './utils/formato.js';
import { listarCiudades } from './api/amaru.js';

const FILTROS_INICIALES = { departamento: '', ciudad: '', ciudadNombre: '', tipo: '', valor_max: '', q: '' };

export default function App() {
  const { catalogos, modal } = useApp();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [inicializado, setInicializado] = useState(false);

  // Al cargar los catálogos, la búsqueda arranca en Pereira (ciudad beta).
  useEffect(() => {
    if (inicializado || !catalogos.listo) return;
    const depto = catalogos.departamentos.find((d) => normalizar(d.nombre) === normalizar(CIUDAD_BETA.departamento));
    if (!depto) {
      setInicializado(true);
      return;
    }
    listarCiudades(depto.id)
      .then((ciudades) => {
        const ciudad = ciudades.find((c) => normalizar(c.nombre) === normalizar(CIUDAD_BETA.ciudad));
        setFiltros((f) => ({
          ...f,
          departamento: String(depto.id),
          ciudad: ciudad ? String(ciudad.id) : '',
          ciudadNombre: ciudad?.nombre ?? '',
        }));
      })
      .catch(() => {})
      .finally(() => setInicializado(true));
  }, [catalogos, inicializado]);

  const aplicarFiltros = useCallback((nuevos) => setFiltros((f) => ({ ...f, ...nuevos })), []);
  const limpiarFiltros = useCallback(() => setFiltros(FILTROS_INICIALES), []);

  return (
    <>
      <Header />
      <main>
        <Hero filtros={filtros} onBuscar={aplicarFiltros} />
        <Inmuebles filtros={filtros} listo={inicializado || catalogos.error} onFiltrar={aplicarFiltros} onLimpiar={limpiarFiltros} />
        <MapaCiudades onElegirCiudad={aplicarFiltros} />
        <ComoFunciona />
        <Equipo />
        <Contacto />
      </main>
      <Footer />
      <Toast />

      {modal?.tipo === 'detalle' && <DetalleInmueble id={modal.datos} />}
      {modal?.tipo === 'auth' && <AuthModal siguiente={modal.datos} />}
      {modal?.tipo === 'publicar' && <PublicarModal />}
    </>
  );
}
