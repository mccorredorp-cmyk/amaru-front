// Los tres interiores de demostración. Cada uno es una función que arma la
// escena con las piezas de muebles.jsx a partir de un plano (coordenadas en
// metros, centrado en 0,0). No representan inmuebles reales.
import {
  Alfombra,
  Armario,
  Caja,
  Cama,
  Cocina,
  Ducha,
  Escritorio,
  Inodoro,
  Isla,
  Lampara,
  Lavamanos,
  MesaCentro,
  MesaComedor,
  MesaNoche,
  MuebleTV,
  Nevera,
  Pared,
  Piso,
  Planta,
  Silla,
  Sofa,
} from './muebles.jsx';

const PI = Math.PI;

/** Paredes a partir de una lista de segmentos [x1, z1, x2, z2]. */
const Paredes = ({ m, segmentos }) =>
  segmentos.map(([x1, z1, x2, z2]) => <Pared key={`${x1},${z1},${x2},${z2}`} m={m} desde={[x1, z1]} hasta={[x2, z2]} />);

/** Losa bajo la vivienda y el entorno (jardín para casas, plataforma gris para apartamentos). */
function Base({ m, ancho, fondo, entorno }) {
  return (
    <>
      {/* La losa termina 5 mm bajo el piso para que no "parpadeen" (z-fighting). */}
      <Caja y={-0.15} w={ancho + 0.3} h={0.145} d={fondo + 0.3} m={m.losa} sombra={false} />
      <mesh position={[0, -0.16, 0]} rotation-x={-PI / 2} material={entorno === 'jardin' ? m.cesped : m.terreno} receiveShadow>
        <circleGeometry args={[Math.max(ancho, fondo) * 1.4, 48]} />
      </mesh>
    </>
  );
}

// ---------------------------------------------------------------------------
// 1. Apartaestudio (6 x 5 m): todo en un ambiente, con baño aparte.
// ---------------------------------------------------------------------------
function Estudio({ m }) {
  return (
    <>
      <Base m={m} ancho={6} fondo={5} entorno="edificio" />
      <Piso m={m} zona={[-3, -2.5, 3, 2.5]} />
      <Piso m={m} zona={[1.2, -2.5, 3, -0.6]} material="baldosa" y={0.004} />
      <Piso m={m} zona={[-0.7, -2.5, 1.2, -1.5]} material="baldosa" y={0.004} />
      <Paredes
        m={m}
        segmentos={[
          [-3, -2.5, 3, -2.5],
          [-3, -2.5, -3, 2.5],
          [3, -2.5, 3, 2.5],
          [-3, 2.5, 0.6, 2.5], // hueco = puerta de entrada
          [1.5, 2.5, 3, 2.5],
          [1.2, -2.5, 1.2, -0.6], // baño
          [1.2, -0.6, 1.8, -0.6],
          [2.6, -0.6, 3, -0.6],
        ]}
      />

      {/* Zona de dormir */}
      <Cama m={m} x={-1.95} z={-1.44} ancho={1.4} />
      <MesaNoche m={m} x={-0.9} z={-2.2} />
      <Armario m={m} x={-2.64} z={0.7} rot={PI / 2} ancho={1.2} />

      {/* Cocineta y comedor */}
      <Cocina m={m} x={0.25} z={-2.14} largo={1.6} />
      <MesaComedor m={m} x={-0.3} z={-0.35} largo={0.9} fondo={0.7} sillas={2} />

      {/* Sala */}
      <Alfombra m={m} x={1.3} z={1.1} w={1.9} d={2.2} />
      <Sofa m={m} x={0.25} z={1.1} rot={PI / 2} ancho={1.8} />
      <MesaCentro m={m} x={1.35} z={1.1} rot={PI / 2} />
      <MuebleTV m={m} x={2.72} z={1.1} rot={-PI / 2} ancho={1.4} />
      <Lampara m={m} x={0.3} z={2.15} />
      <Planta m={m} x={-2.6} z={2.1} />

      {/* Baño */}
      <Ducha m={m} x={2.45} z={-1.95} />
      <Inodoro m={m} x={1.6} z={-2.15} />
      <Lavamanos m={m} x={1.5} z={-1.15} rot={PI / 2} />
    </>
  );
}

