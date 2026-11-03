// ===================================================
// NUBE (SUPABASE): fotos compartidas y estadísticas
// ===================================================
// Las 13 fotos iniciales (datos.js) se normalizan para usar ids de texto
const IMAGENES_BASE = imagenesIniciales.map((i) => ({
    ...i,
    id: String(i.id),
    orden: Number(i.id),
    descargaUrl: i.src
}));

let fotosNube = [];
let esAdmin = false;
let adminEmail = '';
let vistaPrincipal = 'galeria';
let estadisticas = null;
let supa = null;
try {
    if (window.supabase && typeof SUPABASE_URL !== 'undefined') {
        supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) {
    console.warn('No se pudo iniciar Supabase:', e);
}

function filaAFoto(fila) {
    const nombre = String(fila.titulo || 'foto').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.jpg';
    return {
        id: String(fila.id),
        titulo: fila.titulo,
        categoria: fila.categoria,
        categoriaLabel: fila.categoria_label || 'Paisajes',
        ubicacion: fila.ubicacion || '',
        src: fila.src,
        tags: fila.tags || [],
        orden: Date.parse(fila.created_at) || 0,
        descargaUrl: fila.src + '?download=' + encodeURIComponent(nombre),
        esNube: true
    };
}

async function cargarFotosNube() {
    if (!supa) return [];
    try {
        const { data, error } = await supa
            .from('fotos')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(filaAFoto);
    } catch (e) {
        console.warn('No se pudieron cargar las fotos de la nube:', e);
        return [];
    }
}

// Registra una estadística anónima (visita, vista, descarga, compartir, favorito)
async function registrarEvento(tipo, fotoRef) {
    if (!supa) return;
    try {
        const { data } = await supa.auth.getSession();
        if (data && data.session) return; // no contar las acciones del administrador
        await supa.from('eventos').insert({ tipo: tipo, foto_ref: fotoRef ? String(fotoRef) : null });
    } catch (e) { /* las estadísticas nunca deben romper la galería */ }
}

// ===================================================
// ESTADO DE LA APLICACIÓN
// ===================================================
let favoritos = JSON.parse(localStorage.getItem('galeria_favoritos') || '[]').map(String);
let categoriaActual = 'todos';
let busquedaActual = '';
let ordenActual = 'predeterminado';
let vistaActual = localStorage.getItem('galeria_vista') || 'normal';

let imagenModalActualIndex = 0;
let imagenesFiltradas = [];

// Estado de Zoom
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
const btnAbrirLogin = document.getElementById('btnAbrirLogin');
const btnAdminLogout = document.getElementById('btnAdminLogout');
const adminTabs = document.getElementById('adminTabs');
const adminEmailLabel = document.getElementById('adminEmailLabel');
const vistaGaleria = document.getElementById('vistaGaleria');
const adminView = document.getElementById('adminView');
const adminEstado = document.getElementById('adminEstado');
const statTiles = document.getElementById('statTiles');
const visitasChart = document.getElementById('visitasChart');
const panelFilas = document.getElementById('panelFilas');
const panelOrden = document.getElementById('panelOrden');
const btnPanelActualizar = document.getElementById('btnPanelActualizar');
const favToolbar = document.getElementById('favToolbar');
const btnDescargarFavs = document.getElementById('btnDescargarFavs');
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
const modalEditBtn = document.getElementById('modalEditBtn');
const modalDeleteBtn = document.getElementById('modalDeleteBtn');

// Controles de Zoom
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');
const zoomLevelSpan = document.getElementById('zoomLevel');

// Modales del administrador
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const adminEmailInput = document.getElementById('adminEmailInput');
const adminPassInput = document.getElementById('adminPassInput');
const btnTogglePass = document.getElementById('btnTogglePass');
const loginError = document.getElementById('loginError');
const btnSubmitLogin = document.getElementById('btnSubmitLogin');

const uploadModal = document.getElementById('uploadModal');
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
const btnSubmitUpload = document.getElementById('btnSubmitUpload');
let imagenSubidaBlob = null;

const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editFotoId = document.getElementById('editFotoId');
const editTitulo = document.getElementById('editTitulo');
const editCategoria = document.getElementById('editCategoria');
const editUbicacion = document.getElementById('editUbicacion');
const editEtiquetas = document.getElementById('editEtiquetas');
const btnSubmitEdit = document.getElementById('btnSubmitEdit');

// ===================================================
// INICIALIZACIÓN
// ===================================================
document.addEventListener('DOMContentLoaded', async () => {
    inicializarTema();
    inicializarVista();

    // Primero se muestran las fotos iniciales, sin esperar a la nube
    actualizarContadores();
    renderizarGaleria();
    setupEventListeners();
    iniciarSesionAdmin();

    // Una visita por sesión del navegador
    try {
        if (!sessionStorage.getItem('galeria_visita')) {
            sessionStorage.setItem('galeria_visita', '1');
            registrarEvento('visita', null);
        }
    } catch (e) {}

    // Después se cargan las fotos que subió el administrador
    fotosNube = await cargarFotosNube();
    if (fotosNube.length > 0) {
        actualizarContadores();
        renderizarGaleria();
    }
});

function obtenerTodasLasImagenes() {
    return [...fotosNube, ...IMAGENES_BASE];
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
        imagenesFiltradas.sort((a, b) => (b.orden || 0) - (a.orden || 0));
    }

    // 3. Render en pantalla
    galleryGrid.innerHTML = '';
    favToolbar.style.display = (categoriaActual === 'favoritos' && favoritos.length > 0) ? 'flex' : 'none';

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
                <button class="fav-btn ${esFav ? 'active' : ''}" onclick="toggleFavorito(event, '${img.id}')" title="${esFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${esFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                <span class="category-badge">${img.categoriaLabel}</span>
                ${esAdmin && img.esNube ? `
                    <div class="admin-card-actions">
                        <button class="btn-card-admin" onclick="abrirModalEditar(event, '${img.id}')" title="Editar datos de la foto">✏️</button>
                        <button class="btn-card-admin btn-card-delete" onclick="eliminarFoto(event, '${img.id}')" title="Eliminar fotografía">🗑️</button>
                    </div>
                ` : ''}
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
                    <a href="${img.descargaUrl || img.src}" download="${img.titulo.toLowerCase().replace(/\s+/g, '-')}.jpg" onclick="registrarEvento('descarga', '${img.id}')" class="btn btn-primary" title="Descargar imagen">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                        Descargar
                    </a>
                    <button class="btn btn-secondary" onclick="compartirImagen('${img.src}', '${String(img.titulo).replace(/'/g, "\\'")}', '${img.id}')" title="Compartir enlace">
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
        registrarEvento('favorito', id);
    }

    try {
        localStorage.setItem('galeria_favoritos', JSON.stringify(favoritos));
    } catch (e) {}

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
    modalDownloadBtn.href = imgData.descargaUrl || imgData.src;
    modalDownloadBtn.onclick = () => registrarEvento('descarga', imgData.id);
    modalDownloadBtn.download = `${imgData.titulo.toLowerCase().replace(/\s+/g, '-')}.jpg`;

    // Configurar compartir
    modalShareBtn.onclick = () => compartirImagen(imgData.src, imgData.titulo, imgData.id);

    // Configurar favorito
    actualizarBotonModalFav(favoritos.includes(imgData.id));
    modalFavBtn.onclick = () => toggleFavorito(null, imgData.id);

    // Editar / eliminar: solo el administrador y solo fotos de la nube
    if (esAdmin && imgData.esNube) {
        modalEditBtn.style.display = 'inline-flex';
        modalEditBtn.onclick = () => { cerrarLightbox(); abrirModalEditar(null, imgData.id); };
        modalDeleteBtn.style.display = 'inline-flex';
        modalDeleteBtn.onclick = () => { cerrarLightbox(); eliminarFoto(null, imgData.id); };
    } else {
        modalEditBtn.style.display = 'none';
        modalDeleteBtn.style.display = 'none';
    }

    registrarEvento('vista', imgData.id);

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

modalImgContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        zoomIn();
    } else {
        zoomOut();
    }
}, { passive: false });

// ===================================================
// ADMINISTRADOR (Supabase Auth + Storage + base de datos)
// La seguridad real la ponen las políticas RLS de Supabase
// (archivo supabase-seguridad.sql); esto solo muestra u oculta botones.
// ===================================================
const CATEGORIAS_NOMBRES = {
    montanas: 'Montañas',
    bosques: 'Bosques',
    lagos: 'Lagos y Playas',
    atardeceres: 'Atardeceres'
};

function esc(texto) {
    return String(texto == null ? '' : texto)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function listaDeEtiquetas(texto) {
    return texto.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
}

async function iniciarSesionAdmin() {
    if (!supa) return;
    try {
        const { data } = await supa.auth.getSession();
        aplicarSesion(data && data.session);
        supa.auth.onAuthStateChange((_evento, sesion) => aplicarSesion(sesion));
    } catch (e) {
        console.warn('No se pudo leer la sesión:', e);
    }
}

function aplicarSesion(sesion) {
    const eraAdmin = esAdmin;
    esAdmin = !!sesion;
    adminEmail = sesion && sesion.user ? (sesion.user.email || '') : '';
    actualizarUIAdmin();
    if (eraAdmin !== esAdmin) {
        if (!esAdmin) mostrarVistaPrincipal('galeria');
        renderizarGaleria();
    }
}

function actualizarUIAdmin() {
    btnAbrirLogin.style.display = esAdmin ? 'none' : 'inline-flex';
    btnAdminLogout.style.display = esAdmin ? 'inline-flex' : 'none';
    adminTabs.style.display = esAdmin ? 'block' : 'none';
    adminEmailLabel.textContent = adminEmail ? '🛡️ ' + adminEmail : '';
}

function mostrarVistaPrincipal(vista) {
    if (vista === 'panel' && !esAdmin) vista = 'galeria';
    vistaPrincipal = vista;
    vistaGaleria.style.display = vista === 'galeria' ? '' : 'none';
    adminView.style.display = vista === 'panel' ? '' : 'none';
    adminTabs.querySelectorAll('.admin-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-tab') === vista);
    });
    if (vista === 'panel') cargarPanel();
}

