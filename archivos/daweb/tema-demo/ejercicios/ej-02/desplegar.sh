#!/bin/bash
# Despliega la carpeta web/ en el servidor (ejemplo de demostración)
set -e   # parar si algún comando falla

ORIGEN="web/"
DESTINO="/var/www/html/"

if [ ! -d "$ORIGEN" ]; then
    echo "No existe la carpeta $ORIGEN"
    exit 1
fi

echo "Copiando archivos..."
sudo rsync -a --delete "$ORIGEN" "$DESTINO"

echo "Recargando Apache..."
sudo systemctl reload apache2

echo "Despliegue terminado"
