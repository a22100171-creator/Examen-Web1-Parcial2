// Usamos módulos incluidos en Node.js: no hay paquetes que instalar.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const ListaEnlazada = require('./lista-enlazada');
const archivo = process.env.ARCHIVO_TAREAS || path.join(__dirname, 'actividades.txt');
let lista = new ListaEnlazada();

function validar(datos) {
  if (!datos || typeof datos.nombre !== 'string' || !datos.nombre.trim() || datos.nombre.trim().length > 100)
    throw new Error('El nombre debe tener entre 1 y 100 caracteres.');
  if (typeof datos.descripcion !== 'string' || !datos.descripcion.trim() || datos.descripcion.trim().length > 1000)
    throw new Error('La descripción debe tener entre 1 y 1000 caracteres.');
  if (!['Pendiente', 'En proceso', 'Completada'].includes(datos.estado))
    throw new Error('Selecciona un estado válido.');
  return { nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(), estado: datos.estado };
}

// Al iniciar reconstruimos la lista enlazada con los datos del TXT.
if (!fs.existsSync(archivo)) fs.writeFileSync(archivo, '[]\n', 'utf8');
const registros = JSON.parse(fs.readFileSync(archivo, 'utf8'));
if (!Array.isArray(registros)) throw new Error('El TXT debe contener un arreglo JSON.');
const ids = new Set();
for (const actividad of registros) {
  validar(actividad);
  if (typeof actividad.id !== 'string' || !actividad.id || ids.has(actividad.id)) throw new Error('ID inválido o repetido en el TXT.');
  ids.add(actividad.id);
  lista.agregar(actividad);
}

function responder(res, codigo, datos) {
  res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(datos));
}
async function leerDatos(req) {
  const partes = [];
  let bytes = 0;
  for await (const parte of req) {
    bytes += parte.length;
    if (bytes > 16384) throw new Error('La solicitud es demasiado grande.');
    partes.push(parte);
  }
  return JSON.parse(Buffer.concat(partes).toString('utf8'));
}
const servidor = http.createServer(async (req, res) => {
  try {
    const ruta = new URL(req.url, 'http://localhost').pathname;
    const coincidencia = ruta.match(/^\/api\/actividades\/([a-zA-Z0-9-]+)$/);
    if (ruta === '/api/actividades' && req.method === 'GET') return responder(res, 200, lista.aArreglo());
    if (coincidencia && req.method === 'GET') {
      const actividad = lista.buscar(coincidencia[1]);
      return responder(res, actividad ? 200 : 404, actividad || { error: 'Actividad no encontrada.' });
    }
    if ((ruta === '/api/actividades' && req.method === 'POST') || (coincidencia && req.method === 'PUT')) {
      let datos;
      try { datos = validar(await leerDatos(req)); }
      catch (error) { return responder(res, 400, { error: error instanceof SyntaxError ? 'JSON inválido.' : error.message }); }

      // Confirmamos el cambio en memoria solo después de guardarlo en disco.
      const nuevaLista = new ListaEnlazada();
      for (const actividad of lista.aArreglo()) nuevaLista.agregar({ ...actividad });
      let actividad;
      if (req.method === 'POST') {
        actividad = { id: randomUUID(), ...datos };
        nuevaLista.agregar(actividad);
      } else {
        actividad = nuevaLista.actualizar(coincidencia[1], datos);
        if (!actividad) return responder(res, 404, { error: 'Actividad no encontrada.' });
      }
      // Guardamos el contenido completo en el TXT del servidor.
      fs.writeFileSync(archivo, JSON.stringify(nuevaLista.aArreglo(), null, 2) + '\n', 'utf8');

      lista = nuevaLista;
      return responder(res, req.method === 'POST' ? 201 : 200, actividad);
    }
    // El backend sirve los archivos de frontend. El TXT queda dentro del backend y no es público.
    const publicos = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/estilos.css': ['estilos.css', 'text/css'] };
    const recurso = Object.hasOwn(publicos, ruta) ? publicos[ruta] : null;
    if (recurso && req.method === 'GET') {
      const contenido = fs.readFileSync(path.join(__dirname, '..', 'frontend', recurso[0]));
      res.writeHead(200, { 'Content-Type': recurso[1] + '; charset=utf-8' });
      return res.end(contenido);
    }
    responder(res, 404, { error: 'Ruta no encontrada.' });
  } catch (error) {
    console.error(error);
    responder(res, 500, { error: 'No se pudo leer o guardar la información. Intenta de nuevo.' });
  }
});
servidor.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  console.log('Gestor de tareas: http://127.0.0.1:' + servidor.address().port);
});



