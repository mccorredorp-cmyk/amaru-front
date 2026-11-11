import { useCallback, useEffect, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import { obtenerInmueble, subirImagenes } from '../api/amaru.js';
import { useApp } from '../context/AppContext.jsx';
import { capitalizar, fechaCorta, formatoArea, formatoCOP, textoAlerta } from '../utils/formato.js';
import { fotoReferencia } from '../utils/fotos.js';

export default function DetalleInmueble({ id }) {
  const { cerrarModal, favoritos, alternarFavorito, mostrarToast } = useApp();
  const [inmueble, setInmueble] = useState(null);
  const [error, setError] = useState(null);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const archivo = useRef(null);

  const cargar = useCallback(() => {
    setError(null);
    obtenerInmueble(id)
      .then((i) => {
        setInmueble(i);
        const principal = i.imagenes.findIndex((im) => im.es_principal);
        setFotoActiva(principal >= 0 ? principal : 0);
      })
      .catch(setError);
  }, [id]);

  useEffect(cargar, [cargar]);

  const subir = async (e) => {
    const archivos = [...e.target.files].slice(0, 5);
    e.target.value = '';
    if (!archivos.length) return;
    setSubiendo(true);
    try {
      await subirImagenes(id, archivos);
      mostrarToast(archivos.length === 1 ? 'Foto subida' : `${archivos.length} fotos subidas`);
      cargar();
    } catch (err) {
      mostrarToast(err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const titulo = inmueble ? capitalizar(inmueble.nombre) : 'Detalle del inmueble';

  return (
    <Modal titulo={titulo} onCerrar={cerrarModal} ancho="ancho" className="detalle">
      {!inmueble && !error && <div className="detalle-cargando">Cargando inmueble…</div>}

      {error && (
        <div className="detalle-cargando">
          <p>
            <b>No pudimos abrir este inmueble.</b> {error.message}
          </p>
          <button type="button" className="btn btn-soft" onClick={cargar}>
            Reintentar
          </button>
        </div>
      )}

      {inmueble && (
        <div className="detalle-grid">
          <div className="detalle-galeria">
            <div className="detalle-foto">
              <img
                src={inmueble.imagenes[fotoActiva]?.url ?? fotoReferencia(inmueble.tipo, inmueble.id)}
                alt={inmueble.imagenes.length ? `Foto ${fotoActiva + 1} de ${titulo}` : 'Foto de referencia'}
              />
              {!inmueble.imagenes.length && <span className="badge-status">Foto de referencia</span>}
            </div>
            {inmueble.imagenes.length > 1 && (
              <div className="detalle-miniaturas">
                {inmueble.imagenes.map((im, i) => (
                  <button
                    type="button"
                    key={im.id}
                    className={i === fotoActiva ? 'activa' : ''}
                    onClick={() => setFotoActiva(i)}
                    aria-label={`Ver foto ${i + 1}`}
                  >
                    <img src={im.miniatura_url} alt="" />
                  </button>
                ))}
              </div>
            )}
            {inmueble.es_mio && (
              <div className="detalle-subir">
                <input ref={archivo} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={subir} />
                <button
                  type="button"
                  className="btn btn-outline btn-full"
                  onClick={() => archivo.current?.click()}
                  disabled={subiendo || inmueble.imagenes.length >= 10}
                >
                  {subiendo ? 'Subiendo fotos…' : `Subir fotos (${inmueble.imagenes.length}/10)`}
                </button>
                <small>JPG, PNG o WebP, hasta 10 MB cada una. Máximo 5 por vez.</small>
              </div>
            )}
          </div>

          <div className="detalle-info">
            <span className="subtitulo">
              {inmueble.tipo} · {inmueble.estado}
            </span>
            <h2>{titulo}</h2>
            <p className="detalle-ubicacion">
              📍 {inmueble.direccion}
              {inmueble.ciudad ? `, ${inmueble.ciudad}` : ''} · {inmueble.departamento}
            </p>

            <div className="detalle-precio">
              {formatoCOP(inmueble.valor_arriendo)}
              {inmueble.valor_arriendo ? <span> / mes{inmueble.mas_admon ? ' + administración' : ''}</span> : null}
            </div>

            <dl className="detalle-datos">
              <div>
                <dt>Estrato</dt>
                <dd>{inmueble.estrato ?? 'Sin dato'}</dd>
              </div>
              <div>
                <dt>Área construida</dt>
                <dd>{formatoArea(inmueble.area_construida) ?? 'Sin dato'}</dd>
              </div>
              <div>
                <dt>IVA</dt>
                <dd>{inmueble.iva ? 'Aplica' : 'No aplica'}</dd>
              </div>
              <div>
                <dt>Publicado</dt>
                <dd>{fechaCorta(inmueble.fecha_publicacion)}</dd>
              </div>
              <div>
                <dt>Código</dt>
                <dd>{inmueble.codigo_sae}</dd>
              </div>
            </dl>

            {inmueble.contacto && (
              <div className="detalle-contacto">
                <h4>Contacto</h4>
                <p className="detalle-contacto-nombre">{capitalizar(inmueble.contacto.nombre)}</p>
                <div className="detalle-contacto-links">
                  {inmueble.contacto.telefono && (
                    <a className="btn btn-primary" href={`tel:${inmueble.contacto.telefono}`}>
                      📞 {inmueble.contacto.telefono}
                    </a>
                  )}
                  {inmueble.contacto.correo && (
                    <a className="btn btn-outline" href={`mailto:${inmueble.contacto.correo}?subject=${encodeURIComponent(`Interés en ${inmueble.nombre}`)}`}>
                      ✉️ Escribir
                    </a>
                  )}
                </div>
                {inmueble.contacto.correo && <small className="detalle-correo">{inmueble.contacto.correo}</small>}
              </div>
            )}

            {inmueble.pagina_web && (
              <a className="detalle-web" href={inmueble.pagina_web} target="_blank" rel="noopener noreferrer">
                Ver publicación original ↗
              </a>
            )}

            {inmueble.alertas.length > 0 && (
              <div className="detalle-alertas">
                <h4>Avisos sobre los datos</h4>
                <ul>
                  {inmueble.alertas.map((a) => (
                    <li key={a}>{textoAlerta(a)}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className={`btn btn-ghost detalle-fav${favoritos.has(inmueble.id) ? ' activo' : ''}`}
              onClick={() => mostrarToast(alternarFavorito(inmueble.id) ? 'Guardado en favoritos' : 'Quitado de favoritos')}
            >
              ♥ {favoritos.has(inmueble.id) ? 'En favoritos' : 'Guardar en favoritos'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
