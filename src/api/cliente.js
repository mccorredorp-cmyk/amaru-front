// Cliente HTTP de la API de AmaruHouse.
// Sigue docs/FRONTEND.md del back: cookies httpOnly (credentials: 'include'),
// un único refresh compartido ante TOKEN_EXPIRADO y un solo reintento.

export const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');

/** Error con el formato { error: { code, message, details } } del back. */
export class ApiError extends Error {
  constructor(status, cuerpo) {
    const error = cuerpo?.error ?? {};
    super(error.message ?? 'No pudimos comunicarnos con el servidor.');
    this.status = status;
    this.code = error.code ?? (status === 0 ? 'SIN_CONEXION' : 'ERROR_DESCONOCIDO');
    this.details = error.details ?? [];
  }

  /** Mensaje de un campo concreto (errores de validación 400). */
  campo(nombre) {
    return this.details.find((d) => d.campo === nombre)?.mensaje;
  }
}

let refrescoEnCurso = null;

/** Todas las peticiones que fallen a la vez comparten un solo refresh. */
function refrescarSesion() {
  refrescoEnCurso ??= fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refrescoEnCurso = null;
    });
  return refrescoEnCurso;
}

async function leerJson(respuesta) {
  if (respuesta.status === 204) return null;
  return respuesta.json().catch(() => null);
}

/**
 * Hace una petición a la API y devuelve el JSON.
 * Lanza ApiError si la respuesta no es 2xx.
 */
export async function pedir(ruta, { metodo = 'GET', cuerpo, archivos, query, senal } = {}, reintentar = true) {
  const url = new URL(`${API}${ruta}`);
  if (query) {
    Object.entries(query).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(clave, valor);
    });
  }

  const opciones = { method: metodo, credentials: 'include', signal: senal, headers: {} };
  if (archivos) {
    // FormData: el navegador pone el Content-Type con su boundary.
    opciones.body = archivos;
  } else if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }

  let respuesta;
  try {
    respuesta = await fetch(url, opciones);
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError(0, {
      error: { message: 'No hay conexión con el servidor de Amaru. Revisa que el back esté encendido.' },
    });
  }

  if (respuesta.status === 401 && reintentar) {
    const datos = await respuesta.clone().json().catch(() => null);
    if (datos?.error?.code === 'TOKEN_EXPIRADO' && (await refrescarSesion())) {
      return pedir(ruta, { metodo, cuerpo, archivos, query, senal }, false);
    }
  }

  const datos = await leerJson(respuesta);
  if (!respuesta.ok) throw new ApiError(respuesta.status, datos);
  return datos;
}
