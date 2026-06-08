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
import { json } from 'node:stream/consumers';
import path from 'node:path';
import { styleText as c } from 'node:util';
import {
	getListNotes,
	getNote,
	addNote,
	replaceNote,
	updateNote,
	deleteNote
} from './notas.js';

/**
 * Apunte #1:
 * [*Apunte sobre los módulos url y stream/consumers*]
 * 
 * REST (Representational State Transfer) es un estilo arquitectónico que usa métodos HTTP estándar
 * para operaciones CRUD: Create (POST), Read (GET), Update (PUT/PATCH) y Delete (DELETE).
 * Implementarlo sin frameworks permite ver exactamente cómo funciona cada parte del protocolo.
 */

// Cargando variables de entorno desde un archivo .env
process.loadEnvFile(path.join(import.meta.dirname, '.env'));
const PORT = process.env.PORT ?? 3000;
const HOST = process.env.HOST ?? 'localhost';

/**
 * Apunte #2:
 * [*Apunte sobre el archivo .env*]
 */

// Limitando el cuerpo a 1MB para prevenir ataques
const maxSize = 1024 * 1024;

// Funciones Helpers de respuesta:
const sendJSON = (res, status, data) => {
	const body = JSON.stringify(data);
	res.writeHead(status, {
		'Content-Type': 'application/json',
		'Content-Length': Buffer.byteLength(body),
	});
	res.end(body);
};
 
const sendError = (res, status, message) =>
	sendJSON(res, status, { error: message });
 
// Lee y valida el body JSON (respeta el límite de tamaño)
const readBody = async (req) => {
	const contentLength = Number(req.headers['content-length'] ?? 0);
	if (contentLength > maxSize) throw new Error('Payload demasiado grande (1MB)');
	return json(req);
};

/**
 * Apunte #3:
 * [*Apunte sobre manejo de cuerpo de peticiones*]
 */

let requestCount = 0;

// Creando el servidor HTTP para la API de Notas
const server = http.createServer(async (req, res) => {
	const { method } = req;
    const url = new URL('http://' + req.headers.host + req.url);

	const requestTime = new Date();
	const requestId = ++requestCount;
	console.log(
		c('gray', requestTime.toLocaleTimeString()),
		c('green', `Petición #${requestId}:`),
		c('yellow', req.socket.remoteAddress),
		c('magenta', method),
		c('cyan', req.url)
	);

	// Permitiendo peticiones desde navegadores con un header CORS
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Respondiendo rápidamente headers CORS a las solicitudes OPTIONS (preflight requests) sin contenido (204 No Content)
	if (method === 'OPTIONS') {
		res.writeHead(204, {
			"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		});
		res.end();
	}

	/**
	 * Apunte #4:
	 * CORS (Cross-Origin Resource Sharing) permite que aplicaciones web en un dominio accedan a recursos de otro dominio.
	 * Sin CORS, los navegadores bloquean peticiones entre diferentes orígenes por seguridad (Same-Origin Policy).
	 * Las peticiones OPTIONS son "preflight requests" que los navegadores envían automáticamente para verificar permisos.
	 * En producción, es recomendable especificar orígenes específicos en lugar de '*' para mayor seguridad.
	 */

	else {
		const parts = url.pathname.replace(/\/$/, '').split('/').filter(Boolean);
		const [resource, id] = parts;
 
		if (resource !== 'notas') {
			sendError(res, 404, 'Ruta no encontrada');
		}
 
		// GET /notas - lista todas
		else if (method === 'GET' && !id) {
			const notes = await getListNotes();
			sendJSON(res, 200, notes);
		}
 
		// GET /notas/:id - una nota
		else if (method === 'GET' && id) {
			const note = await getNote(id);
			note ? sendJSON(res, 200, note) : sendError(res, 404, 'Nota no encontrada');
		}
 
		// POST /notas - crea nota
		else if (method === 'POST' && !id) {
			try {
				const data = await readBody(req);
				if (!data?.title) return sendError(res, 400, 'El campo "title" es obligatorio');
				const note = await addNote(data);
				// Respondiendo con un código 201 (Created) si la nota se creó correctamente
				sendJSON(res, 201, note);
			} catch (err) {
				// Respondiendo con un error 400 (Bad Request) si el JSON es inválido
				sendError(res, 400, err.message);
			}
		}

		// PUT /notas/:id - reemplaza nota completa
		else if (method === 'PUT' && id) {
			const data = await readBody(req);
			if (!data?.title) return sendError(res, 400, 'El campo "title" es obligatorio');
			// Reemplaza todo, solo conserva el id y createdAt
			const note = await replaceNote(id, data);
			note ? sendJSON(res, 200, note) : sendError(res, 404, 'Nota no encontrada');
		}

		// PATCH /notas/:id - actualiza campos parcialmente
		else if (method === 'PATCH' && id) {
			const data = await readBody(req);
			const note = await updateNote(id, data);
			note ? sendJSON(res, 200, note) : sendError(res, 404, 'Nota no encontrada');
		}
 
		// DELETE /notas/:id - elimina nota
		else if (method === 'DELETE' && id) {
			const note = await deleteNote(id);
			note ? sendJSON(res, 200, note) : sendError(res, 404, 'Nota no encontrada');
		}
 
		// Respondiendo con un error 405 (Method Not Allowed) si el método no es compatible con la ruta
		else {
			sendError(res, 405, 'Método no permitido');
		}
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
		c('magenta', 'API de Notas iniciado en:'), c('yellow', `http://${HOST}:${port}/`),
		c('cyan', '\nPrueba la API usando el archivo "cliente.html" o curl, ejecutando: curl <url>'),
		'\nOpciones de curl con argumento para definir método, encabezados y datos: -X -H -d',
		c('gray', `\nDetén la API presionando Ctrl+C o ejecutando: kill ${process.pid}\n`)
	);
});

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
	console.log('\nCerrando servidor...');
	server.close(() => {
		console.log(c('green', 'Servidor cerrado.'));
		process.exit(0);
	});
}));
