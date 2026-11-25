// Sección institucional "Nosotros". Reemplaza a la antigua sección del equipo
// (fotos y perfiles de cada persona). El texto vive en data/nosotros.js para
// poder ajustarlo sin tocar el diseño.
import { IMAGEN_NOSOTROS, MISION, PRESENTACION, VALORES, VISION } from '../data/nosotros.js';

const ICONOS = {
  confianza: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </>
  ),
  transparencia: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  cercania: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </>
  ),
  innovacion: (
    <>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </>
  ),
};

export default function Nosotros() {
  return (
    <section className="seccion contenedor nosotros" id="nosotros">
      <div className="nosotros-top">
        <div className="nosotros-intro">
          <span className="subtitulo">Nosotros</span>
          <h2>{PRESENTACION.titulo}</h2>
          {PRESENTACION.parrafos.map((p) => (
            <p key={p.slice(0, 24)} className="nosotros-texto">
              {p}
            </p>
          ))}
        </div>

        <figure className="nosotros-imagen">
          <img src={IMAGEN_NOSOTROS.url} alt={IMAGEN_NOSOTROS.alt} loading="lazy" />
          <figcaption>
            <img src="/img/Logo-icono.png" alt="" aria-hidden="true" />
            <span>
              <b>Amaru</b>
              <small>Pereira, Colombia</small>
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="nosotros-pilares">
        {[MISION, VISION].map((bloque) => (
          <article className="nosotros-pilar" key={bloque.titulo}>
            <h3>{bloque.titulo}</h3>
            <p>{bloque.texto}</p>
          </article>
        ))}
      </div>

      <div className="nosotros-valores">
        <h3>Nuestros valores</h3>
        <ul>
          {VALORES.map((v) => (
            <li key={v.id}>
              <span className="icon-wrapper" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {ICONOS[v.id]}
                </svg>
              </span>
              <div>
                <h4>{v.titulo}</h4>
                <p>{v.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
