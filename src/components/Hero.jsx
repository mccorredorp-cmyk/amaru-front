import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useCiudades } from './SelectorUbicacion.jsx';
import { useEstadisticas } from '../hooks/useEstadisticas.js';
import { formatoCorto } from '../utils/formato.js';

const PRESUPUESTOS = [
  ['', 'Cualquiera'],
  ['1000000', 'Hasta $1.000.000'],
  ['2000000', 'Hasta $2.000.000'],
  ['3500000', 'Hasta $3.500.000'],
  ['6000000', 'Hasta $6.000.000'],
];

export default function Hero({ filtros, onBuscar }) {
  const { catalogos, mostrarToast } = useApp();
  const [form, setForm] = useState(filtros);
  const { ciudades } = useCiudades(form.departamento);
  const stats = useEstadisticas();

  // Si los filtros cambian desde otra parte (mapa, pastillas), el buscador se sincroniza.
  useEffect(() => setForm(filtros), [filtros]);

  const cambiar = (campo) => (e) => {
    const valor = e.target.value;
    setForm((f) => (campo === 'departamento' ? { ...f, departamento: valor, ciudad: '' } : { ...f, [campo]: valor }));
  };

  const buscar = (e) => {
    e.preventDefault();
    const ciudad = ciudades.find((c) => String(c.id) === form.ciudad);
    onBuscar({ ...form, ciudadNombre: ciudad?.nombre ?? '' });
    document.getElementById('propiedades')?.scrollIntoView({ behavior: 'smooth' });
    if (catalogos.error) mostrarToast('No hay conexión con el servidor de Amaru');
  };

  return (
    <section className="hero" id="inicio">
      <div className="contenedor hero-grid">
        <div className="hero-text">
          <span className="badge-tag">
            <span className="dot" /> Beta en Pereira · pronto en toda Colombia
          </span>
          <h1>
            Tu próximo hogar,
            <br />
            <span className="resaltado">sin vueltas.</span>
          </h1>
          <p className="hero-lead">
            Arrancamos en Pereira: casas, apartamentos y locales en arriendo, ubicados en el mapa. Filtra, compara y
            contacta en minutos.
          </p>

          <form className="search-bar search-bar-4" onSubmit={buscar}>
            <div className="search-field">
              <label htmlFor="f-departamento">Departamento</label>
              <select id="f-departamento" value={form.departamento} onChange={cambiar('departamento')}>
                <option value="">Toda Colombia</option>
                {catalogos.departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-field">
              <label htmlFor="f-ciudad">Ciudad</label>
              <select id="f-ciudad" value={form.ciudad} onChange={cambiar('ciudad')} disabled={!form.departamento}>
                <option value="">{form.departamento ? 'Todas' : 'Elige departamento'}</option>
                {ciudades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-field">
              <label htmlFor="f-tipo">Tipo</label>
              <select id="f-tipo" value={form.tipo} onChange={cambiar('tipo')}>
                <option value="">Todos</option>
                {catalogos.tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-field">
              <label htmlFor="f-precio">Presupuesto</label>
              <select id="f-precio" value={form.valor_max} onChange={cambiar('valor_max')}>
                {PRESUPUESTOS.map(([v, t]) => (
                  <option key={v} value={v}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary search-btn" aria-label="Buscar inmuebles">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <circle cx="11" cy="11" r="7.5" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
              <span>Buscar</span>
            </button>
          </form>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.total ? stats.total.toLocaleString('es-CO') : '—'}</span>
              <span className="stat-label">Inmuebles disponibles</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.ciudades || '—'}</span>
              <span className="stat-label">Ciudades</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.pereira ?? '—'}</span>
              <span className="stat-label">En Pereira, desde {formatoCorto(stats.desdePereira)}</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-photo">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80" alt="" />
          </div>
          <div className="float-card float-1">
            <span className="float-icon">📍</span>
            <div>
              <strong>Pereira, Risaralda</strong>
              <small>Nuestra ciudad beta</small>
            </div>
          </div>
          <div className="float-card float-2">
            <span className="float-icon naranja">♥</span>
            <div>
              <strong>Guarda favoritos</strong>
              <small>Y compáralos después</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
