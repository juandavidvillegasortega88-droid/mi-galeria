# Galería de Paisajes

Galería web de fotografías de paisajes. Los visitantes exploran, buscan, marcan favoritas y descargan fotos sin crear cuenta. Los administradores suben, editan y eliminan fotos, gestionan las categorías y ven estadísticas de uso.

- **Página web:** https://mi-galeria-ci09.onrender.com/
- **Repositorio:** https://github.com/juandavidvillegasortega88-droid/mi-galeria
- **Integrantes:** Jurgen Cantillo, Juan Villegas
- **Asignatura:** Ingeniería del Software · **Docente:** Kevin Villarreal Jiménez

**Tecnologías:** HTML, CSS y JavaScript puro (sin build) · Supabase (PostgreSQL, Auth y Storage) · Render (publicación).

## Funcionalidades

- Explorar la galería, ordenar, cambiar de vista (normal, compacta, mosaico) y filtrar por categoría.
- Búsqueda por texto y asistente de búsqueda en lenguaje natural.
- Visor con zoom que se adapta a la forma de la foto y al dispositivo (computador, tablet y celular).
- Favoritos (guardados en el navegador), descarga individual y de todas las favoritas, y compartir.
- Tema claro y oscuro.
- Panel de administrador: subir, editar y eliminar fotos con validación de datos, gestión de categorías y estadísticas (visitas, vistas, descargas, favoritos y compartidos).
- Todas las fotos viven en la base de datos de Supabase; el código no incluye fotos.

## Cómo ejecutarlo

1. Clona el repositorio.
2. Abre `Mi_proyecto/index.html` en el navegador, o sírvelo con cualquier servidor estático.
3. Las credenciales públicas de Supabase están en `Mi_proyecto/config.js`.

## Configuración de Supabase

| Elemento | Detalle |
|---|---|
| Tabla `fotos` | Fotos publicadas (título, categoría, ubicación, etiquetas, ruta del archivo) |
| Tabla `eventos` | Estadísticas anónimas de uso |
| Tabla `categorias` | Categorías gestionables; se crea con `Mi_proyecto/supabase-categorias.sql` |
| Storage | Bucket con los archivos de las fotos |
| Auth | Registro público desactivado; los administradores se crean en Authentication → Users |

Para las categorías, ejecuta `Mi_proyecto/supabase-categorias.sql` en Supabase → SQL Editor.

## Pruebas

```
node tests/run.js
```

Ejecuta 19 pruebas automáticas (buscador, categorías y validaciones) sin instalar nada. El último resultado está en `tests/resultados.txt`.

## Estructura

```
mi-galeria/
├── Mi_proyecto/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── utilidades.js
│   ├── asistente.js
│   ├── config.js
│   └── supabase-categorias.sql
├── docs/
│   └── DOCUMENTACION.md
├── tests/
│   ├── run.js
│   └── resultados.txt
└── README.md
```

| Archivo | Responsabilidad |
|---|---|
| `index.html` y `style.css` | Interfaz, tema claro/oscuro y diseño adaptable |
| `script.js` | Galería, visor, favoritos, sesión, panel de administrador y categorías |
| `utilidades.js` | Reglas de validación puras (con pruebas) |
| `asistente.js` | Asistente de búsqueda en lenguaje natural (con pruebas) |
| `config.js` | URL y clave pública de Supabase |

## Documentación

El análisis, el diseño, las pruebas y las métricas están en [`docs/DOCUMENTACION.md`](docs/DOCUMENTACION.md): requisitos, reglas de negocio, casos de uso, modelo de datos, arquitectura, diagramas, pruebas, métricas y riesgos.

