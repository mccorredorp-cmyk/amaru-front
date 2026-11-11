import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Tour 360° de un inmueble con Three.js + React Three Fiber.
// La foto es una panorámica equirectangular (proporción 2:1): se pega por
// dentro de una esfera y la cámara queda en el centro mirando hacia afuera.

const FOV_INICIAL = 75;
const FOV_MIN = 35;
const FOV_MAX = 95;

/** Esfera con la foto por dentro. */
function Panorama({ url }) {
  const textura = useLoader(THREE.TextureLoader, url);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;

  // Invertir la esfera en X hace que la foto se vea desde adentro y sin espejo.
  const geometria = useMemo(() => {
    const g = new THREE.SphereGeometry(500, 64, 40);
    g.scale(-1, 1, 1);
    return g;
  }, []);

  useEffect(() => () => geometria.dispose(), [geometria]);

  return (
    <mesh geometry={geometria}>
      <meshBasicMaterial map={textura} />
    </mesh>
  );
}

/** Controles: arrastrar para mirar, giro automático y zoom con el campo de visión. */
function Controles({ autoGiro, fov, onInteraccion }) {
  const { camera, gl } = useThree();
  const controles = useRef(null);

  useEffect(() => {
    camera.position.set(0, 0, 0.1);
    const c = new OrbitControls(camera, gl.domElement);
    c.enableZoom = false; // el zoom se hace cambiando el FOV, no acercando la cámara
    c.enablePan = false;
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.rotateSpeed = -0.35; // negativo: se siente como "arrastrar" la habitación
    c.autoRotateSpeed = 0.5;
    c.target.set(0, 0, 0);
    c.update();
    c.addEventListener('start', onInteraccion);
    controles.current = c;
    return () => {
      c.removeEventListener('start', onInteraccion);
      c.dispose();
    };
  }, [camera, gl, onInteraccion]);

  useEffect(() => {
    if (controles.current) controles.current.autoRotate = autoGiro;
  }, [autoGiro]);

  useEffect(() => {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, fov]);

  useFrame(() => controles.current?.update());
  return null;
}

/** Si la foto no carga, muestra un mensaje en vez de romper la página. */
class ErrorFoto extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidUpdate(prev) {
    if (prev.url !== this.props.url && this.state.error) this.setState({ error: false });
  }
  render() {
    // Dentro del Canvas solo puede haber objetos 3D: el mensaje de error
    // en HTML lo muestra <EstadoFoto> por fuera del Canvas.
    return this.state.error ? null : this.props.children;
  }
}

function Cargando() {
  return (
    <div className="tour-mensaje">
      <span className="tour-spinner" aria-hidden="true" />
      <span>Cargando vista 360°…</span>
    </div>
  );
}

export default function Tour360({ url, titulo, esDemo }) {
  const contenedor = useRef(null);
  const [foto, setFoto] = useState(url);
  const [fotoPropia, setFotoPropia] = useState(null);
  const [fov, setFov] = useState(FOV_INICIAL);
  const [autoGiro, setAutoGiro] = useState(true);
  const [ayuda, setAyuda] = useState(true);
  const [completa, setCompleta] = useState(false);
  const [estadoFoto, setEstadoFoto] = useState('cargando');

  // La primera vez que la persona arrastra, se detiene el giro y se oculta la ayuda.
  const alInteractuar = useCallback(() => {
    setAutoGiro(false);
    setAyuda(false);
  }, []);

  const zoom = useCallback((delta) => setFov((f) => Math.min(FOV_MAX, Math.max(FOV_MIN, f + delta))), []);

  // Zoom con la rueda del mouse (listener no pasivo para poder evitar el scroll).
  useEffect(() => {
    const el = contenedor.current;
    const onWheel = (e) => {
      e.preventDefault();
      zoom(e.deltaY > 0 ? 4 : -4);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom]);

  useEffect(() => {
    const onCambio = () => setCompleta(document.fullscreenElement === contenedor.current);
    document.addEventListener('fullscreenchange', onCambio);
    return () => document.removeEventListener('fullscreenchange', onCambio);
  }, []);

  // Libera la URL temporal de la foto que subió la persona.
  useEffect(() => () => fotoPropia && URL.revokeObjectURL(fotoPropia), [fotoPropia]);

  const pantallaCompleta = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else contenedor.current.requestFullscreen?.().catch(() => {});
  };

  const probarFoto = (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    const nueva = URL.createObjectURL(archivo);
    setFotoPropia(nueva);
    setFoto(nueva);
    setFov(FOV_INICIAL);
    setAutoGiro(true);
    setAyuda(true);
  };

  return (
    <div className="tour360" ref={contenedor}>
      <Canvas
        camera={{ fov: FOV_INICIAL, near: 0.1, far: 1100, position: [0, 0, 0.1] }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onCreated={({ gl }) => gl.setClearColor('#1f2d3a')}
      >
        <ErrorFoto url={foto}>
          <Suspense fallback={null}>
            <Panorama url={foto} />
          </Suspense>
        </ErrorFoto>
        <Controles autoGiro={autoGiro} fov={fov} onInteraccion={alInteractuar} />
      </Canvas>

      <EstadoFoto url={foto} onEstado={setEstadoFoto} />

      <div className="tour-etiqueta">
        <span className="tour-badge">360°</span>
        <div>
          <strong>{titulo}</strong>
          <small>{fotoPropia ? 'Tu foto panorámica' : esDemo ? 'Foto de ejemplo' : 'Vista del inmueble'}</small>
        </div>
      </div>

      {ayuda && estadoFoto === 'listo' && (
        <div className="tour-ayuda" aria-hidden="true">
          <span className="tour-mano">⟷</span>
          Arrastra para mirar alrededor
        </div>
      )}

      <div className="tour-controles" role="toolbar" aria-label="Controles de la vista 360°">
        <button type="button" onClick={() => zoom(-10)} aria-label="Acercar" title="Acercar">
          +
        </button>
        <button type="button" onClick={() => zoom(10)} aria-label="Alejar" title="Alejar">
          −
        </button>
        <button
          type="button"
          className={autoGiro ? 'on' : ''}
          onClick={() => setAutoGiro((a) => !a)}
          aria-pressed={autoGiro}
          title={autoGiro ? 'Detener giro' : 'Girar solo'}
        >
          ⟳
        </button>
        <button type="button" onClick={pantallaCompleta} aria-label="Pantalla completa" title="Pantalla completa">
          {completa ? '⤡' : '⤢'}
        </button>
        <label className="tour-subir" title="Probar con tu propia foto panorámica">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={probarFoto} />
          Probar mi foto 360°
        </label>
      </div>
    </div>
  );
}

/** Mensajes de carga y error en HTML, encima del Canvas. */
function EstadoFoto({ url, onEstado }) {
  const [estado, setEstado] = useState('cargando');
  useEffect(() => onEstado?.(estado), [estado, onEstado]);
  useEffect(() => {
    setEstado('cargando');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setEstado('listo');
    img.onerror = () => setEstado('error');
    img.src = url;
  }, [url]);
  if (estado === 'listo') return null;
  if (estado === 'error') {
    return (
      <div className="tour-mensaje">
        <b>No pudimos cargar la foto 360°.</b>
        <span>Revisa tu conexión o prueba con tu propia panorámica.</span>
      </div>
    );
  }
  return <Cargando />;
}
