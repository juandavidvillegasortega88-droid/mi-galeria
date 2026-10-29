// ===================================================
// BASE DE DATOS INICIAL DE IMÁGENES
// ===================================================
const imagenesIniciales = [
    {
        id: 1,
        titulo: "Valle Entre Montañas",
        categoria: "montanas",
        categoriaLabel: "Montañas",
        ubicacion: "Valle de Grindelwald, Suiza",
        src: "img/paisaje1.jpg",
        tags: ["montaña", "valle", "verde", "cielo", "colina", "suiza"]
    },
    {
        id: 2,
        titulo: "Sendero Forestal Otoñal",
        categoria: "bosques",
        categoriaLabel: "Bosques",
        ubicacion: "Selva Negra, Alemania",
        src: "img/paisaje2.jpg",
        tags: ["bosque", "arboles", "camino", "naturaleza", "otoño", "alemania"]
    },
    {
        id: 3,
        titulo: "Aguas Cristalinas de Lago",
        categoria: "lagos",
        categoriaLabel: "Lagos y Playas",
        ubicacion: "Lago Moraine, Canadá",
        src: "img/paisaje3.jpg",
        tags: ["lago", "agua", "reflejo", "azul", "tranquilidad", "canada"]
    },
    {
        id: 4,
        titulo: "Atardecer Dorado en la Costa",
        categoria: "atardeceres",
        categoriaLabel: "Atardeceres",
        ubicacion: "Costa Amalfitana, Italia",
        src: "img/paisaje4.jpg",
        tags: ["atardecer", "sol", "playa", "mar", "nubes", "dorado", "italia"]
    },
    {
        id: 5,
        titulo: "Cascada Escondida en el Bosque",
        categoria: "bosques",
        categoriaLabel: "Bosques",
        ubicacion: "Lagos de Plitvice, Croacia",
        src: "img/paisaje5.jpg",
        tags: ["cascada", "agua", "bosque", "rocas", "flujo", "croacia"]
    },
    {
        id: 6,
        titulo: "Cumbres Nevadas al Crepúsculo",
        categoria: "montanas",
        categoriaLabel: "Montañas",
        ubicacion: "Monte Cervino, Alpes",
        src: "img/paisaje6.jpg",
        tags: ["montaña", "nieve", "frio", "cumbres", "alpes", "crepusculo"]
    },
    {
        id: 7,
        titulo: "Costa Tropical Paradisíaca",
        categoria: "lagos",
        categoriaLabel: "Lagos y Playas",
        ubicacion: "Islas Maldivas",
        src: "img/paisaje7.jpg",
        tags: ["playa", "mar", "turquesa", "costa", "arena", "verano", "maldivas"]
    },
    {
        id: 8,
        titulo: "Dunas al Caer el Sol",
        categoria: "atardeceres",
        categoriaLabel: "Atardeceres",
        ubicacion: "Desierto del Sahara, Marruecos",
        src: "img/paisaje8.jpg",
        tags: ["desierto", "dunas", "arena", "atardecer", "calido", "marruecos"]
    },
    {
        id: 9,
        titulo: "Pradera de Flores Silvestres",
        categoria: "bosques",
        categoriaLabel: "Bosques",
        ubicacion: "Provenza, Francia",
        src: "img/paisaje9.jpg",
        tags: ["flores", "campo", "primavera", "color", "hierba", "francia"]
    },
    {
        id: 10,
        titulo: "Cañón Rocoso Profundo",
        categoria: "montanas",
        categoriaLabel: "Montañas",
        ubicacion: "Gran Cañón, EE. UU.",
        src: "img/paisaje10.jpg",
        tags: ["cañon", "roca", "montaña", "geologia", "acantilado"]
    },
    {
        id: 11,
        titulo: "Bosque de Neblina Mística",
        categoria: "bosques",
        categoriaLabel: "Bosques",
        ubicacion: "Monteverde, Costa Rica",
        src: "img/paisaje11.jpg",
        tags: ["niebla", "misterio", "bosque", "arboles", "humedad", "costa rica"]
    },
    {
        id: 12,
        titulo: "Espejo Natural en Lago Alpino",
        categoria: "lagos",
        categoriaLabel: "Lagos y Playas",
        ubicacion: "Lago di Braies, Italia",
        src: "img/paisaje12.jpg",
        tags: ["lago", "reflejo", "montaña", "cielo", "nieve", "italia"]
    },
    {
        id: 13,
        titulo: "Cumbre Andina Majestuosa",
        categoria: "montanas",
        categoriaLabel: "Montañas",
        ubicacion: "Cordillera de los Andes",
        src: "img/paisaje13.jpg",
        tags: ["montaña", "nieve", "sol", "naturaleza", "andes"]
    }
];

