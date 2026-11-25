import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const ENLACES = [
  ['inicio', 'Inicio'],
  ['propiedades', 'Inmuebles'],
  ['mapa', 'Mapa'],
  ['como-funciona', 'Cómo funciona'],
  ['nosotros', 'Nosotros'],
  ['contacto', 'Contacto'],
];

export default function Header() {
  const { usuario, logout, abrirModal, mostrarToast, favoritos } = useApp();
  const [abierto, setAbierto] = useState(false);
  const [conSombra, setConSombra] = useState(false);
  const [activo, setActivo] = useState('inicio');

  useEffect(() => {
    const onScroll = () => setConSombra(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Resalta el enlace de la sección visible.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setActivo(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    // 'mis-inmuebles' solo existe con sesión: por eso el efecto depende de usuario.
    [...ENLACES.map(([id]) => id), 'favoritos', 'mis-inmuebles'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [usuario]);

  useEffect(() => {
    document.body.classList.toggle('sin-scroll', abierto);
  }, [abierto]);

  const cerrar = () => setAbierto(false);

  const publicar = () => {
    cerrar();
    if (usuario) abrirModal('publicar');
    else abrirModal('auth', 'publicar');
  };

  const salir = async () => {
    cerrar();
    await logout();
    mostrarToast('Cerraste sesión');
  };

  return (
    <header className={`header${conSombra ? ' con-sombra' : ''}`}>
      <div className="contenedor header-content">
        <a className="logo-brand" href="#inicio" aria-label="Amaru, ir al inicio">
          <img src="/img/Logo-icono.png" alt="" className="logo-img" />
          <span className="logo-name">Amaru</span>
          <span className="beta-chip">Beta</span>
        </a>

        <nav className={`nav${abierto ? ' abierto' : ''}`} id="nav" aria-label="Navegación principal">
          <ul className="nav-links">
            {ENLACES.map(([id, texto]) => (
              <li key={id}>
                <a href={`#${id}`} className={activo === id ? 'active' : ''} onClick={cerrar}>
                  {texto}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-acciones">
            {usuario && (
              <a
                href="#mis-inmuebles"
                className={`fav-enlace mis-enlace${activo === 'mis-inmuebles' ? ' active' : ''}`}
                onClick={cerrar}
                aria-label="Mis inmuebles"
                title="Mis inmuebles"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
                </svg>
                <span className="fav-enlace-texto">Mis inmuebles</span>
              </a>
            )}
            <a
              href="#favoritos"
              className={`fav-enlace${activo === 'favoritos' ? ' active' : ''}`}
              onClick={cerrar}
              aria-label={usuario ? `Mis favoritos: ${favoritos.size}` : 'Mis favoritos'}
              title="Mis favoritos"
            >
              <span aria-hidden="true">♥</span>
              <span className="fav-enlace-texto">Favoritos</span>
              {usuario && favoritos.size > 0 && <span className="fav-contador">{favoritos.size}</span>}
            </a>
            {usuario ? (
              <div className="usuario-chip" title={usuario.email}>
                <span className="usuario-avatar" aria-hidden="true">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </span>
                <span className="usuario-nombre">{usuario.nombre.split(' ')[0]}</span>
                <button type="button" className="link-salir" onClick={salir}>
                  Salir
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  cerrar();
                  abrirModal('auth');
                }}
              >
                Ingresar
              </button>
            )}
            <button type="button" className="btn btn-primary nav-cta" onClick={publicar}>
              Publicar<span className="nav-cta-largo">inmueble</span>
            </button>
          </div>
        </nav>

        <button
          type="button"
          className={`menu-toggle${abierto ? ' abierto' : ''}`}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          aria-controls="nav"
          onClick={() => setAbierto((a) => !a)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
