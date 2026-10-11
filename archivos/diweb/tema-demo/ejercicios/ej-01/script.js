// Referencias a los elementos de la página
const valor = document.getElementById('valor');
const btnSumar = document.getElementById('sumar');
const btnRestar = document.getElementById('restar');
const btnReiniciar = document.getElementById('reiniciar');

let cuenta = 0;

// Actualiza el número que se ve en pantalla
function pintar() {
  valor.textContent = cuenta;
}

btnSumar.addEventListener('click', () => {
  cuenta++;
  pintar();
});

btnRestar.addEventListener('click', () => {
  cuenta--;
  pintar();
});

btnReiniciar.addEventListener('click', () => {
  cuenta = 0;
  pintar();
});
