// Fotos de referencia (Unsplash) para inmuebles que aún no tienen fotos
// subidas. Se elige una según el tipo y el id, para que siempre sea la misma.
import { normalizar } from './formato.js';

const u = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

const POR_TIPO = {
  apartamento: ['1522708323590-d24dbb6b0267', '1502672260266-1c1ef2d93688', '1560448204-e02f11c3d0e2', '1484154218962-a197022b5858'],
  casa: ['1568605114967-8130f3a36994', '1600585154340-be6161a56a0c', '1512917774080-9991f1c4c750', '1600607687939-ce8a6c25118c'],
  local: ['1441986300917-64674bd600d8'],
  oficina: ['1497366216548-37526070297c'],
  garaje: ['1506521781263-d8422e82f27a'],
  lote: ['1500382017468-9049fed747ef'],
  bodega: ['1586528116311-ad8dd3c8310d'],
  habitacion: ['1505693416388-ac5ce068fe85'],
};

function grupo(tipo) {
  const t = normalizar(tipo);
  if (t.includes('apartamento')) return 'apartamento';
  if (t.includes('local') || t.includes('consultorio')) return 'local';
  if (t.includes('oficina') || t.includes('edificio')) return 'oficina';
  if (t.includes('garaje') || t.includes('parqueadero')) return 'garaje';
  if (t.includes('lote') || t.includes('finca') || t.includes('isla')) return 'lote';
  if (t.includes('bodega') || t.includes('deposito')) return 'bodega';
  if (t.includes('habitacion') || t.includes('hotel')) return 'habitacion';
  return 'casa';
}

export function fotoReferencia(tipo, id) {
  const lista = POR_TIPO[grupo(tipo)];
  return u(lista[id % lista.length]);
}
