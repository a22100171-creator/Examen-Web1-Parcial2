// El frontend consulta la API. El backend administra la lista y el archivo TXT.
const $ = (id) => document.getElementById(id);
let actividades = [];
let idEdicion = null;
let enviando = false;

async function solicitar(url, opciones) {
  const respuesta = await fetch(url, opciones);
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || 'No se pudo completar la operación.');
  return datos;
}

function mensaje(texto, error = false) {
  $('mensaje').textContent = texto;
  $('mensaje').classList.toggle('error', error);
}

// Filtra los resultados y muestra los textos sin interpretarlos como HTML.
function dibujar() {
  const busqueda = $('buscar').value.trim().toLocaleLowerCase('es');
  const filtro = $('filtro').value;
  const visibles = actividades.filter((a) =>
    (!filtro || a.estado === filtro) &&
    (a.nombre + ' ' + a.descripcion).toLocaleLowerCase('es').includes(busqueda)
  );
  $('actividades').replaceChildren();
  for (const actividad of visibles) {
    const fila = document.createElement('tr');
    //Los datos del usuario se asignan con textContent.
    fila.innerHTML = '<td><span class="task-title"></span><div class="task-description"></div></td><td><span class="badge"></span></td><td><button class="secondary edit" type="button">Editar</button></td>';
    fila.querySelector('.task-title').textContent = actividad.nombre;
    fila.querySelector('.task-description').textContent = actividad.descripcion;
    const badge = fila.querySelector('.badge');
    badge.textContent = actividad.estado;
    badge.classList.add({ Pendiente: 'pending', 'En proceso': 'progress', Completada: 'done' }[actividad.estado]);
    const boton = fila.querySelector('button');
    boton.setAttribute('aria-label', 'Editar ' + actividad.nombre);
    boton.disabled = enviando;
    boton.addEventListener('click', () => editar(actividad));
    $('actividades').append(fila);
  }
  $('tabla').hidden = visibles.length === 0;
  $('vacio').hidden = visibles.length > 0;
  $('texto-vacio').textContent = actividades.length ? 'No se encontraron actividades.' : 'Todavía no hay actividades.';
  $('vacio').querySelector('small').textContent = actividades.length ? 'Prueba otra búsqueda o cambia el estado.' : 'Usa el formulario para registrar la primera.';
  $('resultado').textContent = 'Mostrando ' + visibles.length + ' de ' + actividades.length + ' actividades';
}

// La edición utiliza el mismo formulario, con los campos de la actividad elegida.
function editar(actividad) {
  if (enviando) return;
  idEdicion = actividad.id;
  $('nombre').value = actividad.nombre;
  $('descripcion').value = actividad.descripcion;
  $('estado').value = actividad.estado;
  $('titulo-formulario').textContent = 'Editar actividad';
  $('guardar').textContent = 'Guardar cambios';
  $('cancelar').hidden = false;
  $('error-formulario').textContent = '';
  mensaje('');
  $('nombre').focus();
}

function limpiar() {
  idEdicion = null;
  $('formulario').reset();
  $('titulo-formulario').textContent = 'Nueva actividad';
  $('guardar').textContent = 'Guardar actividad';
  $('cancelar').hidden = true;
  $('error-formulario').textContent = '';
}

$('cancelar').addEventListener('click', () => { if (!enviando) limpiar(); });
$('buscar').addEventListener('input', dibujar);
$('filtro').addEventListener('change', dibujar);

// POST registra una actividad y PUT actualiza la que esta editando.
$('formulario').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (enviando) return;
  const editando = Boolean(idEdicion);
  const datos = {
    nombre: $('nombre').value.trim(),
    descripcion: $('descripcion').value.trim(),
    estado: $('estado').value
  };
  enviando = true;
  $('guardar').disabled = true;
  $('cancelar').disabled = true;
  $('guardar').textContent = 'Guardando…';
  $('error-formulario').textContent = '';
  mensaje('');
  dibujar();
  try {
    const guardada = await solicitar('/api/actividades' + (editando ? '/' + idEdicion : ''), {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (editando) actividades = actividades.map((a) => a.id === guardada.id ? guardada : a);
    else actividades.push(guardada);
    limpiar();
    mensaje(editando ? 'Actividad actualizada.' : 'Actividad registrada.');
  } catch (error) {
    $('error-formulario').textContent = error.message;
  } finally {
    enviando = false;
    $('guardar').disabled = false;
    $('cancelar').disabled = false;
    $('guardar').textContent = idEdicion ? 'Guardar cambios' : 'Guardar actividad';
    dibujar();
  }
});

async function iniciar() {
  try {
    actividades = await solicitar('/api/actividades');
    dibujar();
  } catch (error) {
    mensaje('No se pudieron cargar las actividades. Recarga la página para reintentar.', true);
    $('resultado').textContent = 'Sin conexión con el servidor';
  }
}
iniciar();

