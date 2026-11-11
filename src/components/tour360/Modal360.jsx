import { lazy, Suspense } from 'react';
import Modal from '../Modal.jsx';

// Three.js pesa: el visor se descarga solo cuando alguien abre el tour.
const Tour360 = lazy(() => import('./Tour360.jsx'));

// Panorámica de ejemplo mientras el back no guarde fotos 360° propias
// (de los ejemplos oficiales de three.js, servida con CORS abierto).
export const PANORAMA_DEMO = 'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg';

export default function Modal360({ url, titulo, esDemo, onCerrar }) {
  return (
    <Modal titulo={`Vista 360° de ${titulo}`} onCerrar={onCerrar} ancho="completo" className="modal-360">
      <Suspense
        fallback={
          <div className="tour360">
            <div className="tour-mensaje">
              <span className="tour-spinner" aria-hidden="true" />
              <span>Preparando el visor 3D…</span>
            </div>
          </div>
        }
      >
        <Tour360 url={url} titulo={titulo} esDemo={esDemo} />
      </Suspense>
    </Modal>
  );
}
