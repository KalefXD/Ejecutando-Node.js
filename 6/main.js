/**
 * 6. Creando una API de notas
 *
 * Apunte #1:
 * El módulo `node:stream/consumers` ofrece funciones que consumen un flujo de datos completo
 * y lo convierten en un formato útil. `json()` lee el cuerpo de la petición como un flujo,
 * espera a que llegue completo y lo parsea como JSON, equivalente a hacer `JSON.parse(await text())`.
 * 
 * REST (Representational State Transfer) es un estilo arquitectónico que usa métodos HTTP estándar
 * para operaciones CRUD: Create (POST), Read (GET), Update (PUT/PATCH) y Delete (DELETE).
 * Implementarlo sin frameworks permite ver exactamente cómo funciona cada parte del protocolo.
 * 
 * Un Model es la capa que se encarga de acceder y manipular los datos de la aplicación,
 * sin que el resto del código necesite saber cómo se almacenan o de dónde vienen.
 * Aquí `noteModel` concentra esa lógica para las notas (leer, guardar, actualizar el archivo JSON),
 * lo que permite cambiar la fuente de datos en el futuro (por ejemplo, a una base de datos)
 * sin tocar el resto del servidor.
 */

import http from 'node:http';
import { json } from 'node:stream/consumers';
import { Buffer } from 'node:buffer';
import path from 'node:path';
import { styleText as c } from 'node:util';
import { noteModel } from './noteModel.js';

/**
 * Apunte #2:
 * Los archivos `.env` se usan para separar la configuración del código fuente.
 * Centralizar ahí variables como puertos, hosts, claves de API o credenciales de base de datos
 * evita que esos valores queden expuestos en el repositorio.
 * Por eso es habitual añadir `.env` al `.gitignore` y compartir en su lugar un `.env.example`
 * con los nombres de las variables pero sin sus valores reales.
 */

// Cargando variables de entorno desde un archivo .env
process.loadEnvFile(path.join(import.meta.dirname, '.env'));
const PORT = process.env.PORT ?? 3000, HOST = process.env.HOST ?? 'localhost';

// Funciones Helpers de respuesta:
const sendJSON = (res, status, data) => {
	const body = JSON.stringify(data);
	res.writeHead(status, {
		'Content-Type': 'application/json',
		'Content-Length': Buffer.byteLength(body),
	});
	res.end(body);
};
 
const sendError = (res, status, message) => sendJSON(res, status, { error: message });

/**
 * Apunte #3:
 * Limitar el tamaño del cuerpo antes de leerlo protege el servidor de peticiones maliciosas
 * que envíen payloads enormes para agotar la memoria o bloquear el proceso.
 * `json()` de `node:stream/consumers` consume el flujo completo de la petición internamente,
 * por lo que validar el `Content-Length` antes de llamarla es la única oportunidad de cortar a tiempo.
 */

// Limitando el cuerpo a 1MB para prevenir ataques
const maxSize = 1024 * 1024;
 
// Lee y valida el body JSON (respeta el límite de tamaño)
const readBody = async (req) => {
	const contentLength = Number(req.headers['content-length'] ?? 0);
	if (contentLength > maxSize) throw new Error('Payload demasiado grande (1MB)');
	return json(req);
};

let requestCount = 0;

// Creando el servidor HTTP para la API de Notas
const server = http.createServer(async (req, res) => {
	const { method } = req;
    const url = new URL('http://' + req.headers.host + req.url);

	const requestTime = new Date();
	const requestId = ++requestCount;
	console.log(
		c('gray', requestTime.toLocaleString()),
		c('green', `Petición #${requestId}:`),
		c('yellow', req.socket.remoteAddress),
		c('magenta', method),
		c('cyan', req.url)
	);

	/**
	 * Apunte #4:
	 * CORS (Cross-Origin Resource Sharing) permite a los servidores web de un origen intercambiar recursos con otro origen.
	 * Sin CORS, los navegadores bloquean peticiones entre diferentes orígenes por seguridad (Same-Origin Policy).
	 * Los navegadores definen un "origen" por el esquema (protocolo), host (dominio) y puerto (Ej: http, localhost y 3000).
	 * Las peticiones OPTIONS son peticiones "preflight" que los navegadores envían automáticamente para verificar permisos.
	 * En producción, es recomendable especificar orígenes específicos en lugar de '*' para mayor seguridad.
	 */

	// Permitiendo peticiones desde navegadores con un header CORS
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Respondiendo rápidamente headers CORS a las solicitudes OPTIONS sin contenido (204 No Content)
	if (method === 'OPTIONS') {
		res.writeHead(204, {
			"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
			"Access-Control-Allow-Headers": "Content-Type, Authorization"
		});
		res.end();
	}

	else {
		const parts = url.pathname.replace(/\/$/, '').split('/').filter(Boolean);
		const [resource, id] = parts;
 
		if (resource !== 'notas') sendError(res, 404, 'Ruta no encontrada');
 
		// GET /notas - Consigue todas las notas
		else if (method === 'GET' && !id) {
			const notes = await noteModel.getAll();
			sendJSON(res, 200, notes);
		}
 
		// GET /notas/:id - Consigue una nota
		else if (method === 'GET' && id) {
			const note = await noteModel.get(id);
			note ? sendJSON(res, 200, note) : sendError(res, 404, 'Nota no encontrada');
		}
 
		// POST /notas - Crea una nota
		else if (method === 'POST' && !id) {
			try {
				const data = await readBody(req);
				if (!data?.title) return sendError(res, 400, 'El campo "title" es obligatorio');
				const note = await noteModel.add(data);
				// Respondiendo con un código 201 (Created) si la nota se creó correctamente
				sendJSON(res, 201, note);
			} catch (err) {
				// Respondiendo con un error 400 (Bad Request) si el JSON es inválido
				sendError(res, 400, err.message);
			}
		}

		// PUT /notas/:id - Reemplaza una nota completa
		else if (method === 'PUT' && id) {
			const data = await readBody(req);
			if (!data?.title) return sendError(res, 400, 'El campo "title" es obligatorio');
			// Reemplaza todo, solo conserva el id y createdAt
			const note = await noteModel.replace(id, data);
			note ? sendJSON(res, 200, note) : sendError(res, 404, 'Nota no encontrada');
		}

		// PATCH /notas/:id - Actualiza campos parcialmente
		else if (method === 'PATCH' && id) {
			const data = await readBody(req);
			const note = await noteModel.update(id, data);
			note ? sendJSON(res, 200, note) : sendError(res, 404, 'Nota no encontrada');
		}
 
		// DELETE /notas/:id - Elimina una nota
		else if (method === 'DELETE' && id) {
			const note = await noteModel.delete(id);
			note ? sendJSON(res, 200, note) : sendError(res, 404, 'Nota no encontrada');
		}
 
		// Respondiendo con un error 405 (Method Not Allowed) si el método no es compatible con la ruta
		else sendError(res, 405, 'Método no permitido');
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
		'\nPrueba la API usando el archivo "cliente.html" o curl, ejecutando: curl <url>',
		'\nOpciones de curl con argumento para poner método, encabezados y datos: -X -H -d',
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
