import { useState } from 'react';
import Modal from './Modal.jsx';
import { eliminarInmueble } from '../api/amaru.js';
import { useApp } from '../context/AppContext.jsx';
import { capitalizar } from '../utils/formato.js';

/**
 * Confirmación antes de borrar. El borrado es definitivo (también se borran sus
 * fotos en Storage), por eso se pide un segundo clic explícito. Aunque el botón
 * solo aparece en inmuebles propios, quien decide es el back: si no eres el
 * dueño responde 403 y aquí se muestra el mensaje.
 */
export default function ConfirmarEliminar({ inmueble }) {
  const { cerrarModal, mostrarToast, avisarCambioInmuebles, quitarFavorito } = useApp();
  const [borrando, setBorrando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const nombre = capitalizar(inmueble.nombre);

  const confirmar = async () => {
    setBorrando(true);
    setMensaje('');
    try {
      await eliminarInmueble(inmueble.id);
      quitarFavorito(inmueble.id);
      avisarCambioInmuebles();
      mostrarToast('Inmueble eliminado');
      cerrarModal();
    } catch (err) {
      setMensaje(err.message);
      setBorrando(false);
    }
  };

  return (
    <Modal titulo="Eliminar inmueble" onCerrar={borrando ? () => {} : cerrarModal}>
      <div className="form-modal confirmar-eliminar">
        <span className="confirmar-icono" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </span>
        <h2>¿Eliminar este inmueble?</h2>
        <p className="form-intro">
          Vas a eliminar <b>{nombre}</b>
          {inmueble.ciudad ? ` en ${inmueble.ciudad}` : ''}. Se borrarán también sus fotos y esta acción no se puede
          deshacer.
        </p>
        {mensaje && <p className="form-error-general">{mensaje}</p>}
        <div className="form-acciones">
          <button type="button" className="btn btn-ghost" onClick={cerrarModal} disabled={borrando}>
            Cancelar
          </button>
          <button type="button" className="btn btn-peligro-solido" onClick={confirmar} disabled={borrando}>
            {borrando ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
