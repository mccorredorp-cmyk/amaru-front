// Piezas básicas del recorrido 3D, hechas SOLO con geometrías de Three.js
// (cajas y cilindros). No se descarga ningún modelo: todo se arma en el
// navegador, pesa unos pocos KB y carga al instante.
//
// Convenciones (unidades en metros):
//  - x: izquierda/derecha, z: fondo/frente, y: altura. El piso está en y = 0.
//  - Cada mueble se dibuja "mirando" hacia +z; su espalda queda en -z.
//    Para girarlo se usa `rot` (radianes sobre el eje y):
//      rot = 0 → mira a +z · Math.PI → mira a -z
//      rot = Math.PI / 2 → mira a +x · -Math.PI / 2 → mira a -x
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

export const ALTO_PARED = 1.25; // paredes "cortadas" para ver el interior desde arriba
export const GROSOR_PARED = 0.12;

/** Textura de piso de madera dibujada en un canvas (sin descargar imágenes). */
function texturaMadera() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  const tonos = ['#d2ad85', '#c9a27a', '#d8b48d', '#c59c72'];
  for (let i = 0; i < 8; i++) {
    g.fillStyle = tonos[i % tonos.length];
    g.fillRect(0, i * 32, 256, 32);
    g.fillStyle = 'rgba(70, 45, 20, 0.12)';
    g.fillRect(0, i * 32, 256, 2); // junta entre tablas
    g.fillRect((i * 97) % 256, i * 32, 2, 32); // junta de punta
  }
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = THREE.RepeatWrapping;
  textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(3, 3);
  textura.anisotropy = 4;
  return textura;
}

/**
 * Materiales compartidos por todas las piezas. Se crean UNA vez y se reutilizan
 * (cientos de mallas con ~15 materiales en vez de cientos de materiales).
 * Como se pasan por prop y no como hijos JSX, React Three Fiber no los libera
 * solo: el efecto de limpieza llama dispose() al desmontar para liberar la GPU.
 */
