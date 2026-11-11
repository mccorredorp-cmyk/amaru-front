import { useEffect, useState } from 'react';
import { listarInmuebles } from '../api/amaru.js';
import { CIUDAD_BETA } from '../data/ciudades.js';
import { normalizar } from '../utils/formato.js';

// La API no tiene un endpoint de estadísticas, así que se leen los inmuebles
// disponibles por páginas de 100 (máximo permitido) una sola vez y se agrupan
// por ciudad. El resultado se comparte entre el hero y el mapa.

let promesa = null;

async function cargarTodo() {
  const primera = await listarInmuebles({ page: 1, limit: 100 });
  const paginas = [primera];
  const totalPaginas = primera.meta.totalPages;
  for (let p = 2; p <= totalPaginas; p += 4) {
    const lote = [];
    for (let i = p; i < p + 4 && i <= totalPaginas; i++) lote.push(listarInmuebles({ page: i, limit: 100 }));
    paginas.push(...(await Promise.all(lote)));
  }

  const porCiudad = new Map();
  for (const inmueble of paginas.flatMap((r) => r.data)) {
    if (!inmueble.ciudad) continue;
    const actual = porCiudad.get(inmueble.ciudad) ?? {
      ciudad: inmueble.ciudad,
      departamento: inmueble.departamento,
      total: 0,
      desde: null,
    };
    actual.total += 1;
    if (inmueble.valor_arriendo && (actual.desde === null || inmueble.valor_arriendo < actual.desde)) {
      actual.desde = inmueble.valor_arriendo;
    }
    porCiudad.set(inmueble.ciudad, actual);
  }

  const beta = [...porCiudad.values()].find((c) => normalizar(c.ciudad) === normalizar(CIUDAD_BETA.ciudad));
  return {
    total: primera.meta.total,
    ciudades: porCiudad.size,
    porCiudad: [...porCiudad.values()].sort((a, b) => b.total - a.total),
    pereira: beta?.total ?? 0,
    desdePereira: beta?.desde ?? null,
    listo: true,
  };
}

export function useEstadisticas() {
  const [stats, setStats] = useState({ listo: false, porCiudad: [] });

  useEffect(() => {
    let vigente = true;
    promesa ??= cargarTodo().catch((error) => {
      promesa = null; // permite reintentar en el próximo montaje
      return { listo: true, error, porCiudad: [] };
    });
    promesa.then((s) => vigente && setStats(s));
    return () => {
      vigente = false;
    };
  }, []);

  return stats;
}
