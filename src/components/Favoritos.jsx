import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatoCOP } from '../utils/formato.js';
import TarjetaInmueble from './TarjetaInmueble.jsx';

const ORDENES = {
  recientes: { texto: 'Guardados recientemente', fn: (a, b) => (b.guardado_en ?? 0) - (a.guardado_en ?? 0) },
  baratos: { texto: 'Menor precio', fn: (a, b) => (a.valor_arriendo ?? Infinity) - (b.valor_arriendo ?? Infinity) },
  caros: { texto: 'Mayor precio', fn: (a, b) => (b.valor_arriendo ?? -1) - (a.valor_arriendo ?? -1) },
};

function Corazon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

/** Sección "Mis favoritos": cada cuenta ve solo su propia lista. */
export default function Favoritos() {
  const { usuario, sesionLista, favoritosLista, abrirModal } = useApp();
  const [orden, setOrden] = useState('recientes');

  const lista = useMemo(() => [...favoritosLista].sort(ORDENES[orden].fn), [favoritosLista, orden]);

  const resumen = useMemo(() => {
    const precios = favoritosLista.map((f) => f.valor_arriendo).filter(Boolean);
    const ciudades = new Set(favoritosLista.map((f) => f.ciudad).filter(Boolean));
    return {
      desde: precios.length ? Math.min(...precios) : null,
      ciudades: ciudades.size,
    };
  }, [favoritosLista]);

  return (
    <section className="seccion contenedor favoritos" id="favoritos">
      <div className="seccion-header">
        <div>
          <span className="subtitulo">Tu lista</span>
          <h2>Mis favoritos</h2>
          <p className="resumen-busqueda" aria-live="polite">
            {!usuario
              ? 'Cada cuenta guarda su propia lista de inmuebles.'
              : favoritosLista.length === 0
                ? `${usuario.nombre.split(' ')[0]}, todavía no guardas ningún inmueble.`
                : `${favoritosLista.length} ${favoritosLista.length === 1 ? 'inmueble guardado' : 'inmuebles guardados'}` +
                  (resumen.ciudades > 1 ? ` en ${resumen.ciudades} ciudades` : '') +
                  (resumen.desde ? ` · desde ${formatoCOP(resumen.desde)}` : '')}
          </p>
        </div>

        {usuario && favoritosLista.length > 1 && (
          <div className="controles-lista">
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
        )}
      </div>

      {!sesionLista ? null : !usuario ? (
        <div className="estado-vacio favoritos-vacio">
          <span className="favoritos-icono">
            <Corazon />
          </span>
          <p>
            <strong>Ingresa para ver tus favoritos.</strong>
            <br />
            Toca ♥ en cualquier inmueble y lo encontrarás aquí, solo en tu cuenta.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => abrirModal('auth')}>
            Ingresar
          </button>
        </div>
      ) : favoritosLista.length === 0 ? (
        <div className="estado-vacio favoritos-vacio">
          <span className="favoritos-icono">
            <Corazon />
          </span>
          <p>
            <strong>Aún no tienes favoritos.</strong>
            <br />
            Toca ♥ en un inmueble para guardarlo y compararlo después.
          </p>
          <a className="btn btn-soft" href="#propiedades">
            Explorar inmuebles
          </a>
        </div>
      ) : (
        <div className="grid-propiedades">
          {lista.map((inmueble) => (
            <TarjetaInmueble key={inmueble.id} inmueble={inmueble} />
          ))}
        </div>
      )}
    </section>
  );
}
