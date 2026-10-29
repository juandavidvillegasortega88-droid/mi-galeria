// ===================================================
// BASE DE DATOS DE IMÁGENES
// ===================================================
const imagenes = [
    {
        id: 1,
        titulo: "Valle Entre Montañas",
        categoria: "montanas",
        categoriaLabel: "Montañas",
        src: "img/paisaje1.jpg",
        tags: ["montaña", "valle", "verde", "cielo", "colina"]
    },
    {
        id: 2,
        titulo: "Sendero Forestal Otoñal",
        categoria: "bosques",
        categoriaLabel: "Bosques",
        src: "img/paisaje2.jpg",
        tags: ["bosque", "arboles", "camino", "naturaleza", "otoño"]
    },
    {
        id: 3,
        titulo: "Aguas Cristalinas de Lago",
        categoria: "lagos",
        categoriaLabel: "Lagos y Playas",
        src: "img/paisaje3.jpg",
        tags: ["lago", "agua", "reflejo", "azul", "tranquilidad"]
    },
    {
        id: 4,
        titulo: "Atardecer Dorado en la Costa",
        categoria: "atardeceres",
        categoriaLabel: "Atardeceres",
        src: "img/paisaje4.jpg",
        tags: ["atardecer", "sol", "playa", "mar", "nubes", "dorado"]
    },
    {
        id: 5,
        titulo: "Cascada Escondida en el Bosque",
        categoria: "bosques",
        categoriaLabel: "Bosques",
        src: "img/paisaje5.jpg",
        tags: ["cascada", "agua", "bosque", "rocas", "flujo"]
    },
    {
        id: 6,
        titulo: "Cumbres Nevadas al Crepúsculo",
        categoria: "montanas",
        categoriaLabel: "Montañas",
        src: "img/paisaje6.jpg",
        tags: ["montaña", "nieve", "frio", "cumbres", "alpes"]
    },
    {
        id: 7,
        titulo: "Costa Tropical Paradisíaca",
        categoria: "lagos",
        categoriaLabel: "Lagos y Playas",
        src: "img/paisaje7.jpg",
        tags: ["playa", "mar", "turquesa", "costa", "arena", "verano"]
    },
    {
        id: 8,
        titulo: "Dunas al Caer el Sol",
        categoria: "atardeceres",
        categoriaLabel: "Atardeceres",
        src: "img/paisaje8.jpg",
        tags: ["desierto", "dunas", "arena", "atardecer", "calido"]
    },
    {
        id: 9,
        titulo: "Pradera de Flores Silvestres",
        categoria: "bosques",
        categoriaLabel: "Bosques",
        src: "img/paisaje9.jpg",
        tags: ["flores", "campo", "primavera", "color", "hierba"]
    },
    {
        id: 10,
        titulo: "Cañón Rocoso Profundo",
        categoria: "montanas",
        categoriaLabel: "Montañas",
        src: "img/paisaje10.jpg",
        tags: ["cañon", "roca", "montaña", "geologia", "acantilado"]
    },
    {
        id: 11,
        titulo: "Bosque de Neblina Mística",
        categoria: "bosques",
        categoriaLabel: "Bosques",
        src: "img/paisaje11.jpg",
        tags: ["niebla", "misterio", "bosque", "arboles", "humedad"]
    },
    {
        id: 12,
        titulo: "Espejo Natural en Lago Alpino",
        categoria: "lagos",
        categoriaLabel: "Lagos y Playas",
        src: "img/paisaje12.jpg",
        tags: ["lago", "reflejo", "montaña", "cielo", "nieve"]
    },
    
    {
      id: 13,
        titulo: "Nombre de tu paisaje",
        categoria: "montanas",
        categoriaLabel: "Montañas",
        src: "img/paisaje13.jpg",
        tags: ["montaña", "nieve", "sol", "naturaleza"]
    },
];

// ===================================================
// ESTADO DE LA APLICACIÓN
// ===================================================
let favoritos = JSON.parse(localStorage.getItem('galeria_favoritos') || '[]');
let categoriaActual = 'todos';
let busquedaActual = '';
let imagenModalActualIndex = 0;
let imagenesFiltradas = [...imagenes];

// Referencias DOM
const galleryGrid = document.getElementById('galleryGrid');
const galleryStatus = document.getElementById('galleryStatus');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const filterChips = document.querySelectorAll('.chip');
const favCountBadge = document.getElementById('favCount');
const themeToggle = document.getElementById('themeToggle');
const themeIconSun = document.getElementById('themeIconSun');
const themeIconMoon = document.getElementById('themeIconMoon');
const toastContainer = document.getElementById('toastContainer');

