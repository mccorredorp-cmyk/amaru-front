// Ubicación de los inmuebles de Pereira (ciudad beta), por código SAE.
// La API todavía no trae coordenadas: se calcularon una sola vez con
// Nominatim (OpenStreetMap) a partir de la dirección. Las direcciones
// 'Calle X # Y-Z' se ubican en la esquina de la Calle X con la Carrera Y,
// así que el punto es aproximado (una cuadra a la redonda).
// Generado con scripts/geocodificar-pereira.mjs.

const SITIOS = [
  {
    codigos: ['290-102982'],
    lugar: 'Conjunto Ciudad Pereira',
    direccion: 'Calle 18 # 31-82, Conj. Res. Ciudad Pereira',
    referencia: 'barrio o conjunto Ciudad Pereira',
    lat: 4.794456,
    lng: -75.696587,
  },
  {
    codigos: ['290-24287'],
    lugar: 'Urbanización La Elvira',
    direccion: 'Calle 36 con Carrera 14, Urb. La Elvira',
    referencia: 'esquina de la Calle 36 con Carrera 14',
    lat: 4.811313,
    lng: -75.708916,
  },
  {
    codigos: ['290-150462'],
    lugar: 'Centro Comercial Lago Plaza',
    direccion: 'Calle 23 # 8-55, C.C. Lago Plaza, local 219',
    referencia: 'esquina de la Calle 23 con Carrera 8',
    lat: 4.814217,
    lng: -75.697646,
  },
  {
    codigos: ['290-120782', '290-120784', '290-120785', '290-120786', '290-120789', '290-120790', '290-120791', '290-120792'],
    lugar: 'Edificio Coferco',
    direccion: 'Carrera 11 con Calle 20 (esquina), Edificio Coferco',
    referencia: 'esquina de la Carrera 11 con Calle 20',
    lat: 4.811414,
    lng: -75.695417,
  },
  {
    codigos: ['290-60373'],
    lugar: 'Edificio Andros',
    direccion: 'Calle 15 # 13-39, Edificio Andros, local 101',
    referencia: 'esquina de la Calle 15 con Carrera 13',
    lat: 4.809028,
    lng: -75.691425,
  },
  {
    codigos: ['290-13639'],
    lugar: 'Calle 1 con Carrera 12',
    direccion: 'Calle 1 # 12-34',
    referencia: 'esquina de la Calle 1 con Carrera 12',
    lat: 4.808741,
    lng: -75.679607,
  },
  {
    codigos: ['290-78652'],
    lugar: 'Unidad Residencial Serrana',
    direccion: 'Unidad Residencial Serrana, bloque 5, apto 502',
    referencia: 'barrio o conjunto Serrana',
    lat: 4.799009,
    lng: -75.693236,
  },
  {
    codigos: ['290-14535'],
    lugar: 'Calle 14 con Carrera 13',
    direccion: 'Calle 14 # 13-32',
    referencia: 'esquina de la Calle 14 con Carrera 13',
    lat: 4.808789,
    lng: -75.690647,
  },
  {
    codigos: ['290-45559'],
    lugar: 'Avenida Circunvalar',
    direccion: 'Avenida Circunvalar # 6-11',
    referencia: 'esquina de la Avenida Circunvalar con Calle 6',
    lat: 4.806632,
    lng: -75.684198,
  },
  {
    codigos: ['290-59949'],
    lugar: 'Carrera 12A con Calle 24',
    direccion: 'Carrera 12A # 24-86, entre calles 24 y 25',
    referencia: 'esquina de la Carrera 12 con Calle 24',
    lat: 4.810938,
    lng: -75.69887,
  },
  {
    codigos: ['290-88416'],
    lugar: 'Conjunto Palma de Mallorca',
    direccion: 'Calle 8 # 12B-17, Conj. Palma de Mallorca, casa 25',
    referencia: 'esquina de la Calle 8 con Carrera 12B',
    lat: 4.807955,
    lng: -75.685575,
  },
];

/** { [codigo_sae]: { lugar, direccion, referencia, lat, lng } } */
export const UBICACIONES_PEREIRA = Object.fromEntries(
  SITIOS.flatMap(({ codigos, ...sitio }) => codigos.map((codigo) => [codigo, sitio])),
);