// ===================================================
// ESTADO DE LA APLICACIÓN
// ===================================================
let fotosPersonalizadas = JSON.parse(localStorage.getItem('galeria_fotos_personalizadas') || '[]');
let favoritos = JSON.parse(localStorage.getItem('galeria_favoritos') || '[]');
let categoriaActual = 'todos';
let busquedaActual = '';
let ordenActual = 'predeterminado';
let vistaActual = localStorage.getItem('galeria_vista') || 'normal';

let imagenModalActualIndex = 0;
let imagenesFiltradas = [];

// Estado de Zoom del visor
let zoomActual = 1;
let isPanning = false;
let startX = 0;
let startY = 0;
let currentTranslateX = 0;
let currentTranslateY = 0;

// Referencias del DOM
const galleryGrid = document.getElementById('galleryGrid');
const galleryStatus = document.getElementById('galleryStatus');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const filterChips = document.querySelectorAll('.chip');
const sortSelect = document.getElementById('sortSelect');
const viewBtns = document.querySelectorAll('.view-btn');
const totalCountSpan = document.getElementById('totalCount');
const favCountBadge = document.getElementById('favCount');

// Botones de Cabecera
const themeToggle = document.getElementById('themeToggle');
const themeIconSun = document.getElementById('themeIconSun');
const themeIconMoon = document.getElementById('themeIconMoon');
const btnAbrirSubir = document.getElementById('btnAbrirSubir');
const btnDescargarZip = document.getElementById('btnDescargarZip');
const toastContainer = document.getElementById('toastContainer');

// Referencias del Visor (Lightbox)
const lightboxModal = document.getElementById('lightboxModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const modalImgContainer = document.getElementById('modalImgContainer');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalLocation = document.getElementById('modalLocation');
const modalLocationText = document.getElementById('modalLocationText');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalFavBtn = document.getElementById('modalFavBtn');
const modalDownloadBtn = document.getElementById('modalDownloadBtn');
const modalShareBtn = document.getElementById('modalShareBtn');
const modalDeleteBtn = document.getElementById('modalDeleteBtn');

// Controles de Zoom
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');
const zoomLevelSpan = document.getElementById('zoomLevel');

// Referencias del Modal de Subir Foto
const uploadModal = document.getElementById('uploadModal');
const uploadModalBackdrop = document.getElementById('uploadModalBackdrop');
const uploadModalClose = document.getElementById('uploadModalClose');
const btnCancelUpload = document.getElementById('btnCancelUpload');
const uploadForm = document.getElementById('uploadForm');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const dropzonePrompt = document.getElementById('dropzonePrompt');
const dropzonePreview = document.getElementById('dropzonePreview');
const previewImg = document.getElementById('previewImg');
const btnRemovePreview = document.getElementById('btnRemovePreview');
const inputTitulo = document.getElementById('inputTitulo');
const inputCategoria = document.getElementById('inputCategoria');
const inputUbicacion = document.getElementById('inputUbicacion');
const inputEtiquetas = document.getElementById('inputEtiquetas');

let imagenSubidaBase64 = null;

// Referencias del Modal de Descarga ZIP
const zipModal = document.getElementById('zipModal');
const zipModalBackdrop = document.getElementById('zipModalBackdrop');
const zipModalClose = document.getElementById('zipModalClose');
const btnZipAll = document.getElementById('btnZipAll');
const btnZipFavs = document.getElementById('btnZipFavs');
const zipProgress = document.getElementById('zipProgress');
const zipProgressBar = document.getElementById('zipProgressBar');
const zipProgressText = document.getElementById('zipProgressText');

// ===================================================
// INICIALIZACIÓN
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarTema();
    inicializarVista();
    actualizarContadores();
    renderizarGaleria();
    setupEventListeners();
});

