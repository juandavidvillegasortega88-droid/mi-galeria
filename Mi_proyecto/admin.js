// ===================================================
// PANEL DE ADMINISTRADOR
// Subir fotos, borrarlas y ver estadísticas (Supabase)
// ===================================================
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = (id) => document.getElementById(id);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CATEGORIAS = {
    montanas: 'Montañas',
    bosques: 'Bosques',
    lagos: 'Lagos y Playas',
    atardeceres: 'Atardeceres'
};

let fotosNube = [];
let archivoOptimizado = null; // Blob listo para subir

function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    $('toastContainer').appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

// ---------------------------------------------------
// Sesión
// ---------------------------------------------------
async function esAdmin() {
    const { data, error } = await db.rpc('es_admin');
    return !error && data === true;
}

function mostrarLogin() {
    $('vistaLogin').style.display = 'block';
    $('vistaPanel').style.display = 'none';
    $('btnSalir').style.display = 'none';
}

async function entrarAlPanel() {
    $('vistaLogin').style.display = 'none';
    $('vistaPanel').style.display = 'block';
    $('btnSalir').style.display = 'inline-flex';
    await cargarMisFotos();
}

async function iniciar() {
    const { data } = await db.auth.getSession();
    if (data.session && (await esAdmin())) {
        entrarAlPanel();
    } else {
        if (data.session) await db.auth.signOut();
        mostrarLogin();
    }
}

$('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = $('btnLogin');
    boton.disabled = true;
    $('loginMsg').textContent = '';
    const { error } = await db.auth.signInWithPassword({
        email: $('loginEmail').value.trim(),
        password: $('loginPass').value
    });
    if (error) {
        $('loginMsg').textContent = 'Correo o contraseña incorrectos.';
        boton.disabled = false;
        return;
    }
    if (!(await esAdmin())) {
        await db.auth.signOut();
        $('loginMsg').textContent = 'Esta cuenta no tiene permisos de administrador.';
        boton.disabled = false;
        return;
    }
    $('loginPass').value = '';
    boton.disabled = false;
    entrarAlPanel();
});

$('btnSalir').addEventListener('click', async () => {
    await db.auth.signOut();
    mostrarLogin();
});

// ---------------------------------------------------
// Pestañas
// ---------------------------------------------------
document.querySelectorAll('.admin-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach((b) => b.classList.toggle('active', b === btn));
        ['subir', 'fotos', 'stats'].forEach((t) => {
            $('tab-' + t).style.display = t === btn.dataset.tab ? 'block' : 'none';
        });
        if (btn.dataset.tab === 'stats') cargarEstadisticas();
        if (btn.dataset.tab === 'fotos') cargarMisFotos();
    });
});

// ---------------------------------------------------
// Subir fotos
// ---------------------------------------------------
// Reduce la imagen a Full HD (JPEG 84%) para que cargue rápido y pese poco
function optimizarImagen(archivo) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(archivo);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            let ancho = img.width;
            let alto = img.height;
            const limite = 1920;
            if (ancho > limite || alto > limite) {
                if (ancho > alto) {
                    alto = Math.round((alto * limite) / ancho);
                    ancho = limite;
                } else {
                    ancho = Math.round((ancho * limite) / alto);
                    alto = limite;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = ancho;
            canvas.height = alto;
            canvas.getContext('2d').drawImage(img, 0, 0, ancho, alto);
            canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir'))), 'image/jpeg', 0.84);
        };
        img.onerror = () => reject(new Error('No se pudo leer la imagen'));
        img.src = url;
    });
}

function limpiarFormulario() {
    $('uploadForm').reset();
    archivoOptimizado = null;
    $('dropzonePrompt').style.display = 'block';
    $('dropzonePreview').style.display = 'none';
    $('previewImg').src = '';
}