// ---------- Inicio y cierre de sesión ----------
function abrirModalLogin() {
    loginModal.classList.add('open');
    loginError.style.display = 'none';
    adminPassInput.value = '';
    adminPassInput.type = 'password';
    btnTogglePass.textContent = '👁️';
    document.body.style.overflow = 'hidden';
    setTimeout(() => adminEmailInput.focus(), 100);
}

function cerrarModalLogin() {
    loginModal.classList.remove('open');
    document.body.style.overflow = '';
    adminPassInput.value = '';
    loginError.style.display = 'none';
}

async function procesarLogin(e) {
    e.preventDefault();
    if (!supa) {
        loginError.textContent = '⚠️ No hay conexión con Supabase.';
        loginError.style.display = 'block';
        return;
    }
    btnSubmitLogin.disabled = true;
    btnSubmitLogin.textContent = 'Entrando...';
    try {
        const { error } = await supa.auth.signInWithPassword({
            email: adminEmailInput.value.trim(),
            password: adminPassInput.value
        });
        if (error) throw error;
        cerrarModalLogin();
        mostrarToast('¡Bienvenido! Sesión de administrador iniciada 🛡️');
        mostrarVistaPrincipal('panel');
    } catch (err) {
        const msg = String(err && err.message || '');
        loginError.textContent = /invalid login/i.test(msg)
            ? '⚠️ Correo o contraseña incorrectos.'
            : '⚠️ No se pudo entrar: ' + msg;
        loginError.style.display = 'block';
        adminPassInput.select();
    } finally {
        btnSubmitLogin.disabled = false;
        btnSubmitLogin.textContent = 'Entrar';
    }
}

async function cerrarSesionAdmin() {
    try { await supa.auth.signOut(); } catch (e) {}
    aplicarSesion(null);
    mostrarToast('Sesión cerrada.');
}

// ---------- Subir foto ----------
function abrirModalSubir() {
    if (!esAdmin) return;
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
    imagenSubidaBlob = null;
    dropzonePrompt.style.display = 'block';
    dropzonePreview.style.display = 'none';
    if (previewImg.src.startsWith('blob:')) URL.revokeObjectURL(previewImg.src);
    previewImg.removeAttribute('src');
}

// Reduce la foto a máx. 1920 px y la convierte en JPEG ligero
function optimizarImagen(archivo) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(archivo);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            const limite = 1920;
            let ancho = img.width, alto = img.height;
            if (ancho > limite || alto > limite) {
                if (ancho > alto) { alto = Math.round(alto * limite / ancho); ancho = limite; }
                else { ancho = Math.round(ancho * limite / alto); alto = limite; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = ancho;
            canvas.height = alto;
            canvas.getContext('2d').drawImage(img, 0, 0, ancho, alto);
            canvas.toBlob(b => b ? resolve(b) : reject(new Error('No se pudo comprimir la imagen')), 'image/jpeg', 0.86);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
        img.src = url;
    });
}

