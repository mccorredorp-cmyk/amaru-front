// Geocodifica los inmuebles de Pereira con Nominatim (OpenStreetMap).
// Las direcciones colombianas "Calle X # Y-Z" quedan en la esquina de la
// Calle X con la Carrera Y: se busca la geometría de ambas vías y se toma el
// punto donde se cruzan. Respeta el límite de 1 consulta por segundo.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const UA = 'AmaruHouse-proyecto-estudiantil/1.0 (Pereira)';
const VIEWBOX = '-75.78,4.86,-75.62,4.76';
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();

async function buscar(q, extra = '') {
  const clave = q + extra;
  if (cache.has(clave)) return cache.get(clave);
  await esperar(1200);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=co&addressdetails=1&viewbox=${VIEWBOX}&bounded=1&q=${encodeURIComponent(q)}${extra}`;
  // curl respeta el proxy del sistema; fetch de Node no.
  let datos = [];
  for (let intento = 0; intento < 3; intento++) {
    try {
      datos = JSON.parse(execFileSync('curl', ['-s', '-m', '30', '-A', UA, '-H', 'Accept-Language: es', url], { encoding: 'utf8', maxBuffer: 64e6 }));
      break;
    } catch {
      await esperar(4000); // límite de Nominatim: se espera y se reintenta
    }
  }
  const enPereira = datos.filter((d) => [d.address?.municipality, d.address?.city, d.address?.town].includes('Pereira'));
  cache.set(clave, enPereira);
  return enPereira;
}

function lineas(resultados, nombre) {
  const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const out = [];
  for (const r of resultados) {
    if (norm(r.name ?? '') !== norm(nombre)) continue;
    const g = r.geojson;
    if (!g) continue;
    if (g.type === 'LineString') out.push(g.coordinates);
    if (g.type === 'MultiLineString') out.push(...g.coordinates);
  }
  return out;
}

function metros([lon1, lat1], [lon2, lat2]) {
  const R = 6371000, rad = Math.PI / 180;
  const x = (lon2 - lon1) * rad * Math.cos(((lat1 + lat2) / 2) * rad);
  const y = (lat2 - lat1) * rad;
  return Math.sqrt(x * x + y * y) * R;
}

// Densifica cada línea para medir distancias entre segmentos con puntos.
function puntos(ls) {
  const pts = [];
  for (const l of ls) for (let i = 0; i < l.length; i++) {
    pts.push(l[i]);
    if (i + 1 < l.length) {
      const n = Math.ceil(metros(l[i], l[i + 1]) / 8);
      for (let k = 1; k < n; k++) pts.push([l[i][0] + ((l[i + 1][0] - l[i][0]) * k) / n, l[i][1] + ((l[i + 1][1] - l[i][1]) * k) / n]);
    }
  }
  return pts;
}

async function esquina(via1, via2) {
  const extra = '&polygon_geojson=1&dedupe=0&limit=50';
  const a = puntos(lineas(await buscar(`${via1}, Pereira`, extra), via1));
  const b = puntos(lineas(await buscar(`${via2}, Pereira`, extra), via2));
  if (!a.length || !b.length) return { error: `sin geometría (${via1}: ${a.length}, ${via2}: ${b.length})` };
  let mejor = { d: Infinity };
  for (const p of a) for (const q of b) {
    const d = metros(p, q);
    if (d < mejor.d) mejor = { d, p, q };
  }
  if (mejor.d > 40) return { error: `no se cruzan (más cercano a ${Math.round(mejor.d)} m)` };
  return { lat: +((mejor.p[1] + mejor.q[1]) / 2).toFixed(6), lng: +((mejor.p[0] + mejor.q[0]) / 2).toFixed(6) };
}

async function lugar(q) {
  const r = await buscar(`${q}, Pereira`, '&limit=5');
  if (!r.length) return { error: 'lugar no encontrado' };
  return { lat: +(+r[0].lat).toFixed(6), lng: +(+r[0].lon).toFixed(6), nombre_osm: r[0].display_name.split(',').slice(0, 3).join(',') };
}

// Uso: node scripts/geocodificar-pereira.mjs scripts/direcciones-pereira.json resultado.json
const [, , entrada, salida] = process.argv;
const pedidos = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const resultado = [];
for (const p of pedidos) {
  let r = { error: 'sin intento' };
  for (const intento of p.intentos) {
    r = intento.esquina ? await esquina(...intento.esquina) : await lugar(intento.lugar);
    if (!r.error) {
      r.metodo = intento.esquina ? `esquina ${intento.esquina.join(' con ')}` : `lugar ${intento.lugar}`;
      break;
    }
    console.log(`  ${p.codigos[0]} ${JSON.stringify(intento)} -> ${r.error}`);
  }
  console.log(p.codigos.join(','), r.error ? `FALLO ${r.error}` : `${r.lat},${r.lng} (${r.metodo})`);
  resultado.push({ ...p, ...r });
}
fs.writeFileSync(salida, JSON.stringify(resultado, null, 2));
