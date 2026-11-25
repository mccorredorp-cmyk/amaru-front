# AmaruHouse · Frontend

Frontend en **React** de AmaruHouse, la app de arriendos en Colombia con
**Pereira como ciudad beta**. Consume la API del repositorio
[`amaru`](https://github.com/Beto874874/amaru) (backend en Express + Supabase).

## Qué incluye

- **Buscador** por departamento, ciudad, tipo y presupuesto (arranca en Pereira).
- **Listado de inmuebles** real desde `GET /inmuebles`, con pastillas por tipo,
  orden por fecha, precio o área y paginación ("Ver más").
- **Detalle del inmueble**: fotos, datos, contacto y avisos de calidad de datos.
- **Mapa** (React Leaflet + OpenStreetMap) con el número de inmuebles por ciudad;
  tocar una ciudad filtra el listado.
- **Cuenta de usuario**: registro, ingreso y cierre de sesión con cookies httpOnly.
- **Publicar inmueble** (`POST /inmuebles`) y **subir fotos** (`POST /inmuebles/{id}/imagenes`).
- **Mis inmuebles**: con sesión aparece una sección (y un acceso en el menú) con
  solo los inmuebles que publicó la cuenta (`GET /inmuebles/mios`), filtro por
  estado, **editar** (mismo formulario de publicar; el `PATCH` lleva solo los
  campos que cambiaron) y **eliminar** con confirmación. El back vuelve a
  comprobar que quien edita o borra sea el dueño.
- **Mis favoritos**: sección con la lista de cada cuenta (hay que ingresar para
  guardar), contador en el menú y orden por fecha o precio.
- **Recorrido 3D de demostración** con Three.js en el detalle de cada inmueble.
- **Nosotros**: sección institucional (quiénes somos, misión, visión y valores)
  con una sola imagen representativa. El texto está en `src/data/nosotros.js`
  para ajustarlo sin tocar el diseño.
- **Contacto hecho con React-Bootstrap** (reto del curso): `Row`/`Col`, `Card`,
  `Form` con validación y `FloatingLabel`, `ListGroup`, `Accordion`, `Badge`,
  `Alert`, `Spinner` y `Toast`.
- Diseño **responsive** para celular, tableta y escritorio.

## Requisitos

- Node.js 20 o superior.
- El backend `amaru` corriendo en `http://localhost:3000` (ver su README).

## Instalación

```bash
git clone https://github.com/mccorredorp-cmyk/amaru-front.git
cd amaru-front
npm install
cp .env.example .env      # en PowerShell: Copy-Item .env.example .env
npm run dev
```

Abre <http://localhost:5173>.

> El front **debe** correr en el puerto 5173: es el origen permitido en
> `CORS_ORIGINS` del backend. Si cambias el puerto, agrégalo allá también.

### Variables de entorno

| Variable       | Por defecto                     | Descripción                 |
| -------------- | ------------------------------- | --------------------------- |
| `VITE_API_URL` | `http://localhost:3000/api/v1`  | URL base de la API.         |

El front no guarda ningún secreto: las claves de Supabase y los secretos JWT
viven solo en el backend.

## Scripts

| Comando           | Qué hace                                  |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga.       |
| `npm run build`   | Compila para producción en `dist/`.       |
| `npm run preview` | Sirve la versión compilada para probarla. |

## Estructura

```text
src/
├── api/
│   ├── cliente.js        # fetch con cookies, refresh único y errores de la API
│   └── amaru.js          # una función por endpoint
├── components/           # Header, Hero, Inmuebles, MapaCiudades,
│                         # Contacto (Bootstrap), Nosotros, Mis inmuebles y modales
├── context/AppContext.jsx# sesión, catálogos, favoritos, toast y modales
├── data/                 # texto de Nosotros y coordenadas de las ciudades
├── hooks/                # estadísticas por ciudad
├── styles/
│   ├── estilos.css       # diseño original de Amaru
│   ├── app.css           # estilos de las partes nuevas
│   └── bootstrap-contacto.scss  # Bootstrap limitado a la sección de contacto
└── utils/                # formatos de precio, área y textos
```

### ¿Por qué Bootstrap solo en contacto?

El reto pide usar Bootstrap en la sección de contactos. Para que no cambie el
diseño del resto de la página, Bootstrap se compila con Sass **dentro de la
clase `.bs-scope`**, con los colores de Amaru (turquesa y naranja).

## Recorrido 3D de demostración (Three.js)

En el detalle de cada inmueble, el botón **Recorrido 3D (demo)** abre un visor
hecho con [Three.js](https://threejs.org) y
[React Three Fiber](https://r3f.docs.pmnd.rs) (`src/components/demo3d/`).

- No hay planos reales de los inmuebles, así que hay **tres interiores
  genéricos** construidos en código: apartaestudio, apartamento de dos
  habitaciones y casa con sala-comedor (`modelos.jsx`). Todo son cajas y
  cilindros de Three.js con materiales simples (`muebles.jsx`): no se descarga
  ningún modelo 3D.
- Cada inmueble recibe siempre el mismo interior: se elige con un hash de su
  `id` (`modeloPara`).
- El visor dice claramente que es una **demostración** y no el inmueble real.
- Controles: arrastrar para orbitar, rueda o pellizco para zoom, botones de
  acercar/alejar, giro automático, vista inicial y pantalla completa.
- Rendimiento: Three.js se carga solo al abrir la demo (`React.lazy`) y el
  Canvas usa `frameloop="demand"`, es decir, dibuja solo cuando algo se mueve.
- Limpieza: al cerrar se liberan los controles, los materiales y la textura
  compartidos (`dispose()`), y React Three Fiber libera geometrías y el
  contexto WebGL.

## Pendientes conocidos

- La API no tiene un endpoint para mensajes de contacto: el formulario prepara
  el correo en la aplicación de correo de la persona. Cuando el back tenga
  `POST /mensajes`, basta con cambiar `enviar` en `Contacto.jsx`.
- La API no trae coordenadas por inmueble. En Pereira el mapa pone un pin por
  inmueble con coordenadas calculadas una vez con Nominatim (OpenStreetMap) y
  guardadas en `src/data/ubicacionesPereira.js` (18 de 19; el de la Av. 30 de
  Agosto no se pudo ubicar). Los inmuebles nuevos no salen hasta que el back
  guarde latitud y longitud. El resto del país se agrupa por ciudad.
- Los inmuebles importados del CSV no tienen fotos: se muestran **fotos de
  referencia según el tipo** (`src/utils/fotos.js`). Los 18 tipos del catálogo
  se agrupan en 12 categorías visuales (apartamento, casa, casa de recreo,
  finca, lote, local, oficina, consultorio, parqueadero, bodega, habitación,
  edificio), cada una con varias fotos revisadas a mano. La foto se elige con
  un hash del id, así el mismo inmueble siempre muestra la misma, y el detalle
  arma una galería de la misma categoría. Todo va marcado como "Referencia" y
  las fotos reales que sube el dueño siempre tienen prioridad.
- La API no tiene endpoint de favoritos: cada cuenta guarda su lista en el
  navegador con la clave `amaru:favoritos:<idUsuario>`, así que no se comparte
  entre dispositivos. Cuando el back tenga `GET/POST/DELETE /favoritos`, solo
  cambia la parte de favoritos de `AppContext.jsx`.

## Equipo

Martin Corredor · Juan Alberto Trujillo · Ruben Dario Opcional