// Referencias Modal Lightbox
const lightboxModal = document.getElementById('lightboxModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalFavBtn = document.getElementById('modalFavBtn');
const modalDownloadBtn = document.getElementById('modalDownloadBtn');
const modalShareBtn = document.getElementById('modalShareBtn');

// ===================================================
// INICIALIZACIÓN
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarTema();
    actualizarContadorFavoritos();
    renderizarGaleria();
    setupEventListeners();
});

// ===================================================
// RENDERIZADO DE LA GALERÍA
// ===================================================
function renderizarGaleria() {
    // Filtrado combinado (categoría + búsqueda)
    imagenesFiltradas = imagenes.filter(img => {
        // Filtro de categoría
        const coincideCategoria = 
            categoriaActual === 'todos' ? true :
            categoriaActual === 'favoritos' ? favoritos.includes(img.id) :
            img.categoria === categoriaActual;

        // Filtro de búsqueda
        const termino = busquedaActual.toLowerCase().trim();
        const coincideBusqueda = 
            termino === '' ||
            img.titulo.toLowerCase().includes(termino) ||
            img.categoriaLabel.toLowerCase().includes(termino) ||
            img.tags.some(tag => tag.toLowerCase().includes(termino));

        return coincideCategoria && coincideBusqueda;
    });

    galleryGrid.innerHTML = '';

    if (imagenesFiltradas.length === 0) {
        galleryStatus.style.display = 'block';
        if (categoriaActual === 'favoritos' && favoritos.length === 0) {
            galleryStatus.innerHTML = `
                <p style="font-size: 1.8rem; margin-bottom: 8px;">❤️</p>
                <h3>Aún no tienes favoritos</h3>
                <p style="font-size: 0.95rem; margin-top: 6px; color: var(--text-muted)">Haz clic en el corazón de cualquier imagen para guardarla aquí.</p>
            `;
        } else {
            galleryStatus.innerHTML = `
                <p style="font-size: 1.8rem; margin-bottom: 8px;">🔍</p>
                <h3>No se encontraron paisajes</h3>
                <p style="font-size: 0.95rem; margin-top: 6px; color: var(--text-muted)">Intenta con otra palabra clave o selecciona otra categoría.</p>
            `;
        }
        return;
    }

    galleryStatus.style.display = 'none';

    imagenesFiltradas.forEach((img, index) => {
        const esFav = favoritos.includes(img.id);
        const card = document.createElement('article');
        card.className = 'tarjeta';
        card.innerHTML = `
            <div class="img-wrapper" onclick="abrirLightbox(${index})">
                <img src="${img.src}" alt="${img.titulo}" loading="lazy">
                <button class="fav-btn ${esFav ? 'active' : ''}" onclick="toggleFavorito(event, ${img.id})" title="${esFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${esFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                <span class="category-badge">${img.categoriaLabel}</span>
            </div>
            <div class="tarjeta-body">
                <h3 class="tarjeta-title" title="${img.titulo}">${img.titulo}</h3>
                <div class="botones">
                    <a href="${img.src}" download="${img.titulo.toLowerCase().replace(/\s+/g, '-')}.jpg" class="btn btn-primary" title="Descargar imagen">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                        Descargar
                    </a>
                    <button class="btn btn-secondary" onclick="compartirImagen('${img.src}', '${img.titulo}')" title="Compartir enlace">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
                        </svg>
                        Compartir
                    </button>
                </div>
            </div>
        `;
        galleryGrid.appendChild(card);
    });
}

// ===================================================
// SISTEMA DE FAVORITOS
// ===================================================
function toggleFavorito(event, id) {
    if (event) event.stopPropagation();

    const index = favoritos.indexOf(id);
    if (index > -1) {
        favoritos.splice(index, 1);
        mostrarToast("Eliminado de favoritos");
    } else {
        favoritos.push(id);
        mostrarToast("Añadido a tus favoritos ❤️");
    }

    localStorage.setItem('galeria_favoritos', JSON.stringify(favoritos));
    actualizarContadorFavoritos();
    renderizarGaleria();

    // Actualizar botón en el modal si está abierto
    if (lightboxModal.classList.contains('open')) {
        const imagenActual = imagenesFiltradas[imagenModalActualIndex];
        if (imagenActual && imagenActual.id === id) {
            actualizarBotonModalFav(favoritos.includes(id));
        }
    }
}

function actualizarContadorFavoritos() {
    favCountBadge.textContent = favoritos.length;
}

