<?php
// Variables y salida por pantalla
$nombre = "Mundo";
$edad = 20;
$notas = [7.5, 8, 6.25];

echo "Hola, $nombre\n";
echo "Tienes " . $edad . " años\n";

// Media de un array
$media = array_sum($notas) / count($notas);
printf("Nota media: %.2f\n", $media);

if ($media >= 5) {
    echo "Aprobado\n";
} else {
    echo "Suspenso\n";
}
