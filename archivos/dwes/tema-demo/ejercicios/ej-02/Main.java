public class Main {
    public static void main(String[] args) {
        Persona ana = new Persona("Ana", 22);
        Persona leo = new Persona("Leo", 15);

        mostrar(ana);
        mostrar(leo);
    }

    private static void mostrar(Persona p) {
        String estado = p.esMayorDeEdad() ? "es mayor de edad" : "es menor de edad";
        System.out.println(p.getNombre() + " " + estado);
    }
}