async function procesarArchivo(archivo) {
    if (!archivo || !archivo.type.startsWith('image/')) {
        toast('Selecciona un archivo de imagen válido');
        return;
    }
    toast('Optimizando imagen...');
    try {
        archivoOptimizado = await optimizarImagen(archivo);
        $('previewImg').src = URL.createObjectURL(archivoOptimizado);
        $('dropzonePrompt').style.display = 'none';
        $('dropzonePreview').style.display = 'block';
        if (!$('inputTitulo').value) {
            const nombre = archivo.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            $('inputTitulo').value = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        }
    } catch (err) {
        toast('No se pudo procesar la imagen');
    }
}

$('dropzone').addEventListener('click', (e) => {
    if (e.target !== $('btnRemovePreview')) $('fileInput').click();
});
$('fileInput').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) procesarArchivo(e.target.files[0]);
});
$('btnRemovePreview').addEventListener('click', (e) => {
    e.stopPropagation();
    limpiarFormulario();
});
$('dropzone').addEventListener('dragover', (e) => { e.preventDefault(); $('dropzone').classList.add('dragover'); });
$('dropzone').addEventListener('dragleave', () => $('dropzone').classList.remove('dragover'));
$('dropzone').addEventListener('drop', (e) => {
    e.preventDefault();
    $('dropzone').classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) procesarArchivo(e.dataTransfer.files[0]);
});

$('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!archivoOptimizado) {
        toast('Primero selecciona o arrastra una imagen');
        return;
    }
    const boton = $('btnSubmitUpload');
    boton.disabled = true;
    boton.textContent = 'Subiendo...';

    const ruta = crypto.randomUUID() + '.jpg';
    const categoria = $('inputCategoria').value;
    const tags = $('inputEtiquetas').value
        .split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

    try {
        const { error: errSubida } = await db.storage.from('fotos').upload(ruta, archivoOptimizado, {
            contentType: 'image/jpeg',
            cacheControl: '31536000',
            upsert: false
        });
        if (errSubida) throw errSubida;

        const src = db.storage.from('fotos').getPublicUrl(ruta).data.publicUrl;
        const { error: errFila } = await db.from('fotos').insert({
            titulo: $('inputTitulo').value.trim(),
            categoria: categoria,
            categoria_label: CATEGORIAS[categoria] || 'Paisajes',
            ubicacion: $('inputUbicacion').value.trim() || null,
            src: src,
            ruta: ruta,
            tags: tags
        });
        if (errFila) {
            await db.storage.from('fotos').remove([ruta]); // deshacer
            throw errFila;
        }
        toast('¡Foto publicada! 🎉');
        limpiarFormulario();
    } catch (err) {
        console.error(err);
        toast('No se pudo subir la foto: ' + (err.message || 'error desconocido'));
    }
    boton.disabled = false;
    boton.textContent = 'Guardar en la galería';
});

// ---------------------------------------------------
// Mis fotos (listar y borrar)
// ---------------------------------------------------
async function cargarMisFotos() {
    const { data, error } = await db.from('fotos').select('*').order('created_at', { ascending: false });
    if (error) {
        $('listaFotos').innerHTML = '<p class="admin-vacio">No se pudieron cargar las fotos.</p>';
        return;
    }
    fotosNube = data || [];
    if (fotosNube.length === 0) {
        $('listaFotos').innerHTML = '<p class="admin-vacio">Todavía no has subido fotos nuevas.</p>';
        return;
    }
    $('listaFotos').innerHTML = fotosNube.map((f) => `
        <div class="admin-foto">
            <img src="${esc(f.src)}" alt="${esc(f.titulo)}" loading="lazy">
            <div class="admin-foto-info">
                <strong>${esc(f.titulo)}</strong>
                <span>${esc(f.categoria_label)}${f.ubicacion ? ' · ' + esc(f.ubicacion) : ''}</span>
            </div>
            <button class="btn btn-secondary" data-borrar="${esc(f.id)}">Eliminar</button>
        </div>`).join('');

    $('listaFotos').querySelectorAll('[data-borrar]').forEach((b) => {
        b.addEventListener('click', () => borrarFoto(b.dataset.borrar));
    });
}

