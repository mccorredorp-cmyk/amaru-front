// Utilidades de formato para mostrar los datos de la API.

const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export const formatoCOP = (valor) => (valor ? cop.format(valor).replace(/\s/g, ' ') : 'Precio a convenir');

export function formatoCorto(valor) {
  if (!valor) return '—';
  if (valor >= 1_000_000) return `$${(valor / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`;
  return `$${Math.round(valor / 1000)}k`;
}

export const formatoArea = (area) =>
  area ? `${Number(area).toLocaleString('es-CO', { maximumFractionDigits: 1 })} m²` : null;

/** Los nombres del CSV vienen en MAYÚSCULAS: los pasamos a tipo oración. */
export function capitalizar(texto) {
  if (!texto) return '';
  const letras = texto.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (letras && letras !== letras.toUpperCase()) return texto;
  return texto.toLowerCase().replace(/(^|[\s(-])([a-záéíóúñ])/g, (_, a, b) => a + b.toUpperCase());
}

export const fechaCorta = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/** Normaliza para comparar nombres sin tildes ni mayúsculas. */
export const normalizar = (texto = '') =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Traducción amable de las alertas de calidad de datos del CSV. */
const ALERTAS = {
  ciudad_desconocida: 'La ciudad exacta no está registrada',
  precio_invalido: 'El precio original no era válido',
  precio_atipico_para_su_tipo: 'Precio inusual para este tipo de inmueble',
  garaje_con_precio_alto: 'Precio alto para un garaje',
  area_muy_pequena_para_vivienda: 'Área muy pequeña para una vivienda',
  precio_por_m2_atipico: 'Precio por m² inusual',
  sin_contacto: 'No tiene contacto registrado',
  contacto_es_una_regional: 'El contacto es una oficina regional',
  correo_de_otro_contacto: 'El correo podría ser de otra persona',
  telefono_8_digitos: 'Teléfono sin indicativo de región',
  direccion_incompleta: 'La dirección está incompleta',
};
export const textoAlerta = (codigo) => ALERTAS[codigo] ?? codigo.replaceAll('_', ' ');
