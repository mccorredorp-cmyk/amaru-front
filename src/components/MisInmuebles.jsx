import { useEffect, useRef, useState } from 'react';
import { listarMisInmuebles } from '../api/amaru.js';
import { useApp } from '../context/AppContext.jsx';
import TarjetaInmueble from './TarjetaInmueble.jsx';

const POR_PAGINA = 12;

// '' = todos los estados. El back (GET /inmuebles/mios) no fuerza "Disponible",
// así el dueño también ve los que marcó como arrendados para reactivarlos.
const ESTADOS = [
  ['', 'Todos'],
  ['Disponible', 'Disponibles'],
  ['Arrendado', 'Arrendados'],
  ['No disponible', 'No disponibles'],
];

/** Sección "Mis inmuebles": solo los que publicó la cuenta, con editar y eliminar. */
export default function MisInmuebles() {
  const { usuario, abrirModal, versionInmuebles } = useApp();
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [carga, setCarga] = useState('cargando'); // cargando | listo | mas | error
  const [error, setError] = useState(null);
  const [reintento, setReintento] = useState(0);
  const control = useRef();

  // Se recarga al cambiar de cuenta, de filtro o cuando se publica/edita/borra
  // algo (versionInmuebles). AbortController cancela la petición anterior si el
  // usuario cambia de filtro rápido, para que una respuesta vieja no pise a la nueva.
  useEffect(() => {
    if (!usuario) return;
    control.current?.abort();
    const ac = new AbortController();
    control.current = ac;
    setCarga('cargando');
    listarMisInmuebles({ estado: estadoFiltro, page: 1, limit: POR_PAGINA }, ac.signal)
      .then((r) => {
        setItems(r.data);
        setMeta(r.meta);
        setPagina(1);
        setCarga('listo');
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setError(e);
        setCarga('error');
      });
    return () => ac.abort();
  }, [usuario, estadoFiltro, versionInmuebles, reintento]);

  if (!usuario) return null;

  const cargarMas = () => {
    const siguiente = pagina + 1;
    setCarga('mas');
    listarMisInmuebles({ estado: estadoFiltro, page: siguiente, limit: POR_PAGINA })
      .then((r) => {
        setItems((prev) => [...prev, ...r.data]);
        setMeta(r.meta);
        setPagina(siguiente);
        setCarga('listo');
      })
      .catch((e) => {
        setError(e);
        setCarga('error');
      });
  };

  const total = meta?.total ?? 0;
  const sinNada = carga === 'listo' && items.length === 0;

  return (
    <section className="seccion contenedor mis-inmuebles" id="mis-inmuebles">
      <div className="seccion-header">
        <div>
          <span className="subtitulo">Tu cuenta</span>
          <h2>Mis inmuebles</h2>
          <p className="resumen-busqueda" aria-live="polite">
            {carga === 'cargando'
              ? 'Cargando tus publicaciones…'
              : total === 0
                ? estadoFiltro
                  ? 'No tienes inmuebles en este estado.'
                  : 'Aquí verás los inmuebles que publiques.'
                : `${total} ${total === 1 ? 'inmueble publicado' : 'inmuebles publicados'} por ti. Solo tú puedes editarlos o eliminarlos.`}
          </p>
        </div>
        <div className="controles-lista">
          <div className="filter-pills" role="group" aria-label="Filtrar por estado">
            {ESTADOS.map(([valor, texto]) => (
              <button
                type="button"
                key={texto}
                className={`pill-btn${estadoFiltro === valor ? ' active' : ''}`}
                aria-pressed={estadoFiltro === valor}
                onClick={() => setEstadoFiltro(valor)}
              >
                {texto}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary" onClick={() => abrirModal('publicar')}>
            + Publicar
          </button>
        </div>
      </div>

      {carga === 'error' && (
        <div className="estado-vacio error">
          <p>
            <b>No pudimos cargar tus inmuebles.</b> {error?.message}
          </p>
          <button type="button" className="btn btn-soft" onClick={() => setReintento((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      )}

      {sinNada && !estadoFiltro && (
        <div className="estado-vacio favoritos-vacio">
          <span className="favoritos-icono mis-icono">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
          </span>
          <p>
            <strong>Todavía no has publicado inmuebles.</strong>
            <br />
            Publica el primero y adminístralo desde aquí.
          </p>
          <button type="button" className="btn btn-naranja" onClick={() => abrirModal('publicar')}>
            Publicar inmueble
          </button>
        </div>
      )}

      {items.length > 0 && carga !== 'cargando' && carga !== 'error' && (
        <div className="grid-propiedades">
          {items.map((inmueble) => (
            <TarjetaInmueble
              key={inmueble.id}
              inmueble={inmueble}
              acciones={
                <>
                  <button type="button" className="btn btn-outline" onClick={() => abrirModal('editar', inmueble)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn-peligro" onClick={() => abrirModal('eliminar', inmueble)}>
                    Eliminar
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      {meta && items.length > 0 && items.length < meta.total && (carga === 'listo' || carga === 'mas') && (
        <div className="cargar-mas">
          <button type="button" className="btn btn-outline" onClick={cargarMas} disabled={carga === 'mas'}>
            {carga === 'mas' ? 'Cargando…' : `Ver más (${meta.total - items.length} restantes)`}
          </button>
        </div>
      )}
    </section>
  );
}
