// ===================================================
// ASISTENTE DE IA (chat flotante)
// ===================================================
// 👇 CAMBIA ESTO por la URL de tu servicio en Render (termina en /api/asistente)
const ASISTENTE_API_URL = "https://TU-SERVICIO.onrender.com/api/asistente";

(function () {
    // --- Interfaz del chat ---
    const btn = document.createElement('button');
    btn.id = 'ia-btn';
    btn.textContent = '💬';
    btn.title = 'Asistente de la galería';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;border:0;background:#1da1f2;color:#fff;font-size:24px;cursor:pointer;z-index:999;box-shadow:0 4px 14px rgba(0,0,0,.4)';

    const panel = document.createElement('div');
    panel.id = 'ia-panel';
    panel.style.cssText = 'display:none;position:fixed;bottom:90px;right:20px;width:320px;max-width:90vw;height:420px;background:#14213d;color:#fff;border-radius:16px;z-index:999;flex-direction:column;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.5)';
    panel.innerHTML = `
        <div id="ia-msgs" style="flex:1;overflow-y:auto;padding:12px;font-size:14px">
            <div>👋 Hola, soy el asistente de la galería. Dime qué paisaje buscas, por ejemplo: <i>un atardecer en la playa</i>.</div>
        </div>
        <div style="display:flex;gap:6px;padding:8px">
            <input id="ia-input" placeholder="Escribe aquí..." style="flex:1;padding:8px;border-radius:8px;border:0">
            <button id="ia-send" style="padding:8px 12px;border:0;border-radius:8px;background:#1da1f2;color:#fff;cursor:pointer">Enviar</button>
        </div>`;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    const msgs = panel.querySelector('#ia-msgs');
    const input = panel.querySelector('#ia-input');

    btn.onclick = () => {
        panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    };

    // --- Conexión con tu galería ---
    function obtenerFotos() {
        return obtenerTodasLasImagenes().map((f) => ({
            titulo: f.titulo,
            categoria: f.categoriaLabel,
            ubicacion: f.ubicacion,
            palabras: f.tags,
        }));
    }

    function abrirFoto(titulo) {
        const t = titulo.trim().toLowerCase();
        const buscar = () => imagenesFiltradas.findIndex((f) => f.titulo.toLowerCase() === t);

        let i = buscar();
        if (i === -1) {
            // La foto está oculta por un filtro o búsqueda: los quitamos
            categoriaActual = 'todos';
            busquedaActual = '';
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            filterChips.forEach((c) =>
                c.classList.toggle('active', c.getAttribute('data-category') === 'todos')
            );
            renderizarGaleria();
            i = buscar();
        }
        if (i !== -1) abrirLightbox(i);
    }

    // --- Chat ---
    function agregar(html) {
        const d = document.createElement('div');
        d.style.margin = '8px 0';
        d.innerHTML = html;
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
        return d;
    }

    async function enviar() {
        const texto = input.value.trim();
        if (!texto) return;
        input.value = '';
        agregar('<b>Tú:</b> ' + texto.replace(/</g, '&lt;'));
        const espera = agregar('Pensando...');
        try {
            const r = await fetch(ASISTENTE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensaje: texto, fotos: obtenerFotos() }),
            });
            const data = await r.json();
            const limpio = (data.respuesta || data.error || 'Error').replace(/</g, '&lt;');
            espera.innerHTML = limpio.replace(/\[\[(.+?)\]\]/g,
                (_, t) => `<a href="#" data-foto="${t}" style="color:#7dd3fc;font-weight:bold">${t}</a>`);
            espera.querySelectorAll('a[data-foto]').forEach((a) => {
                a.onclick = (e) => {
                    e.preventDefault();
                    panel.style.display = 'none';
                    abrirFoto(a.dataset.foto);
                };
            });
        } catch (err) {
            espera.textContent = 'No pude conectarme. Intenta de nuevo en unos segundos.';
        }
    }

    panel.querySelector('#ia-send').onclick = enviar;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') enviar(); });
})();
