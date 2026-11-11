import { useState } from 'react';
import Modal from './Modal.jsx';
import { useApp } from '../context/AppContext.jsx';

/** Ingreso y registro. `siguiente` = modal que se abre al terminar (p. ej. 'publicar'). */
export default function AuthModal({ siguiente }) {
  const { login, registro, cerrarModal, abrirModal, mostrarToast } = useApp();
  const [modo, setModo] = useState(siguiente === 'publicar' ? 'registro' : 'login');
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setErrores({});
    setMensaje('');
    setEnviando(true);
    try {
      const u =
        modo === 'login'
          ? await login(form.email, form.password)
          : await registro(form.nombre, form.email, form.password);
      mostrarToast(`¡Hola, ${u.nombre.split(' ')[0]}!`);
      if (siguiente) abrirModal(siguiente);
      else cerrarModal();
    } catch (err) {
      if (err.code === 'VALIDACION_FALLIDA') {
        setErrores(Object.fromEntries(err.details.map((d) => [d.campo, d.mensaje])));
      } else if (err.code === 'EMAIL_EN_USO') {
        setErrores({ email: 'Ya hay una cuenta con ese correo. Inicia sesión.' });
      } else {
        setMensaje(err.message);
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal titulo={modo === 'login' ? 'Ingresar' : 'Crear cuenta'} onCerrar={cerrarModal} ancho="angosto">
      <div className="form-modal">
        <span className="subtitulo">{siguiente === 'publicar' ? 'Para publicar necesitas una cuenta' : 'Bienvenido a Amaru'}</span>
        <h2>{modo === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta'}</h2>

        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={modo === 'login'} className={modo === 'login' ? 'on' : ''} onClick={() => setModo('login')}>
            Ingresar
          </button>
          <button type="button" role="tab" aria-selected={modo === 'registro'} className={modo === 'registro' ? 'on' : ''} onClick={() => setModo('registro')}>
            Registrarme
          </button>
        </div>

        <form onSubmit={enviar} noValidate>
          {modo === 'registro' && (
            <Campo id="a-nombre" label="Nombre" error={errores.nombre}>
              <input id="a-nombre" className="input" value={form.nombre} onChange={cambiar('nombre')} autoComplete="name" required />
            </Campo>
          )}
          <Campo id="a-email" label="Correo electrónico" error={errores.email}>
            <input id="a-email" type="email" className="input" value={form.email} onChange={cambiar('email')} autoComplete="email" required />
          </Campo>
          <Campo
            id="a-password"
            label="Contraseña"
            error={errores.password}
            ayuda={modo === 'registro' ? 'Mínimo 10 caracteres.' : null}
          >
            <input
              id="a-password"
              type="password"
              className="input"
              value={form.password}
              onChange={cambiar('password')}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              minLength={modo === 'registro' ? 10 : undefined}
              required
            />
          </Campo>

          {mensaje && <p className="form-error-general">{mensaje}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={enviando}>
            {enviando ? 'Un momento…' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </Modal>
  );
}

export function Campo({ id, label, error, ayuda, children }) {
  return (
    <div className={`form-group${error ? ' con-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <small className="campo-error">{error}</small> : ayuda ? <small className="campo-ayuda">{ayuda}</small> : null}
    </div>
  );
}
