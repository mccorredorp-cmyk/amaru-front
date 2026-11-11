export default function Footer() {
  return (
    <footer className="footer">
      <div className="contenedor footer-grid">
        <div className="footer-brand">
          <a className="logo-brand" href="#inicio">
            <img src="/img/Logo-icono.png" alt="" className="logo-img" />
            <span className="logo-name">Amaru</span>
          </a>
          <p>La forma más fácil de encontrar arriendo. Empezando por Pereira.</p>
        </div>

        <div className="footer-links">
          <h4>Explora</h4>
          <ul>
            <li><a href="#propiedades">Inmuebles</a></li>
            <li><a href="#mapa">Mapa</a></li>
            <li><a href="#como-funciona">Cómo funciona</a></li>
            <li><a href="#equipo">Nosotros</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Legal</h4>
          <ul>
            <li><a href="#contacto">Términos y condiciones</a></li>
            <li><a href="#contacto">Política de privacidad</a></li>
            <li><a href="#contacto">Tratamiento de datos</a></li>
          </ul>
        </div>
      </div>

      <div className="contenedor footer-bottom">
        <p>© {new Date().getFullYear()} Amaru. Todos los derechos reservados.</p>
        <p>Hecho en Pereira 🇨🇴</p>
      </div>
    </footer>
  );
}