export function useMateriales() {
  const recursos = useMemo(() => {
    const madera = texturaMadera();
    const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
    return {
      texturas: [madera],
      m: {
        piso: new THREE.MeshStandardMaterial({ map: madera, roughness: 0.75 }),
        baldosa: std('#e3e8ea', { roughness: 0.45 }),
        pared: std('#f6f3ee'),
        losa: std('#d6cfc4'),
        terreno: std('#dfe6e4'),
        cesped: std('#bcd7ae'),
        deck: std('#b98a5e'),
        turquesa: std('#0e8f8c'),
        turquesaClaro: std('#8fd0cc'),
        naranja: std('#f28c28'),
        tinta: std('#1f2d3a', { roughness: 0.4 }),
        blanco: std('#fbfbfa', { roughness: 0.5 }),
        textil: std('#ece6dc'),
        alfombra: std('#f4dcc2'),
        maderaClara: std('#caa074'),
        maderaOscura: std('#7b5137'),
        meson: std('#3b4a57', { roughness: 0.35 }),
        metal: std('#aeb7bf', { roughness: 0.3, metalness: 0.6 }),
        vidrio: new THREE.MeshStandardMaterial({ color: '#bfe3f0', transparent: true, opacity: 0.3, roughness: 0.1 }),
        hojas: std('#4f9d5d'),
        maceta: std('#b8714a'),
      },
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(recursos.m).forEach((material) => material.dispose());
      recursos.texturas.forEach((textura) => textura.dispose());
    },
    [recursos],
  );

  return recursos.m;
}

/**
 * Caja apoyada en `y` (su base, no su centro): es más fácil pensar
 * "una mesa de 0.72 m de alto" que calcular centros.
 * La geometría va como hijo JSX, así R3F la libera al desmontar.
 */
export function Caja({ x = 0, y = 0, z = 0, w, h, d, m, sombra = true }) {
  return (
    <mesh position={[x, y + h / 2, z]} material={m} castShadow={sombra} receiveShadow>
      <boxGeometry args={[w, h, d]} />
    </mesh>
  );
}

function Cilindro({ x = 0, y = 0, z = 0, r, h, m, arriba = r }) {
  return (
    <mesh position={[x, y + h / 2, z]} material={m} castShadow receiveShadow>
      <cylinderGeometry args={[arriba, r, h, 20]} />
    </mesh>
  );
}

/** Grupo posicionado y girado: así cada mueble se diseña en su propio origen. */
const Lugar = ({ x, z, rot = 0, children }) => (
  <group position={[x, 0, z]} rotation-y={rot}>
    {children}
  </group>
);

// ---------------------------------------------------------------------------
// Muebles
// ---------------------------------------------------------------------------

export function Cama({ m, ancho = 1.6, largo = 2, ...lugar }) {
  const doble = ancho > 1.2;
  return (
    <Lugar {...lugar}>
      <Caja y={0} w={ancho} h={0.3} d={largo} m={m.maderaOscura} />
      <Caja y={0.3} z={0.03} w={ancho - 0.06} h={0.2} d={largo - 0.1} m={m.blanco} />
      <Caja y={0.5} z={largo * 0.18} w={ancho + 0.02} h={0.04} d={largo * 0.62} m={m.turquesa} />
      <Caja y={0} z={-largo / 2 + 0.04} w={ancho + 0.1} h={1} d={0.08} m={m.maderaOscura} />
      {doble ? (
        <>
          <Caja x={-ancho / 4} y={0.5} z={-largo / 2 + 0.3} w={ancho / 2 - 0.15} h={0.12} d={0.35} m={m.textil} />
          <Caja x={ancho / 4} y={0.5} z={-largo / 2 + 0.3} w={ancho / 2 - 0.15} h={0.12} d={0.35} m={m.textil} />
        </>
      ) : (
        <Caja y={0.5} z={-largo / 2 + 0.3} w={ancho - 0.25} h={0.12} d={0.35} m={m.textil} />
      )}
    </Lugar>
  );
}

export function MesaNoche({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja w={0.45} h={0.5} d={0.4} m={m.maderaClara} />
      <Cilindro y={0.5} r={0.08} h={0.25} m={m.naranja} arriba={0.12} />
    </Lugar>
  );
}

export function Sofa({ m, ancho = 2.2, color = 'turquesa', ...lugar }) {
  const tela = m[color];
  return (
    <Lugar {...lugar}>
      <Caja z={0.05} w={ancho} h={0.42} d={0.85} m={tela} />
      <Caja z={-0.33} w={ancho} h={0.85} d={0.2} m={tela} />
      <Caja x={-(ancho / 2 - 0.1)} w={0.2} h={0.62} d={0.9} m={tela} />
      <Caja x={ancho / 2 - 0.1} w={0.2} h={0.62} d={0.9} m={tela} />
      <Caja x={-ancho / 4 + 0.05} y={0.42} z={0.08} w={ancho / 2 - 0.3} h={0.1} d={0.6} m={m.turquesaClaro} />
      <Caja x={ancho / 4 - 0.05} y={0.42} z={0.08} w={ancho / 2 - 0.3} h={0.1} d={0.6} m={m.turquesaClaro} />
      <Caja x={ancho / 2 - 0.45} y={0.48} z={-0.15} w={0.35} h={0.32} d={0.12} m={m.naranja} />
    </Lugar>
  );
}

export function MesaCentro({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja w={0.75} h={0.36} d={0.4} m={m.maderaOscura} />
      <Caja y={0.36} w={1.0} h={0.05} d={0.55} m={m.maderaClara} />
    </Lugar>
  );
}

export function Alfombra({ m, w, d, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja y={0.005} w={w} h={0.015} d={d} m={m.alfombra} sombra={false} />
    </Lugar>
  );
}

export function MuebleTV({ m, ancho = 1.8, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja w={ancho} h={0.45} d={0.4} m={m.blanco} />
      <Caja y={0.5} z={-0.08} w={1.25} h={0.72} d={0.05} m={m.tinta} />
    </Lugar>
  );
}

export function Silla({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja w={0.42} h={0.45} d={0.42} m={m.maderaOscura} />
      <Caja y={0.45} z={-0.19} w={0.42} h={0.45} d={0.04} m={m.maderaOscura} />
    </Lugar>
  );
}

/** Mesa de comedor con sillas repartidas a lo largo de los dos lados largos. */
export function MesaComedor({ m, largo = 1.6, fondo = 0.9, sillas = 4, ...lugar }) {
  const porLado = Math.max(1, Math.round(sillas / 2));
  const paso = largo / porLado;
  const xs = Array.from({ length: porLado }, (_, i) => -largo / 2 + paso * (i + 0.5));
  const patas = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * (largo / 2 - 0.08), sz * (fondo / 2 - 0.08)]));
  return (
    <Lugar {...lugar}>
      <Caja y={0.72} w={largo} h={0.05} d={fondo} m={m.maderaClara} />
      {patas.map(([px, pz]) => (
        <Caja key={`${px}${pz}`} x={px} z={pz} w={0.06} h={0.72} d={0.06} m={m.maderaOscura} />
      ))}
      {xs.map((sx) => (
        <group key={sx}>
          <Silla m={m} x={sx} z={-(fondo / 2 + 0.28)} rot={0} />
          <Silla m={m} x={sx} z={fondo / 2 + 0.28} rot={Math.PI} />
        </group>
      ))}
    </Lugar>
  );
}