// ---------------------------------------------------------------------------
// 2. Apartamento de dos habitaciones (9 x 7 m).
// ---------------------------------------------------------------------------
function Apartamento({ m }) {
  return (
    <>
      <Base m={m} ancho={9} fondo={7} entorno="edificio" />
      <Piso m={m} zona={[-4.5, -3.5, 4.5, 3.5]} />
      <Piso m={m} zona={[-1, -3.5, 1.2, -1.5]} material="baldosa" y={0.004} />
      <Piso m={m} zona={[1.2, -3.5, 4.5, -0.9]} material="baldosa" y={0.004} />
      <Paredes
        m={m}
        segmentos={[
          [-4.5, -3.5, 4.5, -3.5],
          [-4.5, -3.5, -4.5, 3.5],
          [4.5, -3.5, 4.5, 3.5],
          [-4.5, 3.5, 2, 3.5], // hueco = entrada
          [3, 3.5, 4.5, 3.5],
          [-4.5, 0, -1, 0], // entre habitaciones
          [-1, -3.5, -1, -1], // habitación 1 (puerta de -1 a -0.2)
          [-1, -0.2, -1, 0.2],
          [-1, 1, -1, 3.5], // habitación 2 (puerta de 0.2 a 1)
          [1.2, -3.5, 1.2, -1.5], // baño
          [-1, -1.5, -0.4, -1.5],
          [0.4, -1.5, 1.2, -1.5],
        ]}
      />

      {/* Habitación principal */}
      <Cama m={m} x={-3.44} z={-1.75} rot={PI / 2} />
      <MesaNoche m={m} x={-4.15} z={-2.9} />
      <MesaNoche m={m} x={-4.15} z={-0.6} />
      <Armario m={m} x={-1.95} z={-3.14} ancho={1.4} />

      {/* Segunda habitación */}
      <Cama m={m} x={-3.44} z={2.6} rot={PI / 2} ancho={1} />
      <Escritorio m={m} x={-2.2} z={0.4} />
      <Silla m={m} x={-2.2} z={1.0} rot={PI} />
      <Planta m={m} x={-1.45} z={3.1} />

      {/* Baño */}
      <Ducha m={m} x={-0.45} z={-2.95} />
      <Inodoro m={m} x={0.75} z={-3.15} />
      <Lavamanos m={m} x={0.92} z={-2.05} rot={-PI / 2} />

      {/* Cocina abierta */}
      <Cocina m={m} x={2.85} z={-3.14} largo={2.6} />
      <Nevera m={m} x={4.08} z={-2.05} rot={-PI / 2} />
      <Isla m={m} x={2.7} z={-1.75} />

      {/* Sala y comedor */}
      <MesaComedor m={m} x={-0.05} z={1.85} largo={1.2} fondo={0.8} sillas={4} />
      <Alfombra m={m} x={2.75} z={1.7} w={2.3} d={2.8} />
      <Sofa m={m} x={1.55} z={1.7} rot={PI / 2} ancho={2.2} />
      <MesaCentro m={m} x={2.75} z={1.7} rot={PI / 2} />
      <MuebleTV m={m} x={4.24} z={1.7} rot={-PI / 2} />
      <Lampara m={m} x={1.5} z={3.05} />
      <Planta m={m} x={4.05} z={3.05} />
    </>
  );
}

