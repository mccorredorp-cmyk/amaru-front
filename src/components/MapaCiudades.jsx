import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext.jsx';
import { useEstadisticas } from '../hooks/useEstadisticas.js';
import { listarCiudades } from '../api/amaru.js';
import { CIUDAD_BETA, COORDENADAS } from '../data/ciudades.js';
import { formatoCorto, normalizar } from '../utils/formato.js';

const icono = (texto, beta) =>
  L.divIcon({
    className: 'marcador',
    html: `<span class="marcador-pin${beta ? ' beta' : ''}">${texto}</span>`,
    iconSize: null,
  });

export default function MapaCiudades({ onElegirCiudad }) {
  const { catalogos, mostrarToast } = useApp();
  const stats = useEstadisticas();

  const puntos = useMemo(
    () =>
      stats.porCiudad
        .filter((c) => COORDENADAS[c.ciudad])
        .map((c) => ({ ...c, pos: COORDENADAS[c.ciudad], beta: normalizar(c.ciudad) === normalizar(CIUDAD_BETA.ciudad) })),
    [stats.porCiudad],
  );

  // Del mapa al listado: busca los IDs del departamento y la ciudad.
  const elegir = async (punto) => {
    const depto = catalogos.departamentos.find((d) => normalizar(d.nombre) === normalizar(punto.departamento));
    if (!depto) return;
    try {
      const ciudades = await listarCiudades(depto.id);
      const ciudad = ciudades.find((c) => normalizar(c.nombre) === normalizar(punto.ciudad));
      onElegirCiudad({ departamento: String(depto.id), ciudad: ciudad ? String(ciudad.id) : '', ciudadNombre: ciudad?.nombre ?? '' });
      document.getElementById('propiedades')?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      mostrarToast(e.message);
    }
  };

  const top = stats.porCiudad.slice(0, 8);
  const beta = stats.porCiudad.find((c) => normalizar(c.ciudad) === normalizar(CIUDAD_BETA.ciudad));

  return (
    <section className="seccion-mapa" id="mapa">
      <div className="contenedor">
        <div className="mapa-wrapper">
          <div className="mapa-info">
            <span className="subtitulo">Ciudad beta</span>
            <h2>Pereira es donde empieza Amaru</h2>
            <p className="header-desc">
              La Perla del Otún es nuestra ciudad piloto. Mientras tanto, ya puedes explorar los inmuebles de todo el país:
              toca una ciudad para ver sus inmuebles.
            </p>

            <ul className="sector-lista">
              {beta && (
                <li>
                  <button type="button" className="beta" onClick={() => elegir(beta)}>
                    <span>Pereira ★</span>
                    <small>
                      {beta.total} · desde {formatoCorto(beta.desde)}
                    </small>
                  </button>
                </li>
              )}
              {top
                .filter((c) => c !== beta)
                .slice(0, beta ? 7 : 8)
                .map((c) => (
                  <li key={c.ciudad}>
                    <button type="button" onClick={() => elegir(c)}>
                      <span>{c.ciudad}</span>
                      <small>
                        {c.total} · desde {formatoCorto(c.desde)}
                      </small>
                    </button>
                  </li>
                ))}
              {!stats.listo && <li className="sector-cargando">Cargando ciudades…</li>}
              {stats.error && <li className="sector-cargando">No se pudo cargar el resumen por ciudad.</li>}
            </ul>

            <div className="proximas">
              <span>Próximamente con verificación Amaru</span>
              <div>
                <em>Manizales</em>
                <em>Armenia</em>
                <em>Medellín</em>
                <em>Bogotá</em>
                <em>Cali</em>
              </div>
            </div>
          </div>

          <div className="mapa-box">
            <MapContainer center={[4.8133, -75.6961]} zoom={6} scrollWheelZoom={false} className="mapa-leaflet" aria-label="Mapa de inmuebles por ciudad">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={19}
              />
              {puntos.map((p) => (
                <Marker key={p.ciudad} position={p.pos} icon={icono(p.beta ? `★ ${p.total}` : p.total, p.beta)} zIndexOffset={p.beta ? 1000 : 0}>
                  <Popup>
                    <div className="popup">
                      <strong>
                        {p.ciudad}
                        {p.beta ? ' · ciudad beta' : ''}
                      </strong>
                      <span>{p.departamento}</span>
                      <b>
                        {p.total} {p.total === 1 ? 'inmueble' : 'inmuebles'} · desde {formatoCorto(p.desde)}
                      </b>
                      <button type="button" className="popup-link" onClick={() => elegir(p)}>
                        Ver inmuebles →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <span className="mapa-nota">Cada globo es una ciudad: el número son sus inmuebles</span>
          </div>
        </div>
      </div>
    </section>
  );
}