// Obtener todas las imágenes combinadas (originales + subidas por el usuario)
function obtenerTodasLasImagenes() {
    return [...imagenesIniciales, ...fotosPersonalizadas];
}

// ===================================================
// RENDERIZADO DE LA GALERÍA
// ===================================================
function renderizarGaleria() {
    const listaCompleta = obtenerTodasLasImagenes();

    // 1. Filtrado
    imagenesFiltradas = listaCompleta.filter(img => {
        const coincideCategoria = 
            categoriaActual === 'todos' ? true :
            categoriaActual === 'favoritos' ? favoritos.includes(img.id) :
            img.categoria === categoriaActual;

        const termino = busquedaActual.toLowerCase().trim();
        const coincideBusqueda = 
            termino === '' ||
            img.titulo.toLowerCase().includes(termino) ||
            img.categoriaLabel.toLowerCase().includes(termino) ||
            (img.ubicacion && img.ubicacion.toLowerCase().includes(termino)) ||
            (img.tags && img.tags.some(tag => tag.toLowerCase().includes(termino)));

        return coincideCategoria && coincideBusqueda;
    });

    // 2. Ordenamiento
    if (ordenActual === 'nombre-asc') {
        imagenesFiltradas.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if (ordenActual === 'nombre-desc') {
        imagenesFiltradas.sort((a, b) => b.titulo.localeCompare(a.titulo));
    } else if (ordenActual === 'recientes') {
        imagenesFiltradas.sort((a, b) => b.id - a.id);
    }

    // 3. Render en pantalla
    galleryGrid.innerHTML = '';

    if (imagenesFiltradas.length === 0) {
        galleryStatus.style.display = 'block';
        if (categoriaActual === 'favoritos' && favoritos.length === 0) {
            galleryStatus.innerHTML = `
                <p style="font-size: 2rem; margin-bottom: 8px;">❤️</p>
                <h3 style="font-size: 1.2rem; font-weight: 700;">Aún no tienes favoritos</h3>
                <p style="font-size: 0.95rem; margin-top: 6px; color: var(--text-muted)">Haz clic en el corazón de cualquier imagen para guardarla aquí.</p>
            `;
        } else {
            galleryStatus.innerHTML = `
                <p style="font-size: 2rem; margin-bottom: 8px;">🔍</p>
                <h3 style="font-size: 1.2rem; font-weight: 700;">No se encontraron paisajes</h3>
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
                ${img.esPersonalizada ? '<span class="custom-badge">Subida</span>' : ''}
            </div>
            <div class="tarjeta-body">
                <div>
                    <h3 class="tarjeta-title" title="${img.titulo}">${img.titulo}</h3>
                    ${img.ubicacion ? `
                        <div class="location-pill">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>${img.ubicacion}</span>
                        </div>
                    ` : ''}
                </div>
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
    actualizarContadores();
    renderizarGaleria();

    if (lightboxModal.classList.contains('open')) {
        const imagenActual = imagenesFiltradas[imagenModalActualIndex];
        if (imagenActual && imagenActual.id === id) {
            actualizarBotonModalFav(favoritos.includes(id));
        }
    }
}

function actualizarContadores() {
    totalCountSpan.textContent = obtenerTodasLasImagenes().length;
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
// VISOR DE IMAGEN (LIGHTBOX) CON ZOOM
// ===================================================
function abrirLightbox(index) {
    if (index < 0 || index >= imagenesFiltradas.length) return;
    imagenModalActualIndex = index;
    const imgData = imagenesFiltradas[index];

    resetearZoom();

    modalImg.src = imgData.src;
    modalTitle.textContent = imgData.titulo;
    modalCategory.textContent = imgData.categoriaLabel;

    if (imgData.ubicacion) {
        modalLocation.style.display = 'inline-flex';
        modalLocationText.textContent = imgData.ubicacion;
    } else {
        modalLocation.style.display = 'none';
    }

    // Configurar descarga
    modalDownloadBtn.href = imgData.src;
    modalDownloadBtn.download = `${imgData.titulo.toLowerCase().replace(/\s+/g, '-')}.jpg`;

    // Configurar compartir
    modalShareBtn.onclick = () => compartirImagen(imgData.src, imgData.titulo);

    // Configurar favorito
    actualizarBotonModalFav(favoritos.includes(imgData.id));
    modalFavBtn.onclick = () => toggleFavorito(null, imgData.id);

    // Botón eliminar si es foto personalizada
    if (imgData.esPersonalizada) {
        modalDeleteBtn.style.display = 'inline-flex';
        modalDeleteBtn.onclick = () => eliminarFotoPersonalizada(imgData.id);
    } else {
        modalDeleteBtn.style.display = 'none';
    }

    lightboxModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
    lightboxModal.classList.remove('open');
    document.body.style.overflow = '';
    resetearZoom();
}

function navegarLightbox(direccion) {
    let nuevoIndex = imagenModalActualIndex + direccion;
    if (nuevoIndex < 0) nuevoIndex = imagenesFiltradas.length - 1;
    if (nuevoIndex >= imagenesFiltradas.length) nuevoIndex = 0;
    abrirLightbox(nuevoIndex);
}

// Funciones de Zoom
function aplicarZoom() {
    modalImg.style.transform = `scale(${zoomActual}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
    zoomLevelSpan.textContent = `${Math.round(zoomActual * 100)}%`;
    modalImg.style.cursor = zoomActual > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default';
}

function zoomIn() {
    if (zoomActual < 3) {
        zoomActual = Math.min(3, +(zoomActual + 0.25).toFixed(2));
        aplicarZoom();
    }
}

function zoomOut() {
    if (zoomActual > 0.75) {
        zoomActual = Math.max(0.75, +(zoomActual - 0.25).toFixed(2));
        if (zoomActual <= 1) {
            currentTranslateX = 0;
            currentTranslateY = 0;
        }
        aplicarZoom();
    }
}

function resetearZoom() {
    zoomActual = 1;
    currentTranslateX = 0;
    currentTranslateY = 0;
    aplicarZoom();
}

// Arrastre con zoom
modalImgContainer.addEventListener('mousedown', (e) => {
    if (zoomActual <= 1) return;
    isPanning = true;
    startX = e.clientX - currentTranslateX;
    startY = e.clientY - currentTranslateY;
    modalImg.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
    if (!isPanning || zoomActual <= 1) return;
    e.preventDefault();
    currentTranslateX = e.clientX - startX;
    currentTranslateY = e.clientY - startY;
    aplicarZoom();
});

window.addEventListener('mouseup', () => {
    if (isPanning) {
        isPanning = false;
        if (modalImg) modalImg.style.cursor = zoomActual > 1 ? 'grab' : 'default';
    }
});

// Zoom con la rueda del ratón
modalImgContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        zoomIn();
    } else {
        zoomOut();
    }
}, { passive: false });

// ===================================================
// SUBIR FOTOGRAFÍAS (SIN TOCAR CÓDIGO)
// ===================================================
function abrirModalSubir() {
    uploadModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function cerrarModalSubir() {
    uploadModal.classList.remove('open');
    document.body.style.overflow = '';
    limpiarFormularioSubir();
}

function limpiarFormularioSubir() {
    uploadForm.reset();
    imagenSubidaBase64 = null;
    dropzonePrompt.style.display = 'block';
    dropzonePreview.style.display = 'none';
    previewImg.src = '';
}

// Manejo del archivo seleccionado
function procesarArchivoSeleccionado(archivo) {
    if (!archivo || !archivo.type.startsWith('image/')) {
        mostrarToast("Por favor selecciona un archivo de imagen válido");
        return;
    }

    const lector = new FileReader();
    lector.onload = (e) => {
        imagenSubidaBase64 = e.target.result;
        previewImg.src = imagenSubidaBase64;
        dropzonePrompt.style.display = 'none';
        dropzonePreview.style.display = 'block';

        // Sugerir título si está vacío
        if (!inputTitulo.value) {
            const nombreSinExtension = archivo.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            inputTitulo.value = nombreSinExtension.charAt(0).toUpperCase() + nombreSinExtension.slice(1);
        }
    };
    lector.readAsDataURL(archivo);
}

// Drag and drop en dropzone
dropzone.addEventListener('click', (e) => {
    if (e.target !== btnRemovePreview) fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        procesarArchivoSeleccionado(e.target.files[0]);
    }
});

btnRemovePreview.addEventListener('click', (e) => {
    e.stopPropagation();
    limpiarFormularioSubir();
});

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        procesarArchivoSeleccionado(e.dataTransfer.files[0]);
    }
});