// ---------------------------------------------------------------------------
// 3. Casa con sala-comedor amplia, cocina en L y terraza (11 x 8 m).
// ---------------------------------------------------------------------------
function Casa({ m }) {
  return (
    <>
      <Base m={m} ancho={11} fondo={8} entorno="jardin" />
      <Piso m={m} zona={[-5.5, -4, 5.5, 4]} />
      <Piso m={m} zona={[-5.5, 0.5, -3.3, 4]} material="baldosa" y={0.004} />
      <Piso m={m} zona={[2, -4, 5.5, -1.1]} material="baldosa" y={0.004} />
      {/* Terraza de madera frente a la entrada */}
      <Caja x={2} y={-0.15} z={4.95} w={5} h={0.13} d={1.6} m={m.deck} />
      <Paredes
        m={m}
        segmentos={[
          [-5.5, -4, 5.5, -4],
          [-5.5, -4, -5.5, 4],
          [5.5, -4, 5.5, 4],
          [-5.5, 4, 0.5, 4], // hueco = puerta principal (0.5 a 1.7)
          [1.7, 4, 3, 4], // hueco = ventanal (3 a 4.8)
          [4.8, 4, 5.5, 4],
          [-1.5, -4, -1.5, -0.6], // habitación (puerta de -0.6 a 0.3)
          [-1.5, 0.3, -1.5, 0.5],
          [-5.5, 0.5, -1.5, 0.5],
          [-3.3, 0.5, -3.3, 2], // baño / estudio (puerta de 2 a 2.8)
          [-3.3, 2.8, -3.3, 4],
          [-1.5, 0.5, -1.5, 1], // estudio (puerta de 1 a 1.9)
          [-1.5, 1.9, -1.5, 4],
        ]}
      />
      {/* Vidrio del ventanal */}
      <Caja x={3.9} y={0} z={4} w={1.8} h={1.25} d={0.03} m={m.vidrio} sombra={false} />

      {/* Habitación principal */}
      <Cama m={m} x={-3.5} z={-2.95} ancho={1.8} />
      <MesaNoche m={m} x={-4.75} z={-3.6} />
      <MesaNoche m={m} x={-2.25} z={-3.6} />
      <Armario m={m} x={-5.14} z={-0.6} rot={PI / 2} ancho={1.8} />
      <Alfombra m={m} x={-3.5} z={-1.3} w={2.4} d={1.2} />
      <Lampara m={m} x={-1.9} z={-3.6} />

      {/* Baño */}
      <Ducha m={m} x={-4.95} z={3.45} />
      <Inodoro m={m} x={-3.95} z={3.65} rot={PI} />
      <Lavamanos m={m} x={-5.14} z={1.3} rot={PI / 2} />

      {/* Estudio */}
      <Escritorio m={m} x={-2.4} z={3.64} rot={PI} />
      <Silla m={m} x={-2.4} z={3.0} />
      <Armario m={m} x={-2.4} z={0.74} ancho={1.2} fondo={0.35} alto={1.6} />

      {/* Cocina en L */}
      <Nevera m={m} x={2.45} z={-3.59} />
      <Cocina m={m} x={4.15} z={-3.64} largo={2.5} />
      <Cocina m={m} x={5.14} z={-2.5} rot={-PI / 2} largo={1.6} />
      <Isla m={m} x={3.4} z={-1.95} />

      {/* Comedor para seis */}
      <MesaComedor m={m} x={0.2} z={-2.0} largo={2} fondo={1} sillas={6} />
      <Planta m={m} x={-1.0} z={-3.55} />

      {/* Sala */}
      <Alfombra m={m} x={3.4} z={2.0} w={2.6} d={3.0} />
      <Sofa m={m} x={1.95} z={2.0} rot={PI / 2} ancho={2.6} />
      <Sofa m={m} x={3.6} z={3.42} rot={PI} ancho={1.6} color="naranja" />
      <MesaCentro m={m} x={3.4} z={2.0} rot={PI / 2} />
      <MuebleTV m={m} x={5.24} z={2.0} rot={-PI / 2} />
      <Lampara m={m} x={1.9} z={0.4} />
      <Planta m={m} x={-1.0} z={3.55} />
      <Planta m={m} x={0.1} z={5.0} />
      <Planta m={m} x={4.2} z={5.0} />
    </>
  );
}

export const MODELOS = [
  { id: 'estudio', nombre: 'Apartaestudio', detalle: 'Un ambiente con cocina abierta y baño', ancho: 6, fondo: 5, Escena: Estudio },
  { id: 'apartamento', nombre: 'Apartamento de 2 habitaciones', detalle: 'Sala-comedor, cocina con isla y un baño', ancho: 9, fondo: 7, Escena: Apartamento },
  { id: 'casa', nombre: 'Casa con sala-comedor', detalle: 'Habitación, estudio, cocina en L y terraza', ancho: 11, fondo: 8, Escena: Casa },
];

/**
 * Modelo de un inmueble, elegido de forma DETERMINÍSTICA por su id: el mismo
 * inmueble siempre muestra el mismo interior. El hash (multiplicar por una
 * constante grande y quedarse con 32 bits) reparte ids seguidos entre los tres.
 */
export function modeloPara(idInmueble) {
  const hash = Math.imul(Number(idInmueble) || 0, 2654435761) >>> 0;
  return MODELOS[hash % MODELOS.length];
}
