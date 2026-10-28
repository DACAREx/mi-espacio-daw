#!/usr/bin/env node
/* =========================================================
   Crea una actividad de DWES con el nombre correcto.
   Uso:  node herramientas/nueva-actividad-dwes.mjs <tema> <actividad> ["descripción"]
   Ej.:  node herramientas/nueva-actividad-dwes.mjs 3 1 "Formularios"
         -> actividad31_7  (tema 3, actividad 1, clase 7)
   Hace: crea la carpeta, copia la plantilla layout.php con tu nombre
         y añade la actividad a data/dwes.json.
   ========================================================= */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CLASE = 7;
const [tema, act, ...resto] = process.argv.slice(2);
if (!/^\d+$/.test(tema || '') || !/^\d+$/.test(act || '')) {
  console.log('Uso: node herramientas/nueva-actividad-dwes.mjs <tema> <actividad> ["descripción"]');
  process.exit(1);
}
const raiz = process.cwd();
const rutaJson = join(raiz, 'data/dwes.json');
const datos = JSON.parse(readFileSync(rutaJson, 'utf8'));
const t = datos.temas.find((x) => String(x.numero) === tema);
if (!t) {
  console.log(`No existe el tema ${tema} en data/dwes.json. Añádelo primero con "numero": ${tema}.`);
  process.exit(1);
}
const id = `actividad${tema}${act}_${CLASE}`;
t.ejercicios = t.ejercicios || [];
if (t.ejercicios.some((e) => e.id === id)) {
  console.log(`Ya existe ${id}.`);
  process.exit(1);
}
const carpeta = `archivos/dwes/${t.id}/ejercicios/${id}/`;
mkdirSync(join(raiz, carpeta), { recursive: true });
const destino = join(raiz, carpeta, `${id}.php`);
if (!existsSync(destino)) copyFileSync(join(raiz, 'herramientas/plantillas/dwes-layout.php'), destino);
t.ejercicios.push({
  id,
  titulo: id,
  descripcion: resto.join(' ') || '',
  etiquetas: ['php'],
  carpeta,
  archivos: [`${id}.php`]
});
writeFileSync(rutaJson, JSON.stringify(datos, null, 2) + '\n');
console.log(`Creada ${id}\n  carpeta: ${carpeta}\n  archivo: ${carpeta}${id}.php (con el layout)\n  JSON:    data/dwes.json actualizado`);
