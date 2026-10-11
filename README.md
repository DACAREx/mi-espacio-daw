# Mi espacio DAW

Web personal para organizar los apuntes, ejemplos y ejercicios de 2.º de Desarrollo de Aplicaciones Web (DAW).
Es una web **estática** (HTML, CSS y JavaScript, sin frameworks ni servidor), pensada para publicarse gratis con GitHub Pages.

- Autor: David Carrero Real
- Centro: IES Nuestra Señora de los Remedios, Ubrique
- Curso: 2026/2027
- Asignaturas: DIWEB, DWES y DAWEB

## Publicarla en GitHub Pages

1. Crea en GitHub un repositorio **público** llamado `mi-espacio-daw` (sin README ni `.gitignore`, ya vienen incluidos aquí).
2. Desde la carpeta del proyecto:

   ```bash
   git init
   git add .
   git commit -m "Primera versión"
   git branch -M main
   git remote add origin https://github.com/DACAREx/mi-espacio-daw.git
   git push -u origin main
   ```

3. En GitHub: **Settings → Pages → Build and deployment**. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` y pulsa *Save*.
4. En uno o dos minutos la web estará en `https://dacarex.github.io/mi-espacio-daw/`.

Si el repositorio tiene otro nombre, cambia la clave `repositorio` en `data/site.json`. El resto de rutas son relativas y funcionan igual.

## Verla en tu ordenador

Los navegadores no dejan leer los JSON si abres `index.html` con doble clic, así que necesitas un servidor local:

- **VS Code:** instala la extensión *Live Server* y pulsa «Go Live».
- **Terminal:** `python -m http.server 8000` y abre <http://localhost:8000>.

## Cómo está organizado

```text
mi-espacio-daw/
├── index.html              Única página real; el contenido se pinta con JavaScript
├── 404.html                Página de error personalizada (GitHub Pages la usa sola)
├── .nojekyll               Evita que Pages procese la web con Jekyll
├── assets/
│   ├── css/style.css       Estilos (tema claro y oscuro)
│   ├── js/app.js           Navegación, páginas, visor, demos, búsqueda y progreso
│   ├── js/highlight.js     Resaltado de sintaxis propio, sin librerías externas
│   └── img/favicon.svg
├── data/                   AQUÍ SE DEFINE EL CONTENIDO
│   ├── site.json           Tus datos y la lista de asignaturas
│   ├── diweb.json          Temas y ejercicios de DIWEB
│   ├── dwes.json           Temas y ejercicios de DWES
│   └── daweb.json          Temas y ejercicios de DAWEB
├── archivos/               AQUÍ SE GUARDAN LOS ARCHIVOS REALES
│   └── <asignatura>/<tema>/<teoria|ejemplos|ejercicios>/<elemento>/…
└── herramientas/validar.mjs   Comprueba que no hay enlaces rotos
```

La navegación usa direcciones con `#`, por ejemplo `#/dwes/tema-01/ejercicios/ej-02`. Así no hay que crear una página HTML por cada ejercicio y nunca se rompen las rutas en GitHub Pages.

Cada asignatura en `site.json` apunta a su JSON con la clave `datos`. Los JSON describen los temas y **apuntan** a los archivos de `archivos/` mediante rutas. La web une ambas cosas al cargarse.

## Añadir contenido

### Añadir un tema

En `data/dwes.json` (o el JSON de la asignatura), añade un objeto a la lista `temas`:

```json
{
  "id": "tema-01",
  "numero": 1,
  "titulo": "Título real del tema",
  "descripcion": "Opcional.",
  "etiquetas": ["php"],
  "teoria": [],
  "ejemplos": [],
  "ejercicios": []
}
```

- `id`: sin espacios ni tildes; forma parte de la URL y no debe cambiar después.
- `numero`: opcional. Si no lo pones, el tema se muestra solo con su título.

### Añadir un ejercicio

1. Crea la carpeta y copia dentro tus archivos:
   `archivos/dwes/tema-01/ejercicios/ej-01/` → `index.php`, `datos.txt`…
2. Añade el ejercicio a la lista `ejercicios` del tema:

```json
{
  "id": "ej-01",
  "titulo": "Título del ejercicio",
  "descripcion": "Resumen corto (opcional).",
  "etiquetas": ["php", "formularios"],
  "carpeta": "archivos/dwes/tema-01/ejercicios/ej-01/",
  "enunciado": ["Primera línea.", "", "- Un punto de la lista.", "- Otro punto."],
  "notas": "Opcional.",
  "solucion": "Opcional. Aparece plegada.",
  "archivos": ["index.php", "datos.txt"],
  "demo": false
}
```

3. Ejecuta `node herramientas/validar.mjs` y, si todo está bien, sube los cambios con `git add .`, `git commit` y `git push`.

