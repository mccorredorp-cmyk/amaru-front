import { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

// Sección de contacto hecha con componentes de React-Bootstrap (reto del curso).
// Los estilos de Bootstrap solo aplican dentro de .bs-scope (ver styles/bootstrap-contacto.scss),
// así no cambian el diseño del resto de la página.

const CORREO = 'amaruinmuebles@gmail.com';
const TELEFONO = '+57 300 736 6602';
const WHATSAPP = 'https://wa.me/573007366602';

const MOTIVOS = [
  ['arrendar', 'Busco un inmueble en arriendo'],
  ['publicar', 'Quiero publicar mi inmueble'],
  ['soporte', 'Tengo un problema con la app'],
  ['otro', 'Otro motivo'],
];

const PREGUNTAS = [
  ['¿Publicar en Amaru tiene costo?', 'Durante la beta en Pereira publicar es gratis. Solo necesitas crear una cuenta.'],
  ['¿Los inmuebles están verificados?', 'Estamos verificando primero los de Pereira. Los de otras ciudades muestran avisos cuando sus datos tienen algo raro.'],
  ['¿Cuándo llega Amaru a mi ciudad?', 'Después de la beta seguimos con Manizales, Armenia, Medellín, Bogotá y Cali. Escríbenos y te avisamos.'],
];

const VACIO = { nombre: '', correo: '', telefono: '', motivo: '', mensaje: '', acepta: false };

export default function Contacto() {
  const [form, setForm] = useState(VACIO);
  const [validado, setValidado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [toast, setToast] = useState(false);

  const cambiar = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const enviar = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      setValidado(true);
      return;
    }
    setEnviando(true);

    // La API todavía no tiene un endpoint de mensajes: se prepara el correo
    // con los datos del formulario en la app de correo de la persona.
    const motivo = MOTIVOS.find(([v]) => v === form.motivo)?.[1] ?? '';
    const cuerpo = [
      `Nombre: ${form.nombre}`,
      `Correo: ${form.correo}`,
      form.telefono && `Teléfono: ${form.telefono}`,
      `Motivo: ${motivo}`,
      '',
      form.mensaje,
    ]
      .filter((l) => l !== false && l !== '')
      .join('\n');
    const enlace = `mailto:${CORREO}?subject=${encodeURIComponent(`[Amaru] ${motivo}`)}&body=${encodeURIComponent(cuerpo)}`;

    setTimeout(() => {
      window.location.href = enlace;
      setEnviando(false);
      setEnviado(true);
      setToast(true);
      setForm(VACIO);
      setValidado(false);
    }, 600);
  };

  return (
    <section className="seccion contenedor" id="contacto">
      <div className="bs-scope">
        <div className="contacto-wrapper">
          <Row className="g-4 g-lg-5 position-relative">
            <Col lg={5} className="contacto-info">
              <Badge pill bg="warning" text="dark" className="mb-3 px-3 py-2 contacto-badge">
                Hablemos
              </Badge>
              <h2>¿Tienes un inmueble para arrendar en Pereira?</h2>
              <p>
                Publícalo en Amaru durante la beta y sé de los primeros en aparecer en el mapa. También respondemos
                cualquier duda.
              </p>

              <ListGroup variant="flush" className="contacto-lista my-4">
                <ListGroup.Item>
                  <span className="info-icon">📍</span> Pereira, Risaralda, Colombia
                </ListGroup.Item>
                <ListGroup.Item action href={`mailto:${CORREO}`}>
                  <span className="info-icon">✉️</span> {CORREO}
                </ListGroup.Item>
                <ListGroup.Item action href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                  <span className="info-icon">📞</span> {TELEFONO} <Badge bg="success" className="ms-2">WhatsApp</Badge>
                </ListGroup.Item>
              </ListGroup>

              <Accordion className="contacto-faq" flush>
                {PREGUNTAS.map(([pregunta, respuesta], i) => (
                  <Accordion.Item eventKey={String(i)} key={pregunta}>
                    <Accordion.Header>{pregunta}</Accordion.Header>
                    <Accordion.Body>{respuesta}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>

            <Col lg={7}>
              <Card className="contacto-card border-0">
                <Card.Body className="p-4 p-md-5">
                  <Card.Title as="h3" className="mb-1">
                    Escríbenos
                  </Card.Title>
                  <Card.Subtitle className="mb-4 text-body-secondary">Te respondemos en menos de un día hábil.</Card.Subtitle>

                  {enviado && (
                    <Alert variant="success" dismissible onClose={() => setEnviado(false)}>
                      <Alert.Heading as="h4">¡Listo!</Alert.Heading>
                      Abrimos tu aplicación de correo con el mensaje preparado. Solo falta darle <b>Enviar</b>.
                    </Alert>
                  )}

                  <Form noValidate validated={validado} onSubmit={enviar}>
                    <Row className="g-3">
                      <Col md={6}>
                        <FloatingLabel controlId="c-nombre" label="Nombre completo">
                          <Form.Control required minLength={3} placeholder="Tu nombre" value={form.nombre} onChange={cambiar('nombre')} autoComplete="name" />
                          <Form.Control.Feedback type="invalid">Escribe tu nombre.</Form.Control.Feedback>
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel controlId="c-correo" label="Correo electrónico">
                          <Form.Control required type="email" placeholder="correo@ejemplo.com" value={form.correo} onChange={cambiar('correo')} autoComplete="email" />
                          <Form.Control.Feedback type="invalid">Escribe un correo válido.</Form.Control.Feedback>
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel controlId="c-telefono" label="Celular (opcional)">
                          <Form.Control type="tel" pattern="[0-9 +]{7,15}" placeholder="3001234567" value={form.telefono} onChange={cambiar('telefono')} autoComplete="tel" />
                          <Form.Control.Feedback type="invalid">Solo números, entre 7 y 15 dígitos.</Form.Control.Feedback>
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel controlId="c-motivo" label="Motivo">
                          <Form.Select required value={form.motivo} onChange={cambiar('motivo')}>
                            <option value="">Elige un motivo</option>
                            {MOTIVOS.map(([v, t]) => (
                              <option key={v} value={v}>
                                {t}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">Elige un motivo.</Form.Control.Feedback>
                        </FloatingLabel>
                      </Col>
                      <Col xs={12}>
                        <FloatingLabel controlId="c-mensaje" label="Mensaje">
                          <Form.Control
                            as="textarea"
                            required
                            minLength={10}
                            maxLength={1000}
                            placeholder="¿En qué te podemos ayudar?"
                            style={{ height: '140px' }}
                            value={form.mensaje}
                            onChange={cambiar('mensaje')}
                          />
                          <Form.Control.Feedback type="invalid">Cuéntanos un poco más (mínimo 10 caracteres).</Form.Control.Feedback>
                        </FloatingLabel>
                        <Form.Text className="d-block text-end">{form.mensaje.length}/1000</Form.Text>
                      </Col>
                      <Col xs={12}>
                        <Form.Check
                          required
                          id="c-acepta"
                          checked={form.acepta}
                          onChange={cambiar('acepta')}
                          label="Autorizo el tratamiento de mis datos personales según la Ley 1581 de 2012."
                          feedback="Necesitamos tu autorización para responderte."
                          feedbackType="invalid"
                        />
                      </Col>
                      <Col xs={12}>
                        <Button type="submit" variant="warning" size="lg" className="w-100 btn-enviar" disabled={enviando}>
                          {enviando ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" className="me-2" aria-hidden="true" />
                              Preparando mensaje…
                            </>
                          ) : (
                            'Enviar mensaje'
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        <ToastContainer position="bottom-end" containerPosition="fixed" className="p-3 contacto-toast">
          <Toast show={toast} onClose={() => setToast(false)} delay={4000} autohide bg="light">
            <Toast.Header>
              <img src="/img/Logo-icono.png" alt="" width="20" height="20" className="me-2" />
              <strong className="me-auto">Amaru</strong>
              <small>ahora</small>
            </Toast.Header>
            <Toast.Body>Tu mensaje está listo para enviarse. ¡Gracias por escribirnos!</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </section>
  );
}
