import { useEffect, useState } from 'react';
import { listarCiudades } from '../api/amaru.js';

/** Hook: ciudades del departamento elegido (catálogo público de la API). */
export function useCiudades(idDepartamento) {
  const [ciudades, setCiudades] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!idDepartamento) {
      setCiudades([]);
      return;
    }
    let vigente = true;
    setCargando(true);
    listarCiudades(idDepartamento)
      .then((data) => vigente && setCiudades(data))
      .catch(() => vigente && setCiudades([]))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [idDepartamento]);

  return { ciudades, cargando };
}
