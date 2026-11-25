import { useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import { Campo } from './AuthModal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useCiudades } from './SelectorUbicacion.jsx';
import { actualizarInmueble, publicarInmueble, subirImagenes } from '../api/amaru.js';

const VACIO = {
  tipo_inmueble: '',
  idDepartamento: '',
  ciudad: '',
  direccion: '',
  nombre_inmueble: '',
  estrato: '',
  valor_arriendo: '',
  area_construida: '',
  mas_admon: false,
  nombre_contacto: '',
  telefono_contacto: '',
  correo_contacto: '',
  estado_inmueble: 'Disponible',
};

const ESTADOS = ['Disponible', 'Arrendado', 'No disponible'];

/** Convierte un inmueble de la API en los valores del formulario (modo edición). */
function formDesde(inmueble, departamentos) {
  const depto = departamentos.find((d) => d.nombre === inmueble.departamento);
  return {
    tipo_inmueble: inmueble.tipo,
    idDepartamento: depto ? String(depto.id) : '',
    ciudad: inmueble.ciudad ?? '',
    direccion: inmueble.direccion ?? '',
    nombre_inmueble: inmueble.nombre ?? '',
    estrato: inmueble.estrato ? String(inmueble.estrato) : '',
    valor_arriendo: inmueble.valor_arriendo ? String(inmueble.valor_arriendo) : '',
    area_construida: inmueble.area_construida ? String(inmueble.area_construida) : '',
    mas_admon: Boolean(inmueble.mas_admon),
    nombre_contacto: inmueble.contacto?.nombre ?? '',
    telefono_contacto: inmueble.contacto?.telefono ?? '',
    correo_contacto: inmueble.contacto?.correo ?? '',
    estado_inmueble: inmueble.estado ?? 'Disponible',
  };
}

const numeroONull = (v) => (v === '' ? null : Number(v));

/**
 * PATCH solo con lo que cambió. Así se respeta la semántica del back: un campo
 * ausente no se toca y `null` vacía un dato opcional. Mandar todo el formulario
 * funcionaría, pero, por ejemplo, crearía otro contacto aunque no se tocara.
 */
function construirCambios(form, inicial, departamento) {
  const c = {};
  const cambio = (campo) => form[campo] !== inicial[campo];

  if (cambio('tipo_inmueble')) c.tipo_inmueble = form.tipo_inmueble;
  if (cambio('idDepartamento')) c.departamento = departamento.nombre;
  if (cambio('ciudad') || cambio('idDepartamento')) c.ciudad = form.ciudad || null;
  if (form.direccion.trim() !== inicial.direccion.trim()) c.direccion = form.direccion.trim();
  if (form.nombre_inmueble.trim() && form.nombre_inmueble.trim() !== inicial.nombre_inmueble.trim()) {
    c.nombre_inmueble = form.nombre_inmueble.trim();
  }
  if (cambio('estrato')) c.estrato = numeroONull(form.estrato);
  if (cambio('valor_arriendo')) c.valor_arriendo = numeroONull(form.valor_arriendo);
  if (cambio('area_construida')) c.area_construida = numeroONull(form.area_construida);
  if (cambio('mas_admon')) c.mas_admon = form.mas_admon;
  if (cambio('estado_inmueble')) c.estado_inmueble = form.estado_inmueble;

  if (cambio('nombre_contacto') || cambio('telefono_contacto') || cambio('correo_contacto')) {
    const nombre = form.nombre_contacto.trim();
    if (!nombre) c.nombre_contacto = null; // sin nombre se quita el contacto
    else {
      c.nombre_contacto = nombre;
      c.telefono_contacto = form.telefono_contacto.trim() || null;
      c.correo_contacto = form.correo_contacto.trim() || null;
    }
  }
  return c;
}

// El back exige un codigo_sae único: para publicaciones web se genera uno.
const nuevoCodigo = () => `WEB-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

/**
 * Publicar un inmueble nuevo o, si llega `inmueble`, editar uno propio.
 * Es el mismo formulario en los dos casos para no duplicar campos ni estilos.
 */
export default function PublicarModal({ inmueble = null }) {
  const { catalogos, cerrarModal, abrirModal, mostrarToast, usuario, avisarCambioInmuebles, actualizarFavorito } = useApp();
  const editando = Boolean(inmueble);
  // useState con función: el valor inicial se calcula una sola vez al montar.
  const [inicial] = useState(() =>
    editando
      ? formDesde(inmueble, catalogos.departamentos)
      : { ...VACIO, nombre_contacto: usuario?.nombre ?? '', correo_contacto: usuario?.email ?? '' },
  );
  const [form, setForm] = useState(inicial);
  const [fotos, setFotos] = useState([]);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { ciudades } = useCiudades(form.idDepartamento);

  const departamento = useMemo(
    () => catalogos.departamentos.find((d) => String(d.id) === form.idDepartamento),
    [catalogos.departamentos, form.idDepartamento],
  );

  const cambiar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => (campo === 'idDepartamento' ? { ...f, idDepartamento: valor, ciudad: '' } : { ...f, [campo]: valor }));
  };

  const mostrarErrores = (err) => {
    if (err.details?.length) {
      setErrores(Object.fromEntries(err.details.map((d) => [d.campo, d.mensaje])));
      setMensaje('Revisa los campos marcados.');
    } else {
      setMensaje(err.message);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErrores({});
    setMensaje('');

    const faltan = {};
    if (!form.tipo_inmueble) faltan.tipo_inmueble = 'Elige el tipo de inmueble';
    if (!departamento) faltan.departamento = 'Elige el departamento';
    if (!form.direccion.trim()) faltan.direccion = 'Escribe la dirección';
    if (Object.keys(faltan).length) {
      setErrores(faltan);
      return;
    }

    const datos = {
      codigo_sae: nuevoCodigo(),
      tipo_inmueble: form.tipo_inmueble,
      departamento: departamento.nombre,
      direccion: form.direccion.trim(),
      ...(form.ciudad && { ciudad: form.ciudad }),
      ...(form.nombre_inmueble.trim() && { nombre_inmueble: form.nombre_inmueble.trim() }),
      ...(form.estrato && { estrato: Number(form.estrato) }),
      ...(form.valor_arriendo && { valor_arriendo: Number(form.valor_arriendo) }),
      ...(form.area_construida && { area_construida: Number(form.area_construida) }),
      mas_admon: form.mas_admon,
      ...(form.nombre_contacto.trim() && { nombre_contacto: form.nombre_contacto.trim() }),
      ...(form.telefono_contacto.trim() && { telefono_contacto: form.telefono_contacto.trim() }),
      ...(form.correo_contacto.trim() && { correo_contacto: form.correo_contacto.trim() }),
    };

    if (editando) {
      const cambios = construirCambios(form, inicial, departamento);
      if (!Object.keys(cambios).length) {
        mostrarToast('No hiciste cambios');
        cerrarModal();
        return;
      }
      setEnviando(true);
      try {
        const actualizado = await actualizarInmueble(inmueble.id, cambios);
        actualizarFavorito(actualizado);
        avisarCambioInmuebles();
        mostrarToast('Cambios guardados');
        cerrarModal();
      } catch (err) {
        mostrarErrores(err);
        setEnviando(false);
      }
      return;
    }

    setEnviando(true);
    try {
      const inmueble = await publicarInmueble(datos);
      if (fotos.length) {
        try {
          await subirImagenes(inmueble.id, fotos);
        } catch (err) {
          mostrarToast(`El inmueble se publicó, pero las fotos fallaron: ${err.message}`);
        }
      }
      mostrarToast('¡Tu inmueble ya está publicado!');
      avisarCambioInmuebles();
      abrirModal('detalle', inmueble.id);
    } catch (err) {
      mostrarErrores(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal titulo={editando ? 'Editar inmueble' : 'Publicar inmueble'} onCerrar={cerrarModal} ancho="ancho">
      <form className="form-modal form-publicar" onSubmit={enviar} noValidate>
        <span className="subtitulo">{editando ? 'Mis inmuebles' : 'Beta en Pereira'}</span>
        <h2>{editando ? 'Editar inmueble' : 'Publica tu inmueble'}</h2>
        <p className="form-intro">
          {editando
            ? 'Cambia lo que necesites: solo se envían los campos modificados. Las fotos se gestionan desde el detalle.'
            : 'Los campos con * son obligatorios. Podrás subir más fotos después desde el detalle.'}
        </p>

        <fieldset>
          <legend>El inmueble</legend>
          <div className="form-fila">
            <Campo id="p-tipo" label="Tipo *" error={errores.tipo_inmueble}>
              <select id="p-tipo" className="input" value={form.tipo_inmueble} onChange={cambiar('tipo_inmueble')}>
                <option value="">Elige…</option>
                {catalogos.tipos.map((t) => (
                  <option key={t.id} value={t.nombre}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo id="p-nombre" label="Título del anuncio" error={errores.nombre_inmueble}>
              <input id="p-nombre" className="input" value={form.nombre_inmueble} onChange={cambiar('nombre_inmueble')} placeholder="Apartamento con balcón en Álamos" maxLength={200} />
            </Campo>
          </div>
          <div className="form-fila tres">
            <Campo id="p-valor" label="Arriendo mensual (COP)" error={errores.valor_arriendo}>
              <input id="p-valor" type="number" min="1" step="1000" className="input" value={form.valor_arriendo} onChange={cambiar('valor_arriendo')} placeholder="1500000" />
            </Campo>
            <Campo id="p-area" label="Área construida (m²)" error={errores.area_construida}>
              <input id="p-area" type="number" min="0" step="0.5" className="input" value={form.area_construida} onChange={cambiar('area_construida')} placeholder="75" />
            </Campo>
            <Campo id="p-estrato" label="Estrato" error={errores.estrato}>
              <select id="p-estrato" className="input" value={form.estrato} onChange={cambiar('estrato')}>
                <option value="">Sin dato</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <label className="check">
            <input type="checkbox" checked={form.mas_admon} onChange={cambiar('mas_admon')} /> El arriendo no incluye la administración
          </label>
          {editando && (
            <Campo id="p-estado" label="Estado de la publicación" error={errores.estado_inmueble}>
              <select id="p-estado" className="input" value={form.estado_inmueble} onChange={cambiar('estado_inmueble')}>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </Campo>
          )}
        </fieldset>

        <fieldset>
          <legend>Ubicación</legend>
          <div className="form-fila">
            <Campo id="p-depto" label="Departamento *" error={errores.departamento}>
              <select id="p-depto" className="input" value={form.idDepartamento} onChange={cambiar('idDepartamento')}>
                <option value="">Elige…</option>
                {catalogos.departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo id="p-ciudad" label="Ciudad" error={errores.ciudad}>
              <select id="p-ciudad" className="input" value={form.ciudad} onChange={cambiar('ciudad')} disabled={!form.idDepartamento}>
                <option value="">{form.idDepartamento ? 'Elige…' : 'Primero el departamento'}</option>
                {ciudades.map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <Campo id="p-dir" label="Dirección *" error={errores.direccion}>
            <input id="p-dir" className="input" value={form.direccion} onChange={cambiar('direccion')} placeholder="CL 14 # 23-45, Álamos" />
          </Campo>
        </fieldset>

        <fieldset>
          <legend>Contacto</legend>
          <div className="form-fila tres">
            <Campo id="p-cnombre" label="Nombre" error={errores.nombre_contacto}>
              <input id="p-cnombre" className="input" value={form.nombre_contacto} onChange={cambiar('nombre_contacto')} autoComplete="name" />
            </Campo>
            <Campo id="p-ctel" label="Teléfono" error={errores.telefono_contacto}>
              <input id="p-ctel" type="tel" className="input" value={form.telefono_contacto} onChange={cambiar('telefono_contacto')} placeholder="3001234567" autoComplete="tel" />
            </Campo>
            <Campo id="p-ccorreo" label="Correo" error={errores.correo_contacto}>
              <input id="p-ccorreo" type="email" className="input" value={form.correo_contacto} onChange={cambiar('correo_contacto')} autoComplete="email" />
            </Campo>
          </div>
        </fieldset>

        {!editando && (
          <fieldset>
            <legend>Fotos (opcional)</legend>
            <label className="zona-fotos">
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFotos([...e.target.files].slice(0, 5))} />
              <span>{fotos.length ? `${fotos.length} foto${fotos.length > 1 ? 's' : ''} lista${fotos.length > 1 ? 's' : ''}` : 'Elige hasta 5 fotos (JPG, PNG o WebP)'}</span>
            </label>
          </fieldset>
        )}

        {mensaje && <p className="form-error-general">{mensaje}</p>}

        <div className="form-acciones">
          <button type="button" className="btn btn-ghost" onClick={cerrarModal}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-naranja" disabled={enviando}>
            {enviando ? (editando ? 'Guardando…' : 'Publicando…') : editando ? 'Guardar cambios' : 'Publicar inmueble'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