export function Cocina({ m, largo = 2.4, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja w={largo} h={0.88} d={0.6} m={m.blanco} />
      <Caja y={0.88} w={largo + 0.02} h={0.04} d={0.62} m={m.meson} />
      <Caja x={largo * 0.22} y={0.92} w={0.58} h={0.01} d={0.5} m={m.tinta} />
      <Caja x={-largo * 0.2} y={0.9} w={0.5} h={0.025} d={0.4} m={m.metal} />
    </Lugar>
  );
}

export function Nevera({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja w={0.75} h={1.8} d={0.7} m={m.metal} />
    </Lugar>
  );
}

export function Isla({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja w={1.6} h={0.9} d={0.8} m={m.turquesa} />
      <Caja y={0.9} w={1.7} h={0.04} d={0.9} m={m.meson} />
      <Cilindro x={-0.4} z={0.7} r={0.18} h={0.65} m={m.maderaOscura} />
      <Cilindro x={0.4} z={0.7} r={0.18} h={0.65} m={m.maderaOscura} />
    </Lugar>
  );
}

export function Escritorio({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja y={0.72} w={1.2} h={0.04} d={0.6} m={m.maderaClara} />
      <Caja x={-0.57} w={0.05} h={0.72} d={0.6} m={m.maderaClara} />
      <Caja x={0.57} w={0.05} h={0.72} d={0.6} m={m.maderaClara} />
      <Caja y={0.76} z={-0.15} w={0.55} h={0.35} d={0.04} m={m.tinta} />
    </Lugar>
  );
}

export function Armario({ m, ancho = 1.6, fondo = 0.6, alto = 1.9, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja w={ancho} h={alto} d={fondo} m={m.maderaClara} />
      <Caja y={alto * 0.45} z={fondo / 2 + 0.01} w={0.02} h={0.3} d={0.02} m={m.metal} />
    </Lugar>
  );
}

export function Inodoro({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja z={0.05} w={0.4} h={0.4} d={0.5} m={m.blanco} />
      <Caja z={-0.22} w={0.42} h={0.78} d={0.18} m={m.blanco} />
    </Lugar>
  );
}

export function Lavamanos({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja w={0.7} h={0.8} d={0.45} m={m.maderaClara} />
      <Caja y={0.8} w={0.72} h={0.06} d={0.47} m={m.blanco} />
    </Lugar>
  );
}

export function Ducha({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Caja w={0.9} h={0.05} d={0.9} m={m.blanco} />
      <Caja x={0.44} y={0.05} w={0.02} h={1.15} d={0.9} m={m.vidrio} sombra={false} />
    </Lugar>
  );
}

export function Planta({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Cilindro r={0.16} arriba={0.2} h={0.38} m={m.maceta} />
      <mesh position={[0, 0.7, 0]} material={m.hojas} castShadow>
        <icosahedronGeometry args={[0.32, 1]} />
      </mesh>
    </Lugar>
  );
}

export function Lampara({ m, ...lugar }) {
  return (
    <Lugar {...lugar}>
      <Cilindro r={0.16} h={0.04} m={m.tinta} />
      <Cilindro r={0.02} h={1.35} m={m.metal} />
      <Cilindro y={1.3} r={0.24} arriba={0.12} h={0.3} m={m.naranja} />
    </Lugar>
  );
}

// ---------------------------------------------------------------------------
// Estructura: pisos y paredes
// ---------------------------------------------------------------------------

/** Pared entre dos puntos del plano. Las puertas son huecos entre segmentos. */
export function Pared({ m, desde, hasta }) {
  const [x1, z1] = desde;
  const [x2, z2] = hasta;
  const largo = Math.hypot(x2 - x1, z2 - z1) + GROSOR_PARED; // + grosor: esquinas cerradas
  const angulo = -Math.atan2(z2 - z1, x2 - x1);
  return (
    <mesh position={[(x1 + x2) / 2, ALTO_PARED / 2, (z1 + z2) / 2]} rotation-y={angulo} material={m.pared} castShadow receiveShadow>
      <boxGeometry args={[largo, ALTO_PARED, GROSOR_PARED]} />
    </mesh>
  );
}

/** Rectángulo de piso [x1, z1, x2, z2] con un material (madera, baldosa…). */
export function Piso({ m, zona, material = 'piso', y = 0 }) {
  const [x1, z1, x2, z2] = zona;
  return (
    <mesh position={[(x1 + x2) / 2, y, (z1 + z2) / 2]} rotation-x={-Math.PI / 2} material={m[material]} receiveShadow>
      <planeGeometry args={[x2 - x1, z2 - z1]} />
    </mesh>
  );
}