function actualizarBotonModalFav(esFav) {
    if (esFav) {
        modalFavBtn.classList.add('active');
        modalFavBtn.querySelector('svg').setAttribute('fill', 'currentColor');
    } else {
        modalFavBtn.classList.remove('active');
        modalFavBtn.querySelector('svg').setAttribute('fill', 'none');
    }
}

// ===================================================
// LIGHTBOX / MODAL PANTALLA COMPLETA
// ===================================================
function abrirLightbox(index) {
    if (index < 0 || index >= imagenesFiltradas.length) return;
    imagenModalActualIndex = index;
    const imgData = imagenesFiltradas[index];

    modalImg.src = imgData.src;
    modalTitle.textContent = imgData.titulo;
    modalCategory.textContent = imgData.categoriaLabel;

    // Configurar descarga
    modalDownloadBtn.href = imgData.src;
    modalDownloadBtn.download = `${imgData.titulo.toLowerCase().replace(/\s+/g, '-')}.jpg`;

    // Configurar compartir
    modalShareBtn.onclick = () => compartirImagen(imgData.src, imgData.titulo);

    // Configurar favorito
    actualizarBotonModalFav(favoritos.includes(imgData.id));
    modalFavBtn.onclick = () => toggleFavorito(null, imgData.id);

    lightboxModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
    lightboxModal.classList.remove('open');
    document.body.style.overflow = '';
}

function navegarLightbox(direccion) {
    let nuevoIndex = imagenModalActualIndex + direccion;
    if (nuevoIndex < 0) nuevoIndex = imagenesFiltradas.length - 1;
    if (nuevoIndex >= imagenesFiltradas.length) nuevoIndex = 0;
    abrirLightbox(nuevoIndex);
}

// ===================================================
// COMPARTIR (WEB SHARE API + FALLBACK)
// ===================================================
async function compartirImagen(ruta, titulo) {
    const url = new URL(ruta, location.href).href;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: titulo,
                text: `¡Mira esta fotografía: "${titulo}"!`,
                url: url
            });
        } catch (err) {
            // Cancelado por el usuario o no soportado
        }
    } else {
        try {
            await navigator.clipboard.writeText(url);
            mostrarToast("¡Enlace copiado al portapapeles!");
        } catch (err) {
            mostrarToast("No se pudo copiar el enlace");
        }
    }
}

// ===================================================
// SISTEMA DE TOAST / NOTIFICACIONES
// ===================================================
function mostrarToast(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>${mensaje}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===================================================
// TEMA CLARO / OSCURO
// ===================================================
function inicializarTema() {
    const temaGuardado = localStorage.getItem('galeria_tema');
    const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const tema = temaGuardado || (prefiereOscuro ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', tema);
    actualizarIconoTema(tema);
}

function cambiarTema() {
    const actual = document.documentElement.getAttribute('data-theme');
    const nuevo = actual === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', nuevo);
    localStorage.setItem('galeria_tema', nuevo);
    actualizarIconoTema(nuevo);
}

function actualizarIconoTema(tema) {
    if (tema === 'dark') {
        themeIconSun.style.display = 'none';
        themeIconMoon.style.display = 'block';
    } else {
        themeIconSun.style.display = 'block';
        themeIconMoon.style.display = 'none';
    }
}

// ===================================================
// EVENT LISTENERS
// ===================================================
function setupEventListeners() {
    // Cambio de tema
    themeToggle.addEventListener('click', cambiarTema);

    // Búsqueda en tiempo real
    searchInput.addEventListener('input', (e) => {
        busquedaActual = e.target.value;
        clearSearchBtn.style.display = busquedaActual.length > 0 ? 'block' : 'none';
        renderizarGaleria();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        busquedaActual = '';
        clearSearchBtn.style.display = 'none';
        renderizarGaleria();
        searchInput.focus();
    });

    // Filtros por chips
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            categoriaActual = chip.getAttribute('data-category');
            renderizarGaleria();
        });
    });

    // Controles de Lightbox
    modalClose.addEventListener('click', cerrarLightbox);
    modalBackdrop.addEventListener('click', cerrarLightbox);
    modalPrev.addEventListener('click', () => navegarLightbox(-1));
    modalNext.addEventListener('click', () => navegarLightbox(1));

    // Teclado (Escape para cerrar, flechas para navegar)
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('open')) return;

        if (e.key === 'Escape') cerrarLightbox();
        if (e.key === 'ArrowLeft') navegarLightbox(-1);
        if (e.key === 'ArrowRight') navegarLightbox(1);
    });
}
