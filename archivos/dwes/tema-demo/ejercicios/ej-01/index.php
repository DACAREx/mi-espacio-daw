<?php
// Lee el parámetro n de la URL (?n=7). Si no llega, usa 5.
$n = isset($_GET['n']) ? (int) $_GET['n'] : 5;

if ($n < 1 || $n > 10) {
    $error = "El número debe estar entre 1 y 10.";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tabla del <?= $n ?></title>
</head>
<body>
  <h1>Tabla de multiplicar del <?= $n ?></h1>

  <?php if (isset($error)): ?>
    <p><?= $error ?></p>
  <?php else: ?>
    <ol>
      <?php for ($i = 1; $i <= 10; $i++): ?>
        <li><?= "$n x $i = " . ($n * $i) ?></li>
      <?php endfor; ?>
    </ol>
  <?php endif; ?>
</body>
</html>
