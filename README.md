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
- **Favoritos** guardados en el navegador.
- **Equipo**: tarjetas de los creadores con perfil que se abre con zoom.
- **Contacto hecho con React-Bootstrap** (reto del curso): `Row`/`Col`, `Card`,
  `Form` con validación y `FloatingLabel`, `ListGroup`, `Accordion`, `Badge`,
  `Alert`, `Spinner` y `Toast`.
- Diseño **responsive** para celular, tableta y escritorio.

## Requisitos

- Node.js 20 o superior.
- El backend `amaru` corriendo en `http://localhost:3000` (ver su README).

## Instalación

```bash
git clone https://github.com/Martin-Corr/amaruhouse-front.git
cd amaruhouse-front
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
├── components/           # Header, Hero, Inmuebles, MapaCiudades, Equipo,
│                         # Contacto (Bootstrap), modales de detalle, ingreso y publicar
├── context/AppContext.jsx# sesión, catálogos, favoritos, toast y modales
├── data/                 # equipo y coordenadas de las ciudades
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

## Pendientes conocidos

- La API no tiene un endpoint para mensajes de contacto: el formulario prepara
  el correo en la aplicación de correo de la persona. Cuando el back tenga
  `POST /mensajes`, basta con cambiar `enviar` en `Contacto.jsx`.
- La API no trae coordenadas por inmueble, así que el mapa agrupa por ciudad.
- Los inmuebles importados del CSV no tienen fotos: se muestra una foto de
  referencia marcada como tal hasta que el propietario suba las reales.

## Equipo

Martin Corredor · Juan Alberto Trujillo · Ruben Dario Opcional
