// Funciones de cada recurso de la API (rutas relativas a /api/v1).
import { pedir } from './cliente.js';

// ---------- Inmuebles ----------
export const listarInmuebles = (filtros, senal) => pedir('/inmuebles', { query: filtros, senal });
export const obtenerInmueble = (id) => pedir(`/inmuebles/${id}`).then((r) => r.inmueble);
export const publicarInmueble = (datos) => pedir('/inmuebles', { metodo: 'POST', cuerpo: datos }).then((r) => r.inmueble);

export function subirImagenes(idInmueble, archivos) {
  const form = new FormData();
  archivos.forEach((archivo) => form.append('imagenes', archivo));
  return pedir(`/inmuebles/${idInmueble}/imagenes`, { metodo: 'POST', archivos: form }).then((r) => r.data);
}

// ---------- Catálogos (públicos, con caché del navegador de 5 min) ----------
export const listarDepartamentos = () => pedir('/departamentos').then((r) => r.data);
export const listarCiudades = (departamento) => pedir('/ciudades', { query: { departamento } }).then((r) => r.data);
export const listarTipos = () => pedir('/tipos-inmueble').then((r) => r.data);

// ---------- Autenticación ----------
export const sesionActual = () => pedir('/auth/me').then((r) => r.usuario);
export const iniciarSesion = (email, password) =>
  pedir('/auth/login', { metodo: 'POST', cuerpo: { email, password } }).then((r) => r.usuario);
export const registrarse = (nombre, email, password) =>
  pedir('/auth/register', { metodo: 'POST', cuerpo: { nombre, email, password } }).then((r) => r.usuario);
export const cerrarSesion = () => pedir('/auth/logout', { metodo: 'POST' });

// ---------- Sistema ----------
export const salud = () => pedir('/health');
