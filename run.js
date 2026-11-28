const assert = require('assert');
const { asistBuscarFotos } = require('../Mi_proyecto/asistente.js');
const { slugCategoria, validarDatosFoto, validarCategoria } = require('../Mi_proyecto/utilidades.js');

const casos = [];
const prueba = (id, nombre, fn) => casos.push({ id, nombre, fn });

const fotos = [
    { id: '1', titulo: 'Valle Entre Montañas', categoriaLabel: 'Montañas', ubicacion: 'Suiza', tags: ['montaña', 'valle'] },
    { id: '2', titulo: 'Atardecer Dorado en la Costa', categoriaLabel: 'Atardeceres', ubicacion: 'Italia', tags: ['atardecer', 'playa', 'mar'] },
    { id: '3', titulo: 'Aguas Cristalinas de Lago', categoriaLabel: 'Lagos y Playas', ubicacion: 'Canadá', tags: ['lago', 'agua'] }
];

prueba('T01', 'Busca por etiqueta', () => assert.strictEqual(asistBuscarFotos('montaña', fotos)[0].id, '1'));
prueba('T02', 'Ignora tildes y plurales (montañas = montaña)', () => assert.strictEqual(asistBuscarFotos('montañas', fotos)[0].id, '1'));
prueba('T03', 'Usa sinónimos (playa encuentra costa/atardecer)', () => assert.ok(asistBuscarFotos('quiero ver una playa', fotos).some(f => f.id === '2')));
prueba('T04', 'Consulta sin palabras útiles devuelve null', () => assert.strictEqual(asistBuscarFotos('hola quiero fotos', fotos), null));
prueba('T05', 'Máximo 4 resultados', () => assert.ok(asistBuscarFotos('lago', Array(10).fill(fotos[2])).length <= 4));
prueba('T06', 'Sin coincidencias devuelve lista vacía', () => assert.deepStrictEqual(asistBuscarFotos('volcán', fotos), []));

prueba('T07', 'slugCategoria quita tildes y espacios', () => assert.strictEqual(slugCategoria('Lagos y Playas'), 'lagos-y-playas'));
prueba('T08', 'slugCategoria con acentos', () => assert.strictEqual(slugCategoria('  Montañas '), 'montanas'));
prueba('T09', 'Categoría: nombre muy corto es inválido', () => assert.ok(validarCategoria('ab', [])));
prueba('T10', 'Categoría: duplicada es inválida (sin importar mayúsculas)', () => assert.ok(validarCategoria('BOSQUES', [{ clave: 'bosques', nombre: 'Bosques' }])));
prueba('T11', 'Categoría válida devuelve cadena vacía', () => assert.strictEqual(validarCategoria('Desiertos', [{ clave: 'bosques', nombre: 'Bosques' }]), ''));
prueba('T12', 'Categoría solo con símbolos es inválida', () => assert.ok(validarCategoria('***', [])));

const ok = { titulo: 'Amanecer en el valle', categoria: 'montanas', ubicacion: 'Suiza', tags: ['sol'] };
prueba('T13', 'Foto válida no genera errores', () => assert.deepStrictEqual(validarDatosFoto(ok), []));
prueba('T14', 'Título corto genera error', () => assert.ok(validarDatosFoto({ ...ok, titulo: 'ab' }).length));
prueba('T15', 'Título solo con espacios genera error', () => assert.ok(validarDatosFoto({ ...ok, titulo: '     ' }).length));
prueba('T16', 'Título muy largo genera error', () => assert.ok(validarDatosFoto({ ...ok, titulo: 'x'.repeat(81) }).length));
prueba('T17', 'Sin categoría genera error', () => assert.ok(validarDatosFoto({ ...ok, categoria: '' }).length));
prueba('T18', 'Más de 10 etiquetas genera error', () => assert.ok(validarDatosFoto({ ...ok, tags: Array(11).fill('a') }).length));
prueba('T19', 'Título repetido genera error', () => assert.ok(validarDatosFoto({ ...ok, tituloExistente: 'amanecer en el valle' }).length));

let fallos = 0;
casos.forEach(c => {
    try { c.fn(); console.log(`PASA   ${c.id}  ${c.nombre}`); }
    catch (e) { fallos++; console.log(`FALLA  ${c.id}  ${c.nombre}\n       ${e.message.split('\n')[0]}`); }
});
console.log(`\n${casos.length - fallos}/${casos.length} pruebas superadas`);
process.exit(fallos ? 1 : 0);
