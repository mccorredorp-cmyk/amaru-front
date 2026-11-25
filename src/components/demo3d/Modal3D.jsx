import { lazy, Suspense } from 'react';
import Modal from '../Modal.jsx';

// Three.js pesa: el visor se descarga solo cuando alguien abre la demo
// (React.lazy crea un archivo JS aparte que no carga con la página).
const Visor3D = lazy(() => import('./Visor3D.jsx'));

export default function Modal3D({ idInmueble, titulo, onCerrar }) {
  return (
    <Modal titulo={`Recorrido 3D de demostración: ${titulo}`} onCerrar={onCerrar} ancho="completo" className="modal-3d">
      <Suspense
        fallback={
          <div className="visor3d">
            <div className="visor-mensaje">
              <span className="visor-spinner" aria-hidden="true" />
              <span>Preparando la vista 3D…</span>
            </div>
          </div>
        }
      >
        <Visor3D idInmueble={idInmueble} titulo={titulo} />
      </Suspense>
    </Modal>
  );
}
