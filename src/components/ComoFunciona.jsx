const PASOS = [
  ['01', 'Busca en el mapa', 'Filtra por ciudad, presupuesto y tipo de inmueble. Mira dónde queda cada uno y guarda tus favoritos.'],
  ['02', 'Agenda tu visita', 'Elige el horario que te sirva y habla directo con el propietario desde la app.'],
  ['03', 'Firma en línea', 'Sube tus documentos y firma el contrato de forma digital, conforme a la ley colombiana.'],
];

const BENEFICIOS = [
  {
    titulo: 'Inmuebles verificados',
    texto: 'Revisamos cada publicación antes de mostrarla.',
    icono: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    extra: <polyline points="9 12 11 14 15 10" />,
  },
  {
    titulo: 'Todo en el mapa',
    texto: 'Sabes dónde queda cada inmueble antes de visitarlo.',
    naranja: true,
    icono: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />,
    extra: <circle cx="12" cy="10" r="3" />,
  },
  {
    titulo: 'Datos protegidos',
    texto: 'Tu información se trata según la Ley 1581.',
    icono: <rect x="3" y="11" width="18" height="11" rx="2" />,
    extra: <path d="M7 11V7a5 5 0 0 1 10 0v4" />,
  },
];

export default function ComoFunciona() {
  return (
    <section className="seccion-alt" id="como-funciona">
      <div className="contenedor">
        <div className="seccion-header centrado">
          <span className="subtitulo">Así de fácil</span>
          <h2>Arrienda en 3 pasos</h2>
          <p className="header-desc">Sin filas, sin papeleo en físico y sin sorpresas.</p>
        </div>

        <div className="grid-pasos">
          {PASOS.map(([n, titulo, texto]) => (
            <div className="paso-card" key={n}>
              <span className="paso-num">{n}</span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </div>
          ))}
        </div>

        <div className="grid-beneficios">
          {BENEFICIOS.map((b) => (
            <div className="beneficio" key={b.titulo}>
              <div className={`icon-wrapper${b.naranja ? ' naranja' : ''}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {b.icono}
                  {b.extra}
                </svg>
              </div>
              <div>
                <h4>{b.titulo}</h4>
                <p>{b.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
