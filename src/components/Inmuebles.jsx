import { useEffect, useMemo, useRef, useState } from 'react';
import { listarInmuebles } from '../api/amaru.js';
import { useApp } from '../context/AppContext.jsx';
import { normalizar } from '../utils/formato.js';
import TarjetaInmueble from './TarjetaInmueble.jsx';

const POR_PAGINA = 12;

// Pastillas rápidas: se buscan por nombre en el catálogo de tipos.
const PASTILLAS = [
  ['Apartamento', 'Apartamentos'],
  ['Casa', 'Casas'],
  ['Local Comercial', 'Locales'],
  ['Oficina', 'Oficinas'],
  ['Garaje', 'Garajes'],
];

const ORDENES = {
  recientes: { sort: 'fecha_publicacion', order: 'desc', texto: 'Más recientes' },
  baratos: { sort: 'valor_arriendo', order: 'asc', texto: 'Menor precio' },
  caros: { sort: 'valor_arriendo', order: 'desc', texto: 'Mayor precio' },
  grandes: { sort: 'area_construida', order: 'desc', texto: 'Más grandes' },
};

export default function Inmuebles({ filtros, listo, onFiltrar, onLimpiar }) {
  const { catalogos, usuario } = useApp();
  const [orden, setOrden] = useState('recientes');
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error | mas
  const [error, setError] = useState(null);
  const [reintento, setReintento] = useState(0);
  const control = useRef();

  const pastillas = useMemo(
    () =>
      PASTILLAS.map(([nombre, texto]) => {
        const tipo = catalogos.tipos.find((t) => normalizar(t.nombre) === normalizar(nombre));
        return tipo ? { id: String(tipo.id), texto } : null;
      }).filter(Boolean),
    [catalogos.tipos],
  );

  const consulta = useMemo(
    () => ({
      departamento: filtros.departamento,
      ciudad: filtros.ciudad,
      tipo: filtros.tipo,
      valor_max: filtros.valor_max,
      q: filtros.q,
      sort: ORDENES[orden].sort,
      order: ORDENES[orden].order,
      limit: POR_PAGINA,
      // Al ordenar por precio, los inmuebles sin precio no aportan.
      valor_min: orden === 'baratos' || orden === 'caros' ? 1 : undefined,
    }),
    [filtros, orden],
  );

  // Nueva búsqueda: vuelve a la página 1.
  useEffect(() => {
    if (!listo) return;
    control.current?.abort();
    const ac = new AbortController();
    control.current = ac;
    setEstado('cargando');
    setPagina(1);
    listarInmuebles({ ...consulta, page: 1 }, ac.signal)
      .then((r) => {
        setItems(r.data);
        setMeta(r.meta);
        setEstado('listo');
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setError(e);
        setEstado('error');
      });
    return () => ac.abort();
  }, [consulta, listo, reintento, usuario]);

  const cargarMas = () => {
    const siguiente = pagina + 1;
    setEstado('mas');
    listarInmuebles({ ...consulta, page: siguiente })
      .then((r) => {
        setItems((prev) => [...prev, ...r.data]);
        setMeta(r.meta);
        setPagina(siguiente);
        setEstado('listo');
      })
      .catch((e) => {
        setError(e);
        setEstado('error');
      });
  };

  const hayFiltros = filtros.departamento || filtros.ciudad || filtros.tipo || filtros.valor_max || filtros.q;
  const titulo = describirFiltros(filtros, catalogos);

  return (
    <section className="seccion contenedor" id="propiedades">
      <div className="seccion-header">
        <div>
          <span className="subtitulo">En arriendo ahora</span>
          <h2>Inmuebles disponibles</h2>
          <p className="resumen-busqueda" aria-live="polite">
            {estado === 'cargando' && 'Buscando inmuebles…'}
            {estado !== 'cargando' && meta && (
              <>
                <b>{meta.total.toLocaleString('es-CO')}</b> {meta.total === 1 ? 'resultado' : 'resultados'} {titulo}
              </>
            )}
          </p>
        </div>
        <div className="controles-lista">
          <div className="filter-pills" role="group" aria-label="Filtrar por tipo">
            <button type="button" className={`pill-btn${!filtros.tipo ? ' active' : ''}`} onClick={() => onFiltrar({ tipo: '' })}>
              Todos
            </button>
            {pastillas.map((p) => (
              <button
                type="button"
                key={p.id}
                className={`pill-btn${filtros.tipo === p.id ? ' active' : ''}`}
                onClick={() => onFiltrar({ tipo: p.id })}
              >
                {p.texto}
              </button>
            ))}
          </div>
          <label className="orden-select">
            <span>Ordenar</span>
            <select value={orden} onChange={(e) => setOrden(e.target.value)}>
              {Object.entries(ORDENES).map(([clave, o]) => (
                <option key={clave} value={clave}>
                  {o.texto}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {estado === 'error' && (
        <div className="estado-vacio error">
          <p>
            <b>No pudimos cargar los inmuebles.</b> {error?.message}
          </p>
          <button type="button" className="btn btn-soft" onClick={() => setReintento((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      )}

      {(estado === 'cargando' || !listo) && (
        <div className="grid-propiedades" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="propiedad-card esqueleto" key={i}>
              <div className="card-image" />
              <div className="card-body">
                <span className="linea corta" />
                <span className="linea" />
                <span className="linea media" />
              </div>
            </div>
          ))}
        </div>
      )}

      {(estado === 'listo' || estado === 'mas') && items.length > 0 && (
        <div className="grid-propiedades">
          {items.map((inmueble) => (
            <TarjetaInmueble key={inmueble.id} inmueble={inmueble} />
          ))}
        </div>
      )}

      {estado === 'listo' && items.length === 0 && (
        <div className="estado-vacio">
          <p>No encontramos inmuebles con esos filtros. Prueba con otra ciudad, otro tipo o un presupuesto mayor.</p>
          {hayFiltros && (
            <button type="button" className="btn btn-soft" onClick={onLimpiar}>
              Ver toda Colombia
            </button>
          )}
        </div>
      )}

      {meta && items.length > 0 && items.length < meta.total && (estado === 'listo' || estado === 'mas') && (
        <div className="cargar-mas">
          <button type="button" className="btn btn-outline" onClick={cargarMas} disabled={estado === 'mas'}>
            {estado === 'mas' ? 'Cargando…' : `Ver más (${(meta.total - items.length).toLocaleString('es-CO')} restantes)`}
          </button>
        </div>
      )}

      <p className="nota-fuente">
        Inmuebles en arriendo cargados desde la base de AmaruHouse. Las fotos de referencia se reemplazan por las reales
        cuando el propietario las sube.
      </p>
    </section>
  );
}

function describirFiltros(filtros, catalogos) {
  const partes = [];
  const tipo = catalogos.tipos.find((t) => String(t.id) === filtros.tipo);
  const depto = catalogos.departamentos.find((d) => String(d.id) === filtros.departamento);
  if (tipo) partes.push(`de tipo ${tipo.nombre.toLowerCase()}`);
  if (filtros.ciudad && filtros.ciudadNombre) partes.push(`en ${filtros.ciudadNombre}${depto ? `, ${depto.nombre}` : ''}`);
  else if (depto) partes.push(`en ${depto.nombre}`);
  else partes.push('en toda Colombia');
  if (filtros.valor_max) partes.push(`hasta $${Number(filtros.valor_max).toLocaleString('es-CO')}`);
  return partes.join(' ');
}
