import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useMateriales } from './muebles.jsx';
import { modeloPara } from './modelos.jsx';

// Recorrido 3D de DEMOSTRACIÓN. No tenemos planos reales de cada inmueble, así
// que se muestra uno de tres interiores genéricos, siempre el mismo para el
// mismo inmueble (ver modeloPara).
//
// Rendimiento: frameloop="demand" hace que el Canvas dibuje SOLO cuando algo
// cambia (arrastrar, zoom, giro automático) en vez de 60 veces por segundo.
// Con la escena quieta la GPU no trabaja y el celular no se calienta.

/**
 * Posición inicial de la cámara según el tamaño del plano y la forma del visor.
 * El campo de visión de la cámara es VERTICAL: en un celular en vertical (más
 * alto que ancho) el plano se cortaría a los lados, así que se aleja más.
 */
function vistaInicial(modelo, proporcion = 1.5) {
  const ajuste = Math.min(2.2, Math.max(1, 1.25 / proporcion));
  const d = Math.max(modelo.ancho, modelo.fondo) * 1.45 * ajuste;
  return { posicion: [d * 0.55, d * 0.8, d * 0.85], minimo: 3, maximo: d * 1.8 };
}

/**
 * OrbitControls de three.js montado a mano (como en el resto del proyecto, sin
 * la librería drei). Expone zoom/reinicio a los botones HTML por `apiRef`.
 */
