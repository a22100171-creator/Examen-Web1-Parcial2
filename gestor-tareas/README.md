# Examen · Gestor de actividades

Aplicación sencilla y comentada: frontend con HTML, CSS y JavaScript; backend con Node.js, lista enlazada y persistencia en TXT.

## Estructura

```text
gestor-tareas/
├── frontend/
│   ├── index.html          # Estructura y formulario
│   ├── estilos.css         # Diseño adaptable
│   └── app.js              # Interacciones y solicitudes a la API
├── backend/
│   ├── servidor.js         # API, validación y lectura/escritura del TXT
│   ├── lista-enlazada.js   # Nodos y operaciones de la lista
│   ├── actividades.txt     # Datos persistentes
│   └── pruebas.test.js     # Pruebas funcionales
├── package.json           # Comandos de inicio y pruebas
└── README.md
```

## Cómo ejecutarla

1. Necesitas Node.js instalado.
2. Abre una terminal dentro de la carpeta principal `gestor-tareas`.
3. Ejecuta `npm start` o `node backend/servidor.js`. No necesitas instalar paquetes.
4. Abre http://127.0.0.1:3000 en tu navegador.
5. Mantén la terminal abierta mientras utilizas la página. Para detenerla, presiona Ctrl+C.


No abras index.html directamente: entra mediante la dirección del servidor.

## Frontend y backend

El **frontend** es lo que ve y utiliza el usuario: formulario, lista, búsqueda y filtro de estado. El archivo `frontend/app.js` envía solicitudes con fetch a `/api/actividades`.

El **backend** recibe esas solicitudes, valida los campos, gestiona la lista enlazada y guarda los cambios en `backend/actividades.txt`. También entrega los archivos de la carpeta frontend al navegador.

Las dos partes están separadas en carpetas y funcionan con un solo servidor y un solo comando, para mantener el proyecto sencillo.

Flujo: navegador (frontend) → API (backend) → lista enlazada → archivo TXT.

## Qué puedes hacer

- Registrar una actividad con nombre, descripción y estado.
- Consultar todas las actividades.
- Buscar por nombre o descripción y filtrar por estado.
- Seleccionar Editar para consultar y actualizar los campos.
- Usar un formulario visible para registrar y editar, con una lista sencilla debajo.

## Cómo funciona la lista enlazada

`backend/lista-enlazada.js` define las clases Nodo y ListaEnlazada. Cada nodo guarda una actividad y una referencia al siguiente:

cabeza → actividad 1 → actividad 2 → actividad 3 → null

El método agregar coloca un nodo al final; buscar recorre los enlaces hasta encontrar el ID; actualizar modifica la actividad encontrada.

Al iniciar, el servidor lee `backend/actividades.txt` y reconstruye la lista enlazada. Al registrar o actualizar, guarda la información de nuevo en ese archivo. El TXT utiliza formato JSON legible, aunque su extensión es .txt. El arreglo solo se usa para transportar y guardar los datos: la estructura de gestión del servidor es la lista enlazada.

Los datos permanecen después de cerrar y volver a iniciar el servidor. No se utiliza localStorage del navegador.

## API

- GET /api/actividades: consultar todas.
- GET /api/actividades/:id: consultar una.
- POST /api/actividades: registrar.
- PUT /api/actividades/:id: actualizar.

POST y PUT reciben JSON con nombre, descripcion y estado. Los estados permitidos son Pendiente, En proceso y Completada. Los ID se generan automáticamente.

## Pruebas

Desde la carpeta principal, ejecuta `npm test`. Se comprueban los archivos del frontend, registro, consulta, edición, validación y recuperación de datos después de reiniciar. Las pruebas usan un TXT temporal independiente.

## Alcance

Proyecto educativo para ejecución local, sin cuentas de usuario. El servidor escucha únicamente en tu computadora. No edites el TXT mientras esté en funcionamiento. Si el archivo contiene datos inválidos, el servidor se detiene al iniciar para evitar sobrescribirlos. Conserva una copia del TXT si necesitas un respaldo.