async function procesarArchivoSeleccionado(archivo) {
    if (!archivo || !archivo.type.startsWith('image/')) {
        mostrarToast('Selecciona un archivo de imagen válido');
        return;
    }
    try {
        imagenSubidaBlob = await optimizarImagen(archivo);
        if (previewImg.src.startsWith('blob:')) URL.revokeObjectURL(previewImg.src);
        previewImg.src = URL.createObjectURL(imagenSubidaBlob);
        dropzonePrompt.style.display = 'none';
        dropzonePreview.style.display = 'block';
        if (!inputTitulo.value) {
            const nombre = archivo.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            inputTitulo.value = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        }
    } catch (err) {
        mostrarToast('No se pudo procesar la imagen');
    }
}

// Si ya hay fotos en la nube, usa su mismo bucket; si no, el de config.js
function bucketActual() {
    for (const f of fotosNube) {
        const r = rutaDeStorage(f.src);
        if (r) return r.bucket;
    }
    return typeof BUCKET_FOTOS !== 'undefined' ? BUCKET_FOTOS : 'fotos';
}

function rutaDeStorage(url) {
    const m = String(url || '').match(/\/storage\/v1\/object\/public\/([^/]+)\/([^?]+)/);
    return m ? { bucket: m[1], path: decodeURIComponent(m[2]) } : null;
}

async function subirFoto(e) {
    e.preventDefault();
    if (!esAdmin) return;
    if (!imagenSubidaBlob) {
        mostrarToast('Selecciona o arrastra una imagen');
        return;
    }
    const titulo = inputTitulo.value.trim();
    const bucket = bucketActual();
    const slug = titulo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'foto';
    const nombreArchivo = `${Date.now()}-${slug}.jpg`;

    btnSubmitUpload.disabled = true;
    btnSubmitUpload.textContent = 'Subiendo...';
    try {
        const { error: errSubida } = await supa.storage.from(bucket).upload(nombreArchivo, imagenSubidaBlob, {
            contentType: 'image/jpeg',
            cacheControl: '31536000',
            upsert: false
        });
        if (errSubida) throw errSubida;

        const { data: pub } = supa.storage.from(bucket).getPublicUrl(nombreArchivo);
        const { data, error } = await supa.from('fotos').insert({
            titulo: titulo,
            categoria: inputCategoria.value,
            categoria_label: CATEGORIAS_NOMBRES[inputCategoria.value] || 'Paisajes',
            ubicacion: inputUbicacion.value.trim(),
            src: pub.publicUrl,
            tags: listaDeEtiquetas(inputEtiquetas.value)
        }).select().single();

        if (error) {
            await supa.storage.from(bucket).remove([nombreArchivo]); // no dejar archivos huérfanos
            throw error;
        }

        fotosNube.unshift(filaAFoto(data));
        cerrarModalSubir();
        actualizarContadores();
        renderizarGaleria();
        if (vistaPrincipal === 'panel') renderizarPanel();
        mostrarToast('¡Foto subida! Ya la ven todos los visitantes 🎉');
    } catch (err) {
        console.error(err);
        mostrarToast('No se pudo subir: ' + (err.message || err));
    } finally {
        btnSubmitUpload.disabled = false;
        btnSubmitUpload.textContent = 'Subir a la galería';
    }
}

// ---------- Editar ----------
function abrirModalEditar(e, id) {
    if (e) e.stopPropagation();
    const foto = fotosNube.find(f => f.id === String(id));
    if (!foto) return;
    editFotoId.value = foto.id;
    editTitulo.value = foto.titulo || '';
    editCategoria.value = foto.categoria || 'montanas';
    editUbicacion.value = foto.ubicacion || '';
    editEtiquetas.value = (foto.tags || []).join(', ');
    editModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => editTitulo.focus(), 100);
}

function cerrarModalEditar() {
    editModal.classList.remove('open');
    document.body.style.overflow = '';
    editForm.reset();
}

