public class Persona {
    private String nombre;
    private int edad;

    public Persona(String nombre, int edad) {
        this.nombre = nombre;
        this.edad = edad;
    }

    public String getNombre() {
        return nombre;
    }

    public int getEdad() {
        return edad;
    }

    /** Devuelve true si la persona tiene 18 años o más. */
    public boolean esMayorDeEdad() {
        return edad >= 18;
    }
}
