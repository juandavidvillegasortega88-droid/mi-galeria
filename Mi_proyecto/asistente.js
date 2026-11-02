

const ASIST_IGNORAR = new Set([
    'quiero', 'quisiera', 'una', 'un', 'unos', 'unas', 'el', 'la', 'los', 'las', 'de', 'del', 'en', 'con',
    'para', 'foto', 'fotos', 'imagen', 'imagenes', 'paisaje', 'paisajes', 'me', 'muestra', 'muestrame',
    'busca', 'buscame', 'dame', 'ver', 'algo', 'que', 'y', 'o', 'al', 'por', 'hay', 'tienes', 'tiene',
    'mas', 'bonito', 'bonita', 'bonitas', 'bonitos', 'hola', 'buenas', 'necesito', 'puedes', 'podrias',
    'mostrar', 'tengas', 'alguna', 'alguno', 'sobre', 'como', 'es', 'son', 'lo', 'le', 'se', 'si', 'mi'
]);


const ASIST_SINONIMOS = {
    playa: ['costa', 'mar', 'arena', 'turquesa'],
    mar: ['playa', 'costa', 'oceano'],
    costa: ['playa', 'mar'],
    atardecer: ['crepusculo', 'dorado', 'sol', 'ocaso'],
    ocaso: ['atardecer', 'crepusculo'],
    amanecer: ['sol', 'atardecer'],
    montana: ['cumbre', 'nieve', 'alpes', 'andes', 'valle', 'colina'],
    cerro: ['montana', 'cumbre'],
    nieve: ['frio', 'cumbre', 'nevado'],
    bosque: ['arbol', 'selva', 'niebla', 'naturaleza'],
    selva: ['bosque', 'arbol'],
    arbol: ['bosque'],
    lago: ['agua', 'reflejo', 'laguna'],
    laguna: ['lago', 'agua'],
    agua: ['lago', 'cascada', 'reflejo'],
    rio: ['cascada', 'agua'],
    cascada: ['agua', 'bosque'],
    desierto: ['duna', 'arena', 'sahara'],
    flor: ['campo', 'primavera', 'pradera', 'color'],
    campo: ['flor', 'pradera', 'hierba'],
    niebla: ['neblina', 'misterio'],
    neblina: ['niebla', 'misterio'],
    canon: ['roca', 'acantilado'],
    otono: ['bosque', 'sendero', 'camino']
};


function asistNormalizar(palabra) {
    let p = String(palabra).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
    if (p.length > 4 && p.endsWith('es')) p = p.slice(0, -2);
    else if (p.length > 3 && p.endsWith('s')) p = p.slice(0, -1);
    return p;
}

function asistPalabras(texto) {
    return String(texto || '')
        .split(/[\s,.;:()\-_/]+/)
        .map(asistNormalizar)
        .filter(Boolean);
}

function asistCoincide(palabraCampo, buscada) {
    if (palabraCampo === buscada) return true;
    if (buscada.length >= 4 && palabraCampo.length >= 4) {
        return palabraCampo.startsWith(buscada) || buscada.startsWith(palabraCampo);
    }
    return false;
}


function asistBuscarFotos(consulta, fotos) {
    const buscadas = asistPalabras(consulta).filter((p) => !ASIST_IGNORAR.has(p));
    if (buscadas.length === 0) return null; 

    const resultados = fotos.map((foto) => {
        const campos = [
            { pal: asistPalabras((foto.tags || []).join(' ')), peso: 3 },
            { pal: asistPalabras(foto.titulo), peso: 3 },
            { pal: asistPalabras(foto.ubicacion), peso: 2 },
            { pal: asistPalabras(foto.categoriaLabel), peso: 2 }
        ];
        let puntos = 0;
        for (const buscada of buscadas) {
            
            let mejor = 0;
            for (const c of campos) {
                if (c.pal.some((w) => asistCoincide(w, buscada))) mejor = Math.max(mejor, c.peso);
            }
            
            if (mejor === 0) {
                const sinonimos = ASIST_SINONIMOS[buscada] || [];
                for (const s of sinonimos) {
                    for (const c of campos) {
                        if (c.pal.some((w) => asistCoincide(w, s))) mejor = Math.max(mejor, 1);
                    }
                }
            }
            puntos += mejor;
        }
        return { foto, puntos };
    });

    const mejor = Math.max(0, ...resultados.map((r) => r.puntos));
    
    return resultados
        .filter((r) => r.puntos > 0 && r.puntos >= mejor / 2)
        .sort((a, b) => b.puntos - a.puntos)
        .slice(0, 4)
        .map((r) => r.foto);
}

