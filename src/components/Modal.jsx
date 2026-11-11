import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Ventana modal accesible: cierra con Esc, clic en el fondo o la ✕,
 * bloquea el scroll de la página y devuelve el foco al cerrar.
 */
export default function Modal({ titulo, onCerrar, children, ancho = 'normal', className = '' }) {
  const panel = useRef(null);

  useEffect(() => {
    const anterior = document.activeElement;
    document.body.classList.add('sin-scroll');
    panel.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('sin-scroll');
      document.removeEventListener('keydown', onKey);
      anterior?.focus?.({ preventScroll: true });
    };
  }, [onCerrar]);

  return createPortal(
    <div className="modal-app abierto">
      <div className="modal-fondo" onClick={onCerrar} />
      <div
        className={`modal-app-panel modal-${ancho} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        ref={panel}
      >
        <button type="button" className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
