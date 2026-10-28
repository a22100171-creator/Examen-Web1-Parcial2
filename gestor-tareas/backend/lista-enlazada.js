// Cada nodo contiene una actividad y el enlace al siguiente nodo.
class Nodo {
  constructor(actividad) {
    this.actividad = actividad;
    this.siguiente = null;
  }
}
class ListaEnlazada {
  constructor() {
    this.cabeza = null;
    this.cola = null;
  }
  // Inserta al final para mantener el orden de registro.
  agregar(actividad) {
    const nodo = new Nodo(actividad);
    if (this.cabeza === null) this.cabeza = nodo;
    else this.cola.siguiente = nodo;
    this.cola = nodo;
  }
  // Recorre los enlaces para encontrar una actividad.
  buscar(id) {
    let actual = this.cabeza;
    while (actual !== null) {
      if (actual.actividad.id === id) return actual.actividad;
      actual = actual.siguiente;
    }
    return null;
  }
  actualizar(id, datos) {
    const actividad = this.buscar(id);
    if (actividad) Object.assign(actividad, datos);
    return actividad;
  }

  // El arreglo solo se utiliza para transportar y guardar la información.
  aArreglo() {
    const resultado = [];
    let actual = this.cabeza;
    while (actual !== null) {
      resultado.push(actual.actividad);
      actual = actual.siguiente;
    }
    return resultado;
  }
}
module.exports = ListaEnlazada;