`teoria` y `ejemplos` funcionan igual. No hay límite de temas, ejercicios ni archivos.

### Campos de cada elemento

| Campo | Obligatorio | Qué hace |
| --- | --- | --- |
| `id` | Sí | Identificador único dentro de su lista. No lo cambies una vez publicado: lo usan la URL y el progreso guardado. |
| `titulo` | Sí | Título que se muestra. |
| `descripcion` | No | Resumen en una línea. |
| `etiquetas` | No | Lista de etiquetas; se pueden buscar y filtrar. |
| `carpeta` | No | Carpeta común para los `archivos`. Si no la pones, usa rutas completas en cada archivo. |
| `archivos` | No | Lista de archivos. Cada uno es un texto (`"index.php"`) o un objeto `{ "ruta": "…", "etiqueta": "…", "lenguaje": "php" }`. |
| `enunciado` / `contenido` | No | Texto principal (ejercicios usan `enunciado`; teoría y ejemplos, `contenido`). |
| `notas`, `solucion` | No | Texto adicional. La solución aparece plegada. |
| `demo` | No | `true` para mostrar el botón «Ejecutar demostración». |

Los campos de texto aceptan una cadena, una **lista de líneas** (más cómoda en JSON) o un archivo: `{ "archivo": "enunciado.md" }`, relativo a `carpeta`.

### Formato del texto

Párrafos, `## Títulos`, listas con `-` o `1.`, `` `código` ``, `**negrita**`, `[enlaces](https://…)` y bloques de código con tres comillas invertidas y el lenguaje (```` ```php ````).

### Tipos de archivo

El lenguaje se detecta por la extensión: `html`, `css`, `js`, `ts`, `json`, `php`, `java`, `py`, `xml`, `sh`, `sql`, `yml`, `conf`, `ini`, `md` y `txt`.

- **Extensión no reconocida:** añade `"lenguaje": "texto"` (o el que corresponda) y se mostrará como texto.
- **PDF:** se muestra incrustado, con botón de descarga y enlace para abrirlo en otra pestaña.
- **Imágenes** (`png`, `jpg`, `gif`, `webp`): se muestran en la página.
- **Otros archivos** (`zip`, `docx`…): no se pueden previsualizar, solo descargar.

Los archivos PHP, Java o Python **se muestran pero no se ejecutan**: GitHub Pages solo sirve archivos estáticos.

### Demostraciones

Con `"demo": true` y al menos un archivo `.html` en `archivos`, aparece un botón «Ejecutar demostración». La web une el HTML con los `.css` y `.js` del mismo ejercicio (enlazados por nombre, por ejemplo `<link href="style.css">`) y los ejecuta en un `iframe` con `sandbox="allow-scripts allow-forms allow-modals"`:

- No se ejecuta nada hasta que pulsas el botón.
- Sin `allow-same-origin`, el código del ejercicio no puede leer ni modificar la web principal.
- Las imágenes locales del ejercicio no se resuelven en la demo (usa imágenes por URL completa o `data:`).

## Funciones incluidas

- Portada con una tarjeta por asignatura y acceso al material original del centro.
- Navegación Inicio › Asignatura › Tema › Teoría / Ejemplos / Ejercicios, con migas de pan y botones de volver.
- Visor de código con pestañas por archivo, resaltado, «Copiar código» y «Descargar código».
- Buscador con filtros por asignatura, tipo y etiqueta (atajo: tecla `/`).
- Modo claro y oscuro, que recuerda tu elección.
- Progreso real: botón «Marcar como completado». Se calcula con elementos marcados sobre elementos existentes, sin porcentajes inventados.

**Limitación del progreso:** se guarda en `localStorage`, es decir, solo en ese navegador y dispositivo. No se sincroniza y se pierde si borras los datos del sitio. Los temas marcados como demostración no cuentan en el progreso de la asignatura.

## Borrar los temas de demostración

1. En cada JSON de `data/`, borra el tema con `"ejemplo": true`.
2. Borra las carpetas `archivos/*/tema-demo/`.
3. Ejecuta `node herramientas/validar.mjs` para comprobarlo.

## Si algo falla

| Síntoma | Causa probable |
| --- | --- |
| «No se pudieron cargar los datos» | Abres `index.html` con doble clic, o hay una coma de más en un JSON. Usa un servidor local y valida los JSON. |
| Un archivo dice «No se pudo cargar» | La ruta del JSON no coincide con el nombre real. Cuidado con mayúsculas y minúsculas: GitHub Pages las distingue. |
| Los cambios no se ven tras subirlos | Espera uno o dos minutos y recarga con `Ctrl + F5`. |
| Un ejercicio no aparece | Falta `id` o `titulo`, o el `id` está repetido. `validar.mjs` te lo dirá. |
