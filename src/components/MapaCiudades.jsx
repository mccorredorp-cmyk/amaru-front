import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext.jsx';
import { useEstadisticas } from '../hooks/useEstadisticas.js';
import { listarCiudades } from '../api/amaru.js';
import { CIUDAD_BETA, COORDENADAS } from '../data/ciudades.js';
import { UBICACIONES_PEREIRA } from '../data/ubicacionesPereira.js';
import { capitalizar, formatoCorto, normalizar } from '../utils/formato.js';

const VISTAS = {
  pereira: { centro: [4.8065, -75.6955], zoom: 14 },
  colombia: { centro: [4.8133, -75.6961], zoom: 6 },
};

/** Mueve el mapa cuando cambia la vista (Pereira o toda Colombia). */
function CambiarVista({ vista }) {
  const mapa = useMap();
  useEffect(() => {
    const { centro, zoom } = VISTAS[vista];
    mapa.flyTo(centro, zoom, { duration: 0.8 });
  }, [mapa, vista]);
  return null;
}

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

const icono = (texto, beta) =>
  L.divIcon({
    className: 'marcador',
    html: `<span class="marcador-pin${beta ? ' beta' : ''}">${texto}</span>`,
    iconSize: null,
  });

export default function MapaCiudades({ onElegirCiudad }) {
  const { catalogos, mostrarToast, abrirModal } = useApp();
  const stats = useEstadisticas();
  const [vista, setVista] = useState('pereira');

  // Inmuebles de Pereira agrupados por punto: varias oficinas del mismo
  // edificio comparten un solo pin.
  const sitiosPereira = useMemo(() => {
    const porLugar = new Map();
    for (const inmueble of stats.inmueblesBeta ?? []) {
      const ubicacion = UBICACIONES_PEREIRA[inmueble.codigo_sae];
      if (!ubicacion) continue;
      const clave = `${ubicacion.lat},${ubicacion.lng}`;
      const sitio = porLugar.get(clave) ?? { ...ubicacion, clave, inmuebles: [] };
      sitio.inmuebles.push(inmueble);
      porLugar.set(clave, sitio);
    }
    return [...porLugar.values()].map((s) => ({
      ...s,
      desde: Math.min(...s.inmuebles.map((i) => i.valor_arriendo || Infinity)),
    }));
  }, [stats.inmueblesBeta]);

  const ubicados = sitiosPereira.reduce((n, s) => n + s.inmuebles.length, 0);
  const totalPereira = stats.inmueblesBeta?.length ?? 0;

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
              La Perla del Otún es nuestra ciudad piloto: aquí ves cada inmueble en su esquina. Cambia a Colombia para explorar
              el resto del país y toca una ciudad para ver sus inmuebles.
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
            <div className="mapa-vistas" role="group" aria-label="Vista del mapa">
              <button type="button" className={vista === 'pereira' ? 'on' : ''} aria-pressed={vista === 'pereira'} onClick={() => setVista('pereira')}>
                Pereira
              </button>
              <button type="button" className={vista === 'colombia' ? 'on' : ''} aria-pressed={vista === 'colombia'} onClick={() => setVista('colombia')}>
                Colombia
              </button>
            </div>
            <MapContainer center={VISTAS.pereira.centro} zoom={VISTAS.pereira.zoom} scrollWheelZoom={false} className="mapa-leaflet" aria-label="Mapa de inmuebles">
              <CambiarVista vista={vista} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={19}
              />
              {vista === 'pereira' &&
                sitiosPereira.map((sitio) => (
                  <Marker
                    key={sitio.clave}
                    position={[sitio.lat, sitio.lng]}
                    icon={icono(sitio.inmuebles.length > 1 ? `${sitio.inmuebles.length} · ${formatoCorto(sitio.desde)}` : formatoCorto(sitio.desde), true)}
                  >
                    <Popup>
                      <div className="popup popup-sitio">
                        <strong>{sitio.lugar}</strong>
                        <span>{sitio.direccion}</span>
                        <ul>
                          {sitio.inmuebles.map((i) => (
                            <li key={i.id}>
                              <button type="button" onClick={() => abrirModal('detalle', i.id)}>
                                <span>{capitalizar(i.tipo)}</span>
                                <b>{formatoCorto(i.valor_arriendo)}</b>
                              </button>
                            </li>
                          ))}
                        </ul>
                        <small>Ubicación aproximada: {sitio.referencia}</small>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              {vista === 'colombia' &&
                puntos.map((p) => (
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
            <span className="mapa-nota">
              {vista === 'pereira'
                ? `${plural(ubicados, 'inmueble ubicado', 'inmuebles ubicados')} de ${totalPereira} en Pereira · toca un pin`
                : 'Cada globo es una ciudad: el número son sus inmuebles'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