async function guardarEdicion(e) {
    e.preventDefault();
    const id = editFotoId.value;
    const cambios = {
        titulo: editTitulo.value.trim(),
        categoria: editCategoria.value,
        categoria_label: CATEGORIAS_NOMBRES[editCategoria.value] || 'Paisajes',
        ubicacion: editUbicacion.value.trim(),
        tags: listaDeEtiquetas(editEtiquetas.value)
    };
    btnSubmitEdit.disabled = true;
    try {
        const { data, error } = await supa.from('fotos').update(cambios).eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Supabase no permitió el cambio (revisa las políticas RLS)');
        const i = fotosNube.findIndex(f => f.id === id);
        if (i > -1) fotosNube[i] = filaAFoto(data[0]);
        cerrarModalEditar();
        renderizarGaleria();
        if (vistaPrincipal === 'panel') renderizarPanel();
        mostrarToast('Información actualizada ✏️');
    } catch (err) {
        console.error(err);
        mostrarToast('No se pudo guardar: ' + (err.message || err));
    } finally {
        btnSubmitEdit.disabled = false;
    }
}

// ---------- Eliminar ----------
async function eliminarFoto(e, id) {
    if (e) e.stopPropagation();
    id = String(id);
    const foto = fotosNube.find(f => f.id === id);
    if (!foto) return;
    if (!confirm(`¿Eliminar "${foto.titulo}" de la galería? Esta acción no se puede deshacer.`)) return;
    try {
        const { data, error } = await supa.from('fotos').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Supabase no permitió borrar (revisa las políticas RLS)');

        const ruta = rutaDeStorage(foto.src);
        if (ruta) {
            const { error: errArchivo } = await supa.storage.from(ruta.bucket).remove([ruta.path]);
            if (errArchivo) console.warn('La fila se borró pero el archivo no:', errArchivo);
        }
        fotosNube = fotosNube.filter(f => f.id !== id);
        favoritos = favoritos.filter(f => f !== id);
        try { localStorage.setItem('galeria_favoritos', JSON.stringify(favoritos)); } catch (er) {}
        actualizarContadores();
        renderizarGaleria();
        if (vistaPrincipal === 'panel') renderizarPanel();
        mostrarToast('Fotografía eliminada');
    } catch (err) {
        console.error(err);
        mostrarToast('No se pudo eliminar: ' + (err.message || err));
    }
}

// ---------- Panel: estadísticas ----------
async function cargarEventos() {
    const paso = 1000;
    let todos = [];
    for (let desde = 0; desde < 100000; desde += paso) {
        const { data, error } = await supa.from('eventos').select('*')
            .order('created_at', { ascending: true })
            .range(desde, desde + paso - 1);
        if (error) throw error;
        todos = todos.concat(data || []);
        if (!data || data.length < paso) break;
    }
    return todos;
}