// Guardar nueva imagen
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!imagenSubidaBase64) {
        mostrarToast("Debes seleccionar o arrastrar una imagen");
        return;
    }

    const etiquetasArray = inputEtiquetas.value
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

    const categoriasNombres = {
        montanas: "Montañas",
        bosques: "Bosques",
        lagos: "Lagos y Playas",
        atardeceres: "Atardeceres"
    };

    const nuevaImagen = {
        id: Date.now(), // ID único basado en timestamp
        titulo: inputTitulo.value.trim(),
        categoria: inputCategoria.value,
        categoriaLabel: categoriasNombres[inputCategoria.value] || "Paisajes",
        ubicacion: inputUbicacion.value.trim(),
        src: imagenSubidaBase64,
        tags: etiquetasArray,
        esPersonalizada: true,
        fecha: new Date().toISOString()
    };

    fotosPersonalizadas.unshift(nuevaImagen);
    localStorage.setItem('galeria_fotos_personalizadas', JSON.stringify(fotosPersonalizadas));

    mostrarToast("¡Fotografía agregada a la galería con éxito! 🎉");
    cerrarModalSubir();
    actualizarContadores();
    renderizarGaleria();
});

// Eliminar foto personalizada
function eliminarFotoPersonalizada(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta fotografía de tu galería?")) {
        fotosPersonalizadas = fotosPersonalizadas.filter(f => f.id !== id);
        favoritos = favoritos.filter(favId => favId !== id);
        
        localStorage.setItem('galeria_fotos_personalizadas', JSON.stringify(fotosPersonalizadas));
        localStorage.setItem('galeria_favoritos', JSON.stringify(favoritos));

        cerrarLightbox();
        actualizarContadores();
        renderizarGaleria();
        mostrarToast("Fotografía eliminada");
    }
}