function Controles({ modelo, autoGiro, onInteraccion, apiRef }) {
  const { camera, gl, invalidate } = useThree();
  const controles = useRef(null);

  useEffect(() => {
    // Se mide el canvas una sola vez al montar: recalcular en cada resize
    // movería la cámara mientras la persona la está usando.
    const { clientWidth, clientHeight } = gl.domElement;
    const vista = vistaInicial(modelo, clientWidth / Math.max(1, clientHeight));
    camera.position.set(...vista.posicion);
    const c = new OrbitControls(camera, gl.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.enablePan = false; // solo orbitar y zoom: más simple de usar
    c.minDistance = vista.minimo;
    c.maxDistance = vista.maximo;
    c.maxPolarAngle = 1.3; // no deja meter la cámara bajo el piso
    c.autoRotateSpeed = 0.7;
    c.target.set(0, 0.4, 0);
    c.update();

    const alCambiar = () => invalidate(); // pide un cuadro nuevo
    c.addEventListener('change', alCambiar);
    c.addEventListener('start', onInteraccion);
    controles.current = c;

    apiRef.current = {
      zoom(factor) {
        const desplazamiento = camera.position.clone().sub(c.target);
        const largo = Math.min(c.maxDistance, Math.max(c.minDistance, desplazamiento.length() * factor));
        camera.position.copy(c.target).add(desplazamiento.setLength(largo));
        c.update();
      },
      reiniciar() {
        camera.position.set(...vista.posicion);
        c.target.set(0, 0.4, 0);
        c.update();
      },
    };

    // Limpieza: quita listeners del canvas y libera los controles.
    return () => {
      c.removeEventListener('change', alCambiar);
      c.removeEventListener('start', onInteraccion);
      c.dispose();
      apiRef.current = null;
    };
  }, [camera, gl, invalidate, modelo, onInteraccion, apiRef]);

  useEffect(() => {
    if (!controles.current) return;
    controles.current.autoRotate = autoGiro;
    invalidate();
  }, [autoGiro, invalidate]);

  // Con frameloop "demand", useFrame solo corre cuando hay un cuadro pedido.
  // Mientras haya inercia (damping) o giro automático, se pide el siguiente.
  useFrame(() => {
    const c = controles.current;
    if (c && (c.update() || c.autoRotate)) invalidate();
  });

  return null;
}

function Escena({ modelo }) {
  const m = useMateriales();
  const { Escena: Interior, ancho, fondo } = modelo;
  const lado = Math.max(ancho, fondo);
  return (
    <>
      <color attach="background" args={['#e7efee']} />
      <hemisphereLight args={['#ffffff', '#b9c7c5', 1.6]} />
      <directionalLight
        position={[lado * 0.6, lado * 1.1, lado * 0.5]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-lado}
        shadow-camera-right={lado}
        shadow-camera-top={lado}
        shadow-camera-bottom={-lado}
        shadow-bias={-0.0005}
      />
      <Interior m={m} />
    </>
  );
}

/** Si el navegador no tiene WebGL, se muestra un mensaje en vez de romper la página. */
class SinWebGL extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="visor-mensaje">
          <b>Tu navegador no pudo abrir la vista 3D.</b>
          <span>Prueba con otro navegador o activa la aceleración por hardware.</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Visor3D({ idInmueble, titulo }) {
  const modelo = useMemo(() => modeloPara(idInmueble), [idInmueble]);
  const contenedor = useRef(null);
  const api = useRef(null);
  const [autoGiro, setAutoGiro] = useState(true);
  const [ayuda, setAyuda] = useState(true);
  const [completa, setCompleta] = useState(false);

  const alInteractuar = useCallback(() => {
    setAutoGiro(false);
    setAyuda(false);
  }, []);

  useEffect(() => {
    const onCambio = () => setCompleta(document.fullscreenElement === contenedor.current);
    document.addEventListener('fullscreenchange', onCambio);
    return () => document.removeEventListener('fullscreenchange', onCambio);
  }, []);

  const pantallaCompleta = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else contenedor.current.requestFullscreen?.().catch(() => {});
  };

  const accion = (fn) => () => {
    alInteractuar();
    fn();
  };

  return (
    <div className="visor3d" ref={contenedor}>
      <SinWebGL>
        <Canvas
          frameloop="demand"
          shadows
          dpr={[1, 1.75]}
          camera={{ fov: 40, near: 0.1, far: 200, position: vistaInicial(modelo).posicion }}
          gl={{ antialias: true }}
        >
          <Escena modelo={modelo} />
          <Controles modelo={modelo} autoGiro={autoGiro} onInteraccion={alInteractuar} apiRef={api} />
        </Canvas>
      </SinWebGL>

      <div className="visor-etiqueta">
        <span className="visor-badge">3D</span>
        <div>
          <strong>{modelo.nombre}</strong>
          <small>{modelo.detalle}</small>
        </div>
      </div>

      <p className="visor-aviso" role="note">
        <b>Demostración</b> Modelo ilustrativo: no corresponde a {titulo ? `«${titulo}»` : 'este inmueble'} ni a sus medidas reales.
      </p>

      {ayuda && (
        <div className="visor-ayuda" aria-hidden="true">
          Arrastra para girar · rueda o pellizca para acercar
        </div>
      )}

      <div className="visor-controles" role="toolbar" aria-label="Controles de la vista 3D">
        <button type="button" onClick={accion(() => api.current?.zoom(0.8))} aria-label="Acercar" title="Acercar">
          +
        </button>
        <button type="button" onClick={accion(() => api.current?.zoom(1.25))} aria-label="Alejar" title="Alejar">
          −
        </button>
        <button
          type="button"
          className={autoGiro ? 'on' : ''}
          onClick={() => setAutoGiro((a) => !a)}
          aria-pressed={autoGiro}
          aria-label={autoGiro ? 'Detener giro' : 'Girar solo'}
          title={autoGiro ? 'Detener giro' : 'Girar solo'}
        >
          ⟳
        </button>
        <button type="button" onClick={accion(() => api.current?.reiniciar())} aria-label="Volver a la vista inicial" title="Vista inicial">
          ⌂
        </button>
        <button type="button" onClick={pantallaCompleta} aria-label="Pantalla completa" title="Pantalla completa">
          {completa ? '⤡' : '⤢'}
        </button>
      </div>
    </div>
  );
}
