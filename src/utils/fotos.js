// Fotos de referencia para los inmuebles que todavía no tienen fotos propias
// (los 1365 importados del CSV no traen ninguna). Las fotos reales que sube el
// dueño viven en Supabase Storage y SIEMPRE tienen prioridad sobre estas.
//
// Cómo funciona:
//  1. `categoria(tipo)` agrupa los 18 tipos del catálogo en 12 categorías
//     visuales (un "Parqueadero Privado" y un "Garaje" se ven igual).
//  2. Cada categoría tiene varias fotos revisadas a mano (Unsplash, licencia
//     libre) para que dos inmuebles vecinos del mismo tipo no se vean idénticos.
//  3. La foto se elige con un hash del id: es determinística (el mismo inmueble
//     siempre muestra la misma) pero ids seguidos no caen en fotos seguidas.

const u = (id, ancho = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${ancho}&q=70`;

const CATEGORIAS = {
  apartamento: {
    nombre: 'Apartamento',
    fotos: [
      '1522708323590-d24dbb6b0267',
      '1502672260266-1c1ef2d93688',
      '1560448204-e02f11c3d0e2',
      '1484154218962-a197022b5858',
      '1493809842364-78817add7ffb',
      '1536376072261-38c75010e6c9',
      '1545324418-cc1a3fa10c00',
      '1460317442991-0ec209397118',
    ],
  },
  casa: {
    nombre: 'Casa',
    fotos: [
      '1568605114967-8130f3a36994',
      '1600585154340-be6161a56a0c',
      '1512917774080-9991f1c4c750',
      '1600607687939-ce8a6c25118c',
      '1570129477492-45c003edd2be',
      '1564013799919-ab600027ffc6',
      '1580587771525-78b9dba3b914',
      '1605276374104-dee2a0ed3cd6',
    ],
  },
  recreo: {
    nombre: 'Casa de recreo',
    fotos: ['1613490493576-7fde63acd811', '1512917774080-9991f1c4c750', '1564013799919-ab600027ffc6'],
  },
  finca: {
    nombre: 'Finca',
    fotos: ['1500076656116-558758c991c1', '1523741543316-beb7fc7023d8', '1500382017468-9049fed747ef'],
  },
  lote: {
    nombre: 'Lote',
    fotos: ['1500382017468-9049fed747ef', '1523741543316-beb7fc7023d8', '1500076656116-558758c991c1'],
  },
  local: {
    nombre: 'Local comercial',
    fotos: [
      '1441986300917-64674bd600d8',
      '1555396273-367ea4eb4db5',
      '1604719312566-8912e9227c6a',
      '1528698827591-e19ccd7bc23d',
      '1567401893414-76b7b1e5a7a5',
    ],
  },
  oficina: {
    nombre: 'Oficina',
    fotos: [
      '1497366216548-37526070297c',
      '1497366811353-6870744d04b2',
      '1524758631624-e2822e304c36',
      '1497215728101-856f4ea42174',
      '1556761175-4b46a572b786',
      '1604328698692-f76ea9498e76',
    ],
  },
  consultorio: {
    nombre: 'Consultorio',
    fotos: ['1519494026892-80bbd2d6fd0d', '1629909613654-28e377c37b09'],
  },
  parqueadero: {
    nombre: 'Parqueadero',
    fotos: [
      '1506521781263-d8422e82f27a',
      '1590674899484-d5640e854abe',
      '1573348722427-f1d6819fdf98',
      '1545179605-1296651e9d43',
    ],
  },
  bodega: {
    nombre: 'Bodega',
    fotos: ['1586528116311-ad8dd3c8310d', '1553413077-190dd305871c', '1565610222536-ef125c59da2e'],
  },
  habitacion: {
    nombre: 'Habitación',
    fotos: [
      '1505693416388-ac5ce068fe85',
      '1566665797739-1674de7a421a',
      '1611892440504-42a792e24d32',
      '1582719478250-c89cae4dc85b',
    ],
  },
  edificio: {
    nombre: 'Edificio',
    fotos: ['1486406146926-c627a92ad1ab', '1574362848149-11496d93a7c7', '1515263487990-61b07816b324'],
  },
};

/** Tipo del catálogo (p. ej. "Parqueadero Privado") → clave de CATEGORIAS. */
export function categoria(tipo = '') {
  const t = tipo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  // El orden importa: "casa recreo" y "casa lote" contienen "casa".
  if (t.includes('apartamento') || t.includes('apartaestudio')) return 'apartamento';
  if (t.includes('recreo')) return 'recreo';
  if (t.includes('finca')) return 'finca';
  if (t.includes('casa')) return 'casa';
  if (t.includes('lote') || t.includes('isla') || t.includes('terreno')) return 'lote';
  if (t.includes('local')) return 'local';
  if (t.includes('consultorio')) return 'consultorio';
  if (t.includes('oficina')) return 'oficina';
  if (t.includes('garaje') || t.includes('parqueadero')) return 'parqueadero';
  if (t.includes('bodega') || t.includes('deposito')) return 'bodega';
  if (t.includes('habitacion')) return 'habitacion';
  if (t.includes('edificio') || t.includes('edificacion') || t.includes('hotel')) return 'edificio';
  return 'casa';
}

/** Hash entero simple (Knuth): reparte ids consecutivos entre las fotos. */
const mezclar = (id) => Math.imul(Number(id) || 0, 2654435761) >>> 0;

/** Foto de referencia de la tarjeta: siempre la misma para el mismo inmueble. */
export function fotoReferencia(tipo, id) {
  const { fotos } = CATEGORIAS[categoria(tipo)];
  return u(fotos[mezclar(id) % fotos.length]);
}

/**
 * Galería de referencia para el detalle: hasta `cantidad` fotos distintas de la
 * misma categoría, empezando por la de la tarjeta para que coincidan.
 */
export function galeriaReferencia(tipo, id, cantidad = 4) {
  const { fotos } = CATEGORIAS[categoria(tipo)];
  const inicio = mezclar(id) % fotos.length;
  return Array.from({ length: Math.min(cantidad, fotos.length) }, (_, i) => {
    const foto = fotos[(inicio + i) % fotos.length];
    return { id: `ref-${foto}`, url: u(foto, 1400), miniatura_url: u(foto, 240), referencia: true };
  });
}

/** Nombre legible de la categoría ("Parqueadero") para las etiquetas. */
export const nombreCategoria = (tipo) => CATEGORIAS[categoria(tipo)].nombre;