function claveDia(fecha) {
    const p = n => String(n).padStart(2, '0');
    return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}`;
}

function calcularEstadisticas(eventos) {
    const total = { visita: 0, vista: 0, descarga: 0, compartir: 0, favorito: 0 };
    const porFoto = {};
    const visitasPorDia = {};
    eventos.forEach(ev => {
        if (total[ev.tipo] === undefined) return;
        total[ev.tipo]++;
        if (ev.foto_ref) {
            const f = porFoto[ev.foto_ref] || (porFoto[ev.foto_ref] = { vista: 0, descarga: 0, compartir: 0, favorito: 0 });
            if (f[ev.tipo] !== undefined) f[ev.tipo]++;
        }
        if (ev.tipo === 'visita' && ev.created_at) {
            const k = claveDia(new Date(ev.created_at));
            visitasPorDia[k] = (visitasPorDia[k] || 0) + 1;
        }
    });
    return { total, porFoto, visitasPorDia, cantidad: eventos.length };
}

async function cargarPanel() {
    if (!esAdmin || !supa) return;
    adminEstado.textContent = 'Cargando estadísticas…';
    try {
        const eventos = await cargarEventos();
        estadisticas = calcularEstadisticas(eventos);
        adminEstado.textContent = `Actualizado a las ${new Date().toLocaleTimeString('es')} · ${eventos.length} eventos registrados (tus propias acciones no se cuentan)`;
    } catch (err) {
        console.error(err);
        estadisticas = calcularEstadisticas([]);
        adminEstado.textContent = '⚠️ No se pudieron leer las estadísticas: ' + (err.message || err) + '. Ejecuta supabase-seguridad.sql en Supabase.';
    }
    renderizarPanel();
}

function renderizarPanel() {
    const est = estadisticas || calcularEstadisticas([]);
    const t = est.total;
    const tiles = [
        ['Fotos', obtenerTodasLasImagenes().length],
        ['Visitas', t.visita],
        ['Fotos abiertas', t.vista],
        ['Descargas', t.descarga],
        ['Compartidas', t.compartir],
        ['Favoritos', t.favorito]
    ];
    statTiles.innerHTML = tiles.map(([l, n]) =>
        `<div class="stat-tile"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');

    // Visitas últimos 14 días
    const dias = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dias.push({ k: claveDia(d), lbl: `${d.getDate()}/${d.getMonth() + 1}` });
    }
    const max = Math.max(1, ...dias.map(d => est.visitasPorDia[d.k] || 0));
    visitasChart.innerHTML = dias.map(d => {
        const n = est.visitasPorDia[d.k] || 0;
        return `<div class="bar-col" title="${d.lbl}: ${n} visitas">
            <span class="bar-val">${n || ''}</span>
            <div class="bar" style="height:${Math.round(n / max * 100)}%"></div>
            <span class="bar-lbl">${d.lbl}</span></div>`;
    }).join('');

    // Tabla por foto
    const cero = { vista: 0, descarga: 0, compartir: 0, favorito: 0 };
    const filas = obtenerTodasLasImagenes().map(f => ({ f, s: est.porFoto[f.id] || cero }));
    const criterio = panelOrden.value;
    if (criterio === 'reciente') filas.sort((a, b) => (b.f.orden || 0) - (a.f.orden || 0));
    else filas.sort((a, b) => b.s[criterio] - a.s[criterio] || b.s.vista - a.s.vista);

    panelFilas.innerHTML = filas.map(({ f, s }) => `
        <tr>
            <td><div class="foto-cell">
                <img src="${esc(f.src)}" alt="" loading="lazy">
                <div><div class="t">${esc(f.titulo)}${f.esNube ? '' : '<span class="tag-fija">Fija</span>'}</div>
                <div class="c">${esc(f.categoriaLabel)}${f.ubicacion ? ' · ' + esc(f.ubicacion) : ''}</div></div>
            </div></td>
            <td class="num">${s.vista}</td>
            <td class="num">${s.descarga}</td>
            <td class="num">${s.favorito}</td>
            <td class="num">${s.compartir}</td>
            <td class="acc">${f.esNube ? `
                <button class="row-btn" data-accion="editar" data-id="${esc(f.id)}" title="Editar">✏️</button>
                <button class="row-btn del" data-accion="borrar" data-id="${esc(f.id)}" title="Eliminar">🗑️</button>` : ''}</td>
        </tr>`).join('');
}

