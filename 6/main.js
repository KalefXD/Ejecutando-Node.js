/**
 * 6. Creando una API de notas
 *
 * En este script se construye una API REST de notas usando únicamente módulos nativos de Node.js.
 * Se parsea el cuerpo de las peticiones manualmente, se configuran cabeceras CORS y se enrutan
 * las peticiones según el método HTTP y los segmentos de la URL.
 * El lector verá cómo estructurar una API sin frameworks, separar la lógica en módulos
 * y gestionar el ciclo completo de una petición desde que llega hasta que se responde.
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { styleText as c } from 'node:util';
import {
	getNotes,
	addNote,
	getNote,
	updateNote,
	deleteNote
} from './notas.js';

/**
 * Apunte #1:
 * REST (Representational State Transfer) es un estilo arquitectónico que usa métodos HTTP estándar
 * para operaciones CRUD: Create (POST), Read (GET), Update (PUT/PATCH) y Delete (DELETE).
 * Implementarlo sin frameworks permite ver exactamente cómo funciona cada parte del protocolo.
 */

// Obteniendo nombre y directorio del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Apunte #2:
 * En ES modules, no tenemos acceso directo a `__filename` y `__dirname` como en CommonJS.
 * `import.meta.url` devuelve la URL del módulo actual (ej: file:///path/to/file.js).
 */

// Cargando variables de entorno desde un archivo .env
process.loadEnvFile(path.join(__dirname, '.env'));
const PORT = process.env.PORT ?? 3000;
const HOST = process.env.HOST ?? 'localhost';

// Función para parsear datos JSON de solicitudes HTTP entrantes
function parseJsonData(req) {
	return new Promise((resolve, reject) => {
		let body = '';

		// Limitando el cuerpo a 1MB para prevenir ataques DoS
		const maxSize = 1024 * 1024;

		// Verificando que el Content-Type sea application/json
		if (!req.headers['content-type']?.includes('application/json'))
			return reject(new Error('Content-Type debe ser application/json.'));

		// Manejando los fragmentos de datos cuando llegen
		req.on('data', chunk => {
			// Deteniendo la conexión si se excede el límite de tamaño
			if (body.length > maxSize) {
				req.socket.destroy();
				return reject(new Error('Tamaño máximo de datos excedido (1MB)'));
			}
			// Acumulando los fragmentos de datos
			body += chunk.toString('utf8');
		});

		// Manejando el final de la transmisión de datos
		req.on('end', () => {
			try {
				// Intentando parsear el JSON acumulado
				resolve(JSON.parse(body));
			} catch (err) {
				reject(new Error('JSON inválido: ' + err.message));
			}
		});

		// Manejando errores durante la transmisión
		req.on('error', reject);
	});
}

let requestCount = 0;

// Creando el servidor HTTP para la API de Notas
const server = http.createServer(async (req, res) => {
	const { method, url } = req;

	const requestId = ++requestCount;
	const requestTime = new Date();
	console.log(
		c('gray', requestTime.toLocaleTimeString()),
		c('green', `Petición #${requestId}:`),
		c('yellow', req.socket.remoteAddress),
		c('magenta', method),
		c('cyan', url)
	);

	// Configurando headers CORS para permitir peticiones desde el navegador
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	/**
	 * Apunte #3:
	 * CORS (Cross-Origin Resource Sharing) permite que aplicaciones web en un dominio accedan a recursos de otro dominio.
	 * Sin CORS, los navegadores bloquean peticiones entre diferentes orígenes por seguridad (Same-Origin Policy).
	 * Las peticiones OPTIONS son "preflight requests" que los navegadores envían automáticamente para verificar permisos.
	 * En producción, es recomendable especificar orígenes específicos en lugar de '*' para mayor seguridad.
	 */

	// Respondiendo rápidamente a las solicitudes OPTIONS (preflight requests)
	if (method === 'OPTIONS') {
		res.writeHead(204); // 204 No Content es el estatus correcto para preflight
		return res.end();
	}

	// Función auxiliar para enviar respuestas JSON de manera consistente
	const send = (status, data) => {
		res.writeHead(status, { 'Content-Type': 'application/json' });
		res.end(data !== null ? JSON.stringify(data) : '');
	};

	// Parseando la URL para extraer la ruta y parámetros
	const urlPath = decodeURIComponent(url.split('?')[0]);
	const parts = urlPath.split('/').filter(Boolean);
	const resource = parts[0];
	const id = parts[1];

	try {
		// Enrutando las peticiones según el recurso solicitado
		if (resource === 'notas') {
			// GET /notas - Obteniendo todas las notas 
			if (method === 'GET' && !id) {
				const notes = await getNotes();
				send(200, notes);
			}
			// GET /notas/:id - Obteniendo una nota por ID
			else if (method === 'GET' && id) {
				const note = await getNote(id);
				note ? send(200, note) : send(404, { error: 'Nota no encontrada' });
			}
			// POST /notas - Creando una nueva nota
			else if (method === 'POST' && !id) {
				const dataNote = await parseJsonData(req);
				const newNote = await addNote(dataNote);
				send(201, newNote); // 201 Created indica recurso creado exitosamente
			}
			// PUT /notas/:id - Reemplazando completamente una nota por ID
			// PATCH /notas/:id - Actualizando parcialmente una nota por ID
			else if ((method === 'PUT' || method === 'PATCH') && id) {
				const changes = await parseJsonData(req);
				const isReplacement = method === 'PUT';
				const updated = await updateNote(id, changes, isReplacement);
				updated ? send(200, updated) : send(404, { error: 'Nota no encontrada' });
			}
			// DELETE /notas/:id - Eliminando una nota por ID
			else if (method === 'DELETE' && id) {
				const success = await deleteNote(id);
				success ? send(204, null) : send(404, { error: 'Nota no encontrada' }); // 204 No Content para eliminación exitosa
			}
		}

		// Devolviendo 404 si no coincide con ninguna ruta
		send(404, { error: 'Ruta no encontrada' });
	} catch (err) {
		send(400, { error: 'Error procesando la solicitud', detalle: err.message }); // 400 Bad Request
	}

	const responseTime = Date.now() - requestTime.getTime();
	console.log(
		c('gray', responseTime + 'ms'),
		c('green', `Respuesta #${requestId}:`),
		c(res.statusCode < 400 ? 'magenta' : 'red', `[${res.statusCode}]`)
	);
});

server.listen(PORT, HOST, () => {
	const { port } = server.address();
	console.log(
		c('magenta', 'API de Notas iniciado en:'), c('yellow', `http://${HOST}:${port}/notas`),
		c('cyan', '\nPrueba la API usando el archivo "cliente.html" o curl, ejecutando: curl <url>'),
		'\nOpciones de curl con argumento para definir método, encabezados y datos: -X -H -d',
		c('gray', `\nDetén la API presionando Ctrl+C o ejecutando: kill ${process.pid}\n`)
	);
});

/**
 * Apunte #4:
 * [*Apunte sobre API*]
 */

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
	console.log('\nCerrando servidor...');
	server.close(() => {
		console.log(c('green', 'Servidor cerrado.'));
		process.exit(0);
	});
}));