// ===================================================
// DESCARGA EN ZIP (JSZip)
// ===================================================
function abrirModalZip() {
    zipModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    zipProgress.style.display = 'none';
}

function cerrarModalZip() {
    zipModal.classList.remove('open');
    document.body.style.overflow = '';
}

async function empaquetarYDescargarZip(soloFavoritas = false) {
    if (typeof JSZip === 'undefined') {
        mostrarToast("La herramienta de compresión no está disponible sin conexión");
        return;
    }

    let imagenesADescargar = soloFavoritas 
        ? obtenerTodasLasImagenes().filter(img => favoritos.includes(img.id))
        : obtenerTodasLasImagenes();

    if (imagenesADescargar.length === 0) {
        mostrarToast("No hay imágenes para descargar en esta selección");
        return;
    }

    const zip = new JSZip();
    zipProgress.style.display = 'block';
    zipProgressBar.style.width = '0%';
    zipProgressText.textContent = `Descargando 0 de ${imagenesADescargar.length} imágenes...`;

    let procesadas = 0;

    for (const img of imagenesADescargar) {
        try {
            const nombreArchivo = `${img.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;

            if (img.src.startsWith('data:image')) {
                // Imagen en Base64
                const base64Data = img.src.split(',')[1];
                zip.file(nombreArchivo, base64Data, { base64: true });
            } else {
                // Imagen local
                const respuesta = await fetch(img.src);
                const blob = await respuesta.blob();
                zip.file(nombreArchivo, blob);
            }
        } catch (err) {
            console.error("Error al añadir imagen al zip:", err);
        }

        procesadas++;
        const porcentaje = Math.round((procesadas / imagenesADescargar.length) * 80);
        zipProgressBar.style.width = `${porcentaje}%`;
        zipProgressText.textContent = `Procesando ${procesadas} de ${imagenesADescargar.length}...`;
    }

    zipProgressText.textContent = "Generando archivo comprimido ZIP...";
    zipProgressBar.style.width = "90%";

    const contenidoZip = await zip.generateAsync({ type: "blob" });

    // Descarga automática
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(contenidoZip);
    enlace.download = soloFavoritas ? "mis-paisajes-favoritos.zip" : "galeria-de-paisajes.zip";
    enlace.click();
    URL.revokeObjectURL(enlace.href);

    zipProgressBar.style.width = "100%";
    zipProgressText.textContent = "¡Descarga lista!";

    setTimeout(() => {
        cerrarModalZip();
        mostrarToast("¡Archivo ZIP descargado con éxito!");
    }, 800);
}

// ===================================================
// VISTAS Y ORDENAMIENTO
// ===================================================
function inicializarVista() {
    viewBtns.forEach(btn => {
        if (btn.getAttribute('data-view') === vistaActual) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    galleryGrid.className = `galeria vista-${vistaActual}`;
}

function cambiarVista(nuevaVista) {
    vistaActual = nuevaVista;
    localStorage.setItem('galeria_vista', nuevaVista);
    inicializarVista();
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
        } catch (err) {}
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
// SISTEMA DE NOTIFICACIONES TOAST
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
// EVENT LISTENERS GENERALES
// ===================================================
function setupEventListeners() {
    // Tema
    themeToggle.addEventListener('click', cambiarTema);

    // Modal Subir Foto
    btnAbrirSubir.addEventListener('click', abrirModalSubir);
    uploadModalClose.addEventListener('click', cerrarModalSubir);
    uploadModalBackdrop.addEventListener('click', cerrarModalSubir);
    btnCancelUpload.addEventListener('click', cerrarModalSubir);

    // Modal Descargar ZIP
    btnDescargarZip.addEventListener('click', abrirModalZip);
    zipModalClose.addEventListener('click', cerrarModalZip);
    zipModalBackdrop.addEventListener('click', cerrarModalZip);
    btnZipAll.addEventListener('click', () => empaquetarYDescargarZip(false));
    btnZipFavs.addEventListener('click', () => empaquetarYDescargarZip(true));

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

    // Ordenamiento
    sortSelect.addEventListener('change', (e) => {
        ordenActual = e.target.value;
        renderizarGaleria();
    });

    // Cambio de vista
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            cambiarVista(btn.getAttribute('data-view'));
        });
    });

    // Filtros por categorías
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

    // Zoom
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    zoomResetBtn.addEventListener('click', resetearZoom);

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
        if (lightboxModal.classList.contains('open')) {
            if (e.key === 'Escape') cerrarLightbox();
            if (e.key === 'ArrowLeft') navegarLightbox(-1);
            if (e.key === 'ArrowRight') navegarLightbox(1);
            if (e.key === '+' || e.key === '=') zoomIn();
            if (e.key === '-') zoomOut();
        } else if (uploadModal.classList.contains('open')) {
            if (e.key === 'Escape') cerrarModalSubir();
        } else if (zipModal.classList.contains('open')) {
            if (e.key === 'Escape') cerrarModalZip();
        }
    });
}
