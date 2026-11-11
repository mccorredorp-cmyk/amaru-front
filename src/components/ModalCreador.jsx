import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const reducirMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Transformación que hace ver el panel del tamaño y la posición de la tarjeta. */
function transformDesde(tarjeta, panel) {
  const a = tarjeta.getBoundingClientRect();
  const b = panel.getBoundingClientRect();
  const dx = a.left + a.width / 2 - (b.left + b.width / 2);
  const dy = a.top + a.height / 2 - (b.top + b.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${a.width / b.width}, ${a.height / b.height})`;
}

/** Perfil del creador: se abre con zoom desde su tarjeta y vuelve a ella al cerrar. */
export default function ModalCreador({ miembro, tarjeta, onCerrado }) {
  const panel = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const cerrando = useRef(false);
  const d = miembro.detalle;

  useLayoutEffect(() => {
    const p = panel.current;
    document.body.classList.add('sin-scroll');
    if (!reducirMovimiento() && tarjeta) {
      p.style.transition = 'none';
      p.style.transform = transformDesde(tarjeta, p);
      p.style.opacity = '0.4';
      p.getBoundingClientRect(); // fuerza el reflow antes de animar
    }
    requestAnimationFrame(() => {
      p.style.transition = '';
      p.style.transform = '';
      p.style.opacity = '';
      setAbierto(true);
    });
    p.focus({ preventScroll: true });
    return () => document.body.classList.remove('sin-scroll');
  }, [tarjeta]);

  const cerrar = useCallback(() => {
    if (cerrando.current) return;
    cerrando.current = true;
    setAbierto(false);
    const p = panel.current;
    const fin = () => {
      onCerrado();
      tarjeta?.focus({ preventScroll: true });
    };
    if (reducirMovimiento() || !tarjeta) return fin();
    p.style.transform = transformDesde(tarjeta, p);
    p.style.opacity = '0';
    setTimeout(fin, 380);
  }, [onCerrado, tarjeta]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && cerrar();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cerrar]);

  const hayInfo = d.rol || d.ubicacion || d.sobre || d.aporte || d.habilidades.length || d.contacto.length;

  return createPortal(
    <div className={`modal${abierto ? ' abierto' : ''}`}>
      <div className="modal-fondo" onClick={cerrar} />
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modalNombre" tabIndex={-1} ref={panel}>
        <button type="button" className="modal-cerrar" onClick={cerrar} aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
        <div className={`modal-foto ${miembro.color}`}>
          <span className="iniciales">{miembro.iniciales}</span>
          {miembro.foto && <img src={miembro.foto} alt={`Foto de ${miembro.nombre}`} onError={(e) => e.currentTarget.remove()} />}
        </div>
        <div className="modal-contenido">
          <span className="subtitulo">Creador de Amaru</span>
          <h2 id="modalNombre">{miembro.nombre}</h2>
          {(d.rol || miembro.rol) && <p className="modal-rol">{d.rol || miembro.rol}</p>}
          {d.ubicacion && <p className="modal-ubicacion">{d.ubicacion}</p>}

          {d.sobre && (
            <div className="modal-bloque">
              <h4>Sobre mí</h4>
              <p>{d.sobre}</p>
            </div>
          )}
          {d.aporte && (
            <div className="modal-bloque">
              <h4>Qué hace en Amaru</h4>
              <p>{d.aporte}</p>
            </div>
          )}
          {d.habilidades.length > 0 && (
            <div className="modal-bloque">
              <h4>Habilidades</h4>
              <ul className="modal-chips">
                {d.habilidades.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {d.contacto.length > 0 && (
            <div className="modal-bloque">
              <h4>Contacto</h4>
              <div className="modal-links">
                {d.contacto.map((c) => (
                  <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer">
                    {c.texto}
                  </a>
                ))}
              </div>
            </div>
          )}
          {!hayInfo && <p className="modal-vacio">Pronto encontrarás aquí más información sobre este creador.</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
