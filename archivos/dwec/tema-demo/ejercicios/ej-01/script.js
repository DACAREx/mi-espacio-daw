const campo = document.getElementById('nombre');
const boton = document.getElementById('saludar');
const mensaje = document.getElementById('mensaje');

boton.addEventListener('click', () => {
  const nombre = campo.value.trim();

  if (nombre === '') {
    mensaje.textContent = 'Escribe tu nombre primero.';
  } else {
    mensaje.textContent = `Hola, ${nombre}`;
  }
});
