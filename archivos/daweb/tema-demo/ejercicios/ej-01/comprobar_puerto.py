import socket
import sys


def puerto_abierto(servidor, puerto, espera=3):
    """Intenta abrir una conexión TCP y devuelve True si responde."""
    try:
        with socket.create_connection((servidor, puerto), timeout=espera):
            return True
    except OSError:
        return False


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python comprobar_puerto.py servidor puerto")
        sys.exit(2)

    servidor = sys.argv[1]
    puerto = int(sys.argv[2])

    if puerto_abierto(servidor, puerto):
        print(f"{servidor}:{puerto} responde")
        sys.exit(0)

    print(f"{servidor}:{puerto} no responde")
    sys.exit(1)