async function borrarFoto(id) {
    const foto = fotosNube.find((f) => f.id === id);
    if (!foto) return;
    if (!confirm('¿Eliminar "' + foto.titulo + '" de la galería? No se puede deshacer.')) return;
    const { error } = await db.from('fotos').delete().eq('id', id);
    if (error) {
        toast('No se pudo eliminar la foto');
        return;
    }
    await db.storage.from('fotos').remove([foto.ruta]);
    toast('Foto eliminada');
    cargarMisFotos();
}

// ---------------------------------------------------
// Estadísticas
// ---------------------------------------------------
function ultimosDias(n) {
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    const base = new Date(hoy + 'T00:00:00Z').getTime();
    const dias = [];
    for (let i = n - 1; i >= 0; i--) {
        dias.push(new Date(base - i * 86400000).toISOString().slice(0, 10));
    }
    return dias;
}

async function cargarEstadisticas() {
    $('statsCards').innerHTML = '<p class="admin-vacio">Cargando...</p>';
    const [{ data, error }, { data: filas }] = await Promise.all([
        db.rpc('estadisticas'),
        db.from('fotos').select('id,titulo')
    ]);
    if (error || !data) {
        $('statsCards').innerHTML = '<p class="admin-vacio">No se pudieron cargar las estadísticas.</p>';
        return;
    }

    const t = data.totales || {};
    const totalFotos = imagenesIniciales.length + (filas ? filas.length : 0);
    const tarjetas = [
        ['Visitas', t.visita || 0],
        ['Fotos vistas', t.vista || 0],
        ['Descargas', t.descarga || 0],
        ['Compartidas', t.compartir || 0],
        ['Favoritos', t.favorito || 0],
        ['Fotos en la galería', totalFotos]
    ];
    $('statsCards').innerHTML = tarjetas.map(([lbl, num]) =>
        `<div class="stat-card"><div class="num">${num}</div><div class="lbl">${lbl}</div></div>`).join('');

    // Visitas por día
    const porDia = {};
    (data.visitas_por_dia || []).forEach((d) => { porDia[d.dia] = d.n; });
    const dias = ultimosDias(14);
    const max = Math.max(1, ...dias.map((d) => porDia[d] || 0));
    $('statsDias').innerHTML = dias.map((d) => {
        const n = porDia[d] || 0;
        const alto = Math.round((n / max) * 100);
        return `<div class="dia-col"><span class="dia-n">${n}</span>
            <div class="dia-barra" style="height:${alto}%"></div>
            <span class="dia-fecha">${d.slice(8)}/${d.slice(5, 7)}</span></div>`;
    }).join('');

    // Rendimiento por foto
    const nombres = {};
    imagenesIniciales.forEach((f) => { nombres[String(f.id)] = f.titulo; });
    (filas || []).forEach((f) => { nombres[f.id] = f.titulo; });

    const porFoto = {};
    (data.por_foto || []).forEach((r) => {
        porFoto[r.foto_ref] = porFoto[r.foto_ref] || { vista: 0, descarga: 0, compartir: 0, favorito: 0 };
        if (r.tipo in porFoto[r.foto_ref]) porFoto[r.foto_ref][r.tipo] = r.n;
    });
    const lista = Object.entries(porFoto)
        .sort((a, b) => (b[1].descarga - a[1].descarga) || (b[1].vista - a[1].vista));

    $('statsFotos').innerHTML = lista.length === 0
        ? '<tr><td colspan="5">Aún no hay datos. Aparecerán cuando los visitantes usen la galería.</td></tr>'
        : lista.map(([ref, v]) => `<tr>
            <td>${esc(nombres[ref] || 'Foto eliminada')}</td>
            <td>${v.vista}</td><td>${v.descarga}</td><td>${v.compartir}</td><td>${v.favorito}</td></tr>`).join('');
}

$('btnActualizarStats').addEventListener('click', cargarEstadisticas);

iniciar();
