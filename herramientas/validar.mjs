#!/usr/bin/env node
/* =========================================================
   Valida los JSON de data/ antes de subir cambios:
   - JSON bien formado y campos obligatorios
   - ids únicos
   - todos los archivos referenciados existen
   - avisa de archivos de archivos/ que no usa ningún JSON
   Uso (desde la raíz del proyecto):  node herramientas/validar.mjs
   ========================================================= */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const raiz = process.cwd();
const errores = [];
const avisos = [];
const usados = new Set();
const TIPOS = ['teoria', 'ejemplos', 'ejercicios'];

function leer(ruta) {
  try { return JSON.parse(readFileSync(join(raiz, ruta), 'utf8')); }
  catch (e) { errores.push(`${ruta}: ${e.message}`); return null; }
}
function existe(ruta, donde) {
  usados.add(ruta);
  if (!existsSync(join(raiz, ruta))) errores.push(`${donde}: no existe el archivo «${ruta}»`);
}
const ruta = (carpeta, f) => (/^https?:/.test(f) || !carpeta ? f : carpeta.replace(/\/?$/, '/') + f);

const site = leer('data/site.json');
if (site) {
  const idsAsig = new Set();
  for (const a of site.asignaturas || []) {
    const donde = `asignatura «${a.id}»`;
    for (const campo of ['id', 'siglas', 'nombre', 'descripcion', 'moodle', 'datos']) {
      if (!a[campo]) errores.push(`${donde}: falta el campo «${campo}»`);
    }
    if (idsAsig.has(a.id)) errores.push(`${donde}: id repetido`);
    idsAsig.add(a.id);
    if (!a.datos) continue;
    existe(a.datos, donde);
    const datos = leer(a.datos);
    if (!datos) continue;
    const idsTema = new Set();
    for (const t of datos.temas || []) {
      const dT = `${a.id}/${t.id}`;
      if (!t.id || !t.titulo) errores.push(`${a.id}: un tema no tiene «id» o «titulo»`);
      if (idsTema.has(t.id)) errores.push(`${dT}: id de tema repetido`);
      idsTema.add(t.id);
      for (const tipo of TIPOS) {
        const ids = new Set();
        for (const it of t[tipo] || []) {
          const dI = `${dT}/${tipo}/${it.id}`;
          if (!it.id || !it.titulo) errores.push(`${dT}/${tipo}: un elemento no tiene «id» o «titulo»`);
          if (ids.has(it.id)) errores.push(`${dI}: id repetido`);
          ids.add(it.id);
          if (it.carpeta && !existsSync(join(raiz, it.carpeta))) errores.push(`${dI}: no existe la carpeta «${it.carpeta}»`);
          for (const f of it.archivos || []) {
            const r = typeof f === 'string' ? f : f.ruta;
            if (!r) { errores.push(`${dI}: un archivo no tiene «ruta»`); continue; }
            if (!/^https?:/.test(r)) existe(ruta(it.carpeta, r), dI);
          }
          for (const campo of ['enunciado', 'contenido', 'notas', 'solucion']) {
            const v = it[campo];
            if (v && typeof v === 'object' && !Array.isArray(v)) {
              if (!v.archivo) errores.push(`${dI}: «${campo}» debe ser texto, lista o { "archivo": "..." }`);
              else existe(ruta(it.carpeta, v.archivo), dI);
            }
          }
          if (it.demo && !(it.archivos || []).some((f) => /\.html?$/i.test(typeof f === 'string' ? f : f.ruta))) {
            avisos.push(`${dI}: tiene «demo» pero no incluye ningún archivo .html`);
          }
        }
      }
    }
  }
}

// Archivos sin referenciar (solo aviso)
function recorrer(dir) {
  if (!existsSync(join(raiz, dir))) return;
  for (const nombre of readdirSync(join(raiz, dir))) {
    const rel = join(dir, nombre);
    if (statSync(join(raiz, rel)).isDirectory()) recorrer(rel);
    else if (!usados.has(rel.split(sep).join('/'))) avisos.push(`archivo sin usar en ningún JSON: ${rel.split(sep).join('/')}`);
  }
}
recorrer('archivos');

avisos.forEach((m) => console.log('AVISO  ' + m));
errores.forEach((m) => console.log('ERROR  ' + m));
if (errores.length) {
  console.log(`\n${errores.length} error(es). Corrígelos antes de subir los cambios.`);
  process.exit(1);
}
console.log('Todo correcto: los JSON son válidos y todos los archivos existen.');
