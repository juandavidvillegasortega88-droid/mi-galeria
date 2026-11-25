// ===================================================
// UTILIDADES PURAS (sin DOM ni Supabase) -> fáciles de probar
// Reglas de negocio de validación de la galería.
// ===================================================
const LIMITES_FOTO = { tituloMin: 3, tituloMax: 80, ubicacionMax: 100, etiquetasMax: 10, etiquetaMax: 30 };
const LIMITE_NOMBRE_CATEGORIA = { min: 3, max: 30 };

// "Lagos y Playas" -> "lagos-y-playas"  (clave estable de una categoría)
function slugCategoria(nombre) {
    return String(nombre || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

// Devuelve la lista de errores (vacía = datos válidos)
function validarDatosFoto(d) {
    const errores = [];
    const titulo = String(d.titulo || '').trim();
    if (titulo.length < LIMITES_FOTO.tituloMin) errores.push(`El título debe tener al menos ${LIMITES_FOTO.tituloMin} caracteres.`);
    if (titulo.length > LIMITES_FOTO.tituloMax) errores.push(`El título no puede superar ${LIMITES_FOTO.tituloMax} caracteres.`);
    if (!d.categoria) errores.push('Debes elegir una categoría.');
    if (String(d.ubicacion || '').trim().length > LIMITES_FOTO.ubicacionMax) errores.push(`La ubicación no puede superar ${LIMITES_FOTO.ubicacionMax} caracteres.`);
    const tags = d.tags || [];
    if (tags.length > LIMITES_FOTO.etiquetasMax) errores.push(`Máximo ${LIMITES_FOTO.etiquetasMax} etiquetas.`);
    if (tags.some(t => t.length > LIMITES_FOTO.etiquetaMax)) errores.push(`Cada etiqueta puede tener máximo ${LIMITES_FOTO.etiquetaMax} caracteres.`);
    if (d.tituloExistente && String(d.tituloExistente).toLowerCase() === titulo.toLowerCase()) errores.push('Ya existe una foto con ese título.');
    return errores;
}

// existentes: [{clave, nombre}]
function validarCategoria(nombre, existentes) {
    const n = String(nombre || '').trim();
    if (n.length < LIMITE_NOMBRE_CATEGORIA.min || n.length > LIMITE_NOMBRE_CATEGORIA.max)
        return `El nombre debe tener entre ${LIMITE_NOMBRE_CATEGORIA.min} y ${LIMITE_NOMBRE_CATEGORIA.max} caracteres.`;
    if (!slugCategoria(n)) return 'El nombre debe contener letras o números.';
    if ((existentes || []).some(c => c.clave === slugCategoria(n) || c.nombre.toLowerCase() === n.toLowerCase()))
        return 'Ya existe una categoría con ese nombre.';
    return '';
}

if (typeof module !== 'undefined') module.exports = { slugCategoria, validarDatosFoto, validarCategoria, LIMITES_FOTO };