// ===================================================
// DESCARGA DE FAVORITAS (archivos individuales)
// ===================================================
async function descargarFavoritas() {
    const imagenesADescargar = obtenerTodasLasImagenes().filter(img => favoritos.includes(String(img.id)));

    if (imagenesADescargar.length === 0) {
        mostrarToast("No tienes fotos favoritas para descargar");
        return;
    }

    mostrarToast(`Descargando ${imagenesADescargar.length} fotos...`);

    const nombresUsados = {};

    for (const img of imagenesADescargar) {
        const base = img.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-');
        nombresUsados[base] = (nombresUsados[base] || 0) + 1;
        const nombreArchivo = nombresUsados[base] > 1
            ? `${base}-${nombresUsados[base]}.jpg`
            : `${base}.jpg`;

        const enlace = document.createElement('a');
        enlace.download = nombreArchivo;
        let urlTemporal = null;

        try {
            if (img.src.startsWith('data:image')) {
                enlace.href = img.src;
            } else {
                const respuesta = await fetch(img.src);
                const blob = await respuesta.blob();
                urlTemporal = URL.createObjectURL(blob);
                enlace.href = urlTemporal;
            }
        } catch (err) {
            enlace.href = img.src;
        }

        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        if (urlTemporal) setTimeout(() => URL.revokeObjectURL(urlTemporal), 1000);

        // Pausa corta para que el navegador no bloquee las descargas seguidas
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    mostrarToast("¡Descarga de favoritas completada!");
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
    try {
        localStorage.setItem('galeria_vista', nuevaVista);
    } catch (e) {}
    inicializarVista();
}

// ===================================================
// COMPARTIR (WEB SHARE API + FALLBACK)
// ===================================================
async function compartirImagen(ruta, titulo, id) {
    registrarEvento('compartir', id);
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
    try {
        localStorage.setItem('galeria_tema', nuevo);
    } catch (e) {}
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
    themeToggle.addEventListener('click', cambiarTema);

    // --- Administrador ---
    btnAbrirLogin.addEventListener('click', abrirModalLogin);
    document.getElementById('loginModalClose').addEventListener('click', cerrarModalLogin);
    document.getElementById('loginModalBackdrop').addEventListener('click', cerrarModalLogin);
    document.getElementById('btnCancelLogin').addEventListener('click', cerrarModalLogin);
    loginForm.addEventListener('submit', procesarLogin);
    btnTogglePass.addEventListener('click', () => {
        const oculta = adminPassInput.type === 'password';
        adminPassInput.type = oculta ? 'text' : 'password';
        btnTogglePass.textContent = oculta ? '🙈' : '👁️';
    });
    btnAdminLogout.addEventListener('click', cerrarSesionAdmin);

    adminTabs.querySelectorAll('.admin-tab').forEach(t => {
        t.addEventListener('click', () => mostrarVistaPrincipal(t.getAttribute('data-tab')));
    });
    btnPanelActualizar.addEventListener('click', cargarPanel);
    panelOrden.addEventListener('change', renderizarPanel);
    panelFilas.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-accion]');
        if (!b) return;
        if (b.dataset.accion === 'editar') abrirModalEditar(null, b.dataset.id);
        if (b.dataset.accion === 'borrar') eliminarFoto(null, b.dataset.id);
    });

    btnAbrirSubir.addEventListener('click', abrirModalSubir);
    document.getElementById('uploadModalClose').addEventListener('click', cerrarModalSubir);
    document.getElementById('uploadModalBackdrop').addEventListener('click', cerrarModalSubir);
    document.getElementById('btnCancelUpload').addEventListener('click', cerrarModalSubir);
    dropzone.addEventListener('click', (e) => { if (!e.target.closest('#btnRemovePreview')) fileInput.click(); });
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) procesarArchivoSeleccionado(e.target.files[0]); });
    btnRemovePreview.addEventListener('click', (e) => { e.stopPropagation(); limpiarFormularioSubir(); });
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) procesarArchivoSeleccionado(e.dataTransfer.files[0]);
    });
    uploadForm.addEventListener('submit', subirFoto);

    document.getElementById('editModalClose').addEventListener('click', cerrarModalEditar);
    document.getElementById('editModalBackdrop').addEventListener('click', cerrarModalEditar);
    document.getElementById('btnCancelEdit').addEventListener('click', cerrarModalEditar);
    editForm.addEventListener('submit', guardarEdicion);


    btnDescargarFavs.addEventListener('click', descargarFavoritas);

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

    sortSelect.addEventListener('change', (e) => {
        ordenActual = e.target.value;
        renderizarGaleria();
    });

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            cambiarVista(btn.getAttribute('data-view'));
        });
    });

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            categoriaActual = chip.getAttribute('data-category');
            renderizarGaleria();
        });
    });

    modalClose.addEventListener('click', cerrarLightbox);
    modalBackdrop.addEventListener('click', cerrarLightbox);
    modalPrev.addEventListener('click', () => navegarLightbox(-1));
    modalNext.addEventListener('click', () => navegarLightbox(1));

    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    zoomResetBtn.addEventListener('click', resetearZoom);

    document.addEventListener('keydown', (e) => {
        if (lightboxModal.classList.contains('open')) {
            if (e.key === 'Escape') cerrarLightbox();
            if (e.key === 'ArrowLeft') navegarLightbox(-1);
            if (e.key === 'ArrowRight') navegarLightbox(1);
            if (e.key === '+' || e.key === '=') zoomIn();
            if (e.key === '-') zoomOut();
        } else if (e.key === 'Escape') {
            if (uploadModal.classList.contains('open')) cerrarModalSubir();
            else if (loginModal.classList.contains('open')) cerrarModalLogin();
            else if (editModal.classList.contains('open')) cerrarModalEditar();
        }
    });
}