if (typeof module !== 'undefined') module.exports = { asistBuscarFotos };


if (typeof document !== 'undefined') (function () {
    const btn = document.createElement('button');
    btn.textContent = '💬';
    btn.title = 'Asistente de la galería';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;border:0;background:#1da1f2;color:#fff;font-size:24px;cursor:pointer;z-index:999;box-shadow:0 4px 14px rgba(0,0,0,.4)';

    const panel = document.createElement('div');
    panel.style.cssText = 'display:none;position:fixed;bottom:90px;right:20px;width:320px;max-width:90vw;height:420px;background:#14213d;color:#fff;border-radius:16px;z-index:999;flex-direction:column;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.5);font-family:inherit';
    panel.innerHTML = `
        <div class="ia-msgs" style="flex:1;overflow-y:auto;padding:12px;font-size:14px"></div>
        <div style="display:flex;gap:6px;padding:8px">
            <input class="ia-input" placeholder="Ej: atardecer en la playa" style="flex:1;padding:8px;border-radius:8px;border:0">
            <button class="ia-send" style="padding:8px 12px;border:0;border-radius:8px;background:#1da1f2;color:#fff;cursor:pointer">Enviar</button>
        </div>`;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    const msgs = panel.querySelector('.ia-msgs');
    const input = panel.querySelector('.ia-input');

    function agregar(html) {
        const d = document.createElement('div');
        d.style.margin = '8px 0';
        d.innerHTML = html;
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
        return d;
    }

    function escapar(t) {
        return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    btn.onclick = () => {
        const abrir = panel.style.display !== 'flex';
        panel.style.display = abrir ? 'flex' : 'none';
        if (abrir && !msgs.children.length) {
            agregar('👋 Hola, soy el asistente de la galería. Dime qué paisaje buscas, por ejemplo: <i>atardecer en la playa</i>, <i>montañas con nieve</i> o <i>bosque</i>.');
        }
    };

    
    function abrirFoto(id) {
        let i = imagenesFiltradas.findIndex((f) => f.id === id);
        if (i === -1) {
            
            categoriaActual = 'todos';
            busquedaActual = '';
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            filterChips.forEach((c) =>
                c.classList.toggle('active', c.getAttribute('data-category') === 'todos')
            );
            renderizarGaleria();
            i = imagenesFiltradas.findIndex((f) => f.id === id);
        }
        if (i !== -1) abrirLightbox(i);
    }

    function enviar() {
        const texto = input.value.trim();
        if (!texto) return;
        input.value = '';
        agregar('<b>Tú:</b> ' + escapar(texto));

        const fotos = obtenerTodasLasImagenes();
        const encontradas = asistBuscarFotos(texto, fotos);

        if (encontradas === null) {
            agregar('Cuéntame qué buscas: un lugar, un color o un tipo de paisaje (montañas, bosques, lagos, atardeceres...).');
            return;
        }
        if (encontradas.length === 0) {
            agregar('No encontré fotos con eso 😕. Prueba con otras palabras, por ejemplo: <i>lago</i>, <i>nieve</i>, <i>desierto</i> o <i>flores</i>.');
            return;
        }

        const caja = agregar(
            encontradas.length === 1
                ? 'Encontré esta foto para ti:'
                : `Encontré ${encontradas.length} fotos que te pueden gustar:`
        );
        encontradas.forEach((f) => {
            const b = document.createElement('button');
            b.style.cssText = 'display:block;width:100%;text-align:left;margin-top:6px;padding:8px;border:0;border-radius:8px;background:#1e3a5f;color:#7dd3fc;cursor:pointer;font-size:13px';
            b.innerHTML = '<b>' + escapar(f.titulo) + '</b>' +
                (f.ubicacion ? '<br><span style="color:#cbd5e1;font-size:12px">' + escapar(f.ubicacion) + '</span>' : '');
            b.onclick = () => {
                panel.style.display = 'none';
                abrirFoto(f.id);
            };
            caja.appendChild(b);
        });
    }

    panel.querySelector('.ia-send').onclick = enviar;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') enviar(); });
})();
