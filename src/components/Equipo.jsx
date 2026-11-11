import { useRef, useState } from 'react';
import { EQUIPO, FOTO_EQUIPO } from '../data/equipo.js';
import ModalCreador from './ModalCreador.jsx';

export default function Equipo() {
  const [activo, setActivo] = useState(null); // { miembro, tarjeta }
  const tarjetas = useRef({});

  const abrir = (miembro) => setActivo({ miembro, tarjeta: tarjetas.current[miembro.id] });

  return (
    <section className="seccion contenedor" id="equipo">
      <div className="equipo-top">
        <div className="equipo-intro">
          <span className="subtitulo">Quiénes somos</span>
          <h2>Detrás de Amaru hay personas reales</h2>
          <p className="header-desc">Tres estudiantes de Pereira construyendo la forma más fácil de encontrar arriendo en Colombia.</p>
        </div>
        <figure className="foto-equipo">
          <img src={FOTO_EQUIPO} alt="Martin, Juan Alberto y Ruben Dario, creadores de Amaru" />
        </figure>
      </div>

      <div className="grid-equipo">
        {EQUIPO.map((m) => (
          <article
            key={m.id}
            ref={(el) => (tarjetas.current[m.id] = el)}
            className="miembro-card"
            tabIndex={0}
            role="button"
            aria-haspopup="dialog"
            aria-label={`Ver perfil de ${m.nombre}`}
            onClick={() => abrir(m)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                abrir(m);
              }
            }}
          >
            <div className={`miembro-foto ${m.color}`}>
              <span className="iniciales">{m.iniciales}</span>
              {m.foto && <img src={m.foto} alt={`Foto de ${m.nombre}`} onError={(e) => e.currentTarget.remove()} />}
            </div>
            <span className="ver-perfil">
              Ver perfil
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </span>
            <div className="miembro-info">
              <h3>{m.nombre}</h3>
              {m.rol && <p className="rol">{m.rol}</p>}
              {m.bio && <p className="bio">{m.bio}</p>}
            </div>
          </article>
        ))}
      </div>

      {activo && <ModalCreador miembro={activo.miembro} tarjeta={activo.tarjeta} onCerrado={() => setActivo(null)} />}
    </section>
  );
}
