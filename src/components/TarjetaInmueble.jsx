import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { capitalizar, formatoArea, formatoCOP } from '../utils/formato.js';
import { fotoReferencia } from '../utils/fotos.js';

export default function TarjetaInmueble({ inmueble }) {
  const { favoritos, alternarFavorito, mostrarToast, abrirModal } = useApp();
  const [fotoRota, setFotoRota] = useState(false);
  const esFavorito = favoritos.has(inmueble.id);
  const fotoReal = inmueble.imagen_principal?.miniatura_url;
  const foto = fotoReal ?? fotoReferencia(inmueble.tipo, inmueble.id);
  const area = formatoArea(inmueble.area_construida);

  const favorito = (e) => {
    e.stopPropagation();
    const agregado = alternarFavorito(inmueble.id);
    mostrarToast(agregado ? 'Guardado en favoritos' : 'Quitado de favoritos');
  };

  const verDetalle = () => abrirModal('detalle', inmueble.id);

  return (
    <article className="propiedad-card">
      <div className="card-image">
        {!fotoRota ? (
          <img
            src={foto}
            alt={fotoReal ? inmueble.nombre : `Foto de referencia: ${inmueble.tipo.toLowerCase()}`}
            loading="lazy"
            onError={() => setFotoRota(true)}
          />
        ) : (
          <div className="foto-vacia" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
          </div>
        )}
        <span className={`badge-status${fotoReal ? ' real' : ''}`}>
          {inmueble.es_mio ? 'Tu inmueble' : fotoReal ? `✓ ${inmueble.estado}` : 'Foto de referencia'}
        </span>
        <button
          type="button"
          className={`fav-btn${esFavorito ? ' activo' : ''}`}
          aria-label={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-pressed={esFavorito}
          onClick={favorito}
        >
          ♥
        </button>
      </div>
      <div className="card-body">
        <div className="card-top">
          <span className="badge-type">{inmueble.tipo}</span>
          <span className="location" title={`${inmueble.ciudad ?? ''} ${inmueble.departamento}`}>
            {inmueble.ciudad ? `${inmueble.ciudad} · ${inmueble.departamento}` : inmueble.departamento}
          </span>
        </div>
        <h3>{capitalizar(inmueble.nombre)}</h3>
        <div className="features">
          {inmueble.estrato ? <span>Estrato {inmueble.estrato}</span> : null}
          {area ? <span>{area}</span> : null}
          {inmueble.mas_admon ? <span>+ admón.</span> : null}
          {!inmueble.estrato && !area && !inmueble.mas_admon ? <span>{inmueble.estado}</span> : null}
        </div>
        <div className="card-footer">
          <div className="price-tag">
            {formatoCOP(inmueble.valor_arriendo)} {inmueble.valor_arriendo ? <span>/ mes</span> : null}
          </div>
          <button type="button" className="btn btn-soft" onClick={verDetalle}>
            Ver
          </button>
        </div>
      </div>
    </article>
  );
}
