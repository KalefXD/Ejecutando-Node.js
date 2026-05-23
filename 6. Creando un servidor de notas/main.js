/**
 * 6. Creando un servidor de notas
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
	leerNotas,
	agregarNota,
	obtenerNota,
	actualizarNota,
	eliminarNota
} from './notas.js';

/**
 * Apuntes:
 * REST (Representational State Transfer) es un estilo arquitectónico que usa métodos HTTP estándar
 * para operaciones CRUD: Create (POST), Read (GET), Update (PUT/PATCH) y Delete (DELETE).
 * Implementarlo sin frameworks permite ver exactamente cómo funciona cada parte del protocolo.
 */

// Obteniendo nombre y directorio del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Apuntes:
 * En ES modules, no tenemos acceso directo a __filename y __dirname como en CommonJS.
 * `import.meta.url` devuelve la URL del módulo actual (ej: file:///path/to/file.js).
 * `fileURLToPath()` convierte esa URL del archivo a una ruta del sistema de archivos.
 */

// Cargando variables de entorno desde un archivo .env
process.loadEnvFile(path.join(__dirname, '.env'));
const PORT = process.env.PORT ?? 0;
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

let reqCount = 0;

// Creando el servidor HTTP para la API de Notas
const server = http.createServer(async (req, res) => {
	const { method, url } = req;

	const requestTime = new Date();
	console.log(
		c('gray', requestTime.toLocaleTimeString()),
		c('green', `Petición #${++reqCount}:`),
		c('yellow', req.socket.remoteAddress),
		c('magenta', method),
		c('cyan', url)
	);

	// Configurando headers CORS para permitir peticiones desde el navegador
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	/**
	 * Apuntes:
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
	const partes = urlPath.split('/').filter(Boolean);
	const resource = partes[0];
	const id = partes[1];

	try {
		// Enrutando las peticiones según el recurso solicitado
		if (resource === 'notas') {
			// GET /notas - Obtener todas las notas
			if (method === 'GET' && !id) {
				const notas = await leerNotas();
				return send(200, notas);
			}
			// GET /notas/:id - Obtener una nota específica por ID
			if (method === 'GET' && id) {
				const nota = await obtenerNota(id);
				return nota ? send(200, nota) : send(404, { error: 'Nota no encontrada' });
			}
			// POST /notas - Crear una nueva nota
			if (method === 'POST' && !id) {
				const notaData = await parseJsonData(req);
				const nuevaNota = await agregarNota(notaData);
				return send(201, nuevaNota); // 201 Created indica recurso creado exitosamente
			}
			// PUT /notas/:id - Reemplazar completamente una nota existente
			// PATCH /notas/:id - Actualizar parcialmente una nota existente
			if ((method === 'PUT' || method === 'PATCH') && id) {
				const cambios = await parseJsonData(req);
				const esReemplazo = method === 'PUT';
				const actualizada = await actualizarNota(id, cambios, esReemplazo);
				return actualizada ? send(200, actualizada) : send(404, { error: 'Nota no encontrada' });
			}
			// DELETE /notas/:id - Eliminar una nota específica
			if (method === 'DELETE' && id) {
				const exito = await eliminarNota(id);
				return exito ? send(204, null) : send(404, { error: 'Nota no encontrada' }); // 204 No Content para eliminación exitosa
			}
		}

		// Devolver 404 si no coincide con ninguna ruta
		return send(404, { error: 'Ruta no encontrada' });
	} catch (err) {
		return send(400, { error: 'Error procesando la solicitud', detalle: err.message }); // 400 Bad Request
	} finally {
		const responseTime = Date.now() - requestTime.getTime();
		console.log(
			c('gray', responseTime + 'ms'),
			c('green', `Respuesta #${reqCount}:`),
			c(res.statusCode < 400 ? 'magenta' : 'red', `[${res.statusCode}]`)
		);
	}
});

server.listen(PORT, HOST, () => {
	const { port } = server.address();
	console.log(
		c('magenta', 'Servidor de Notas iniciado en:'), c('yellow', `http://${HOST}:${port}`),
		c('cyan', '\nPunto de entrada:'), c('yellow', `/notas`)
	);
	console.group(c('green', 'Endpoints disponibles:'));
	[
		'GET    /notas     - Listar todas las notas',
		'GET    /notas/:id - Obtener una nota específica',
		'POST   /notas     - Crear una nueva nota',
		'PUT    /notas/:id - Reemplazar una nota completa',
		'PATCH  /notas/:id - Actualizar parcialmente una nota',
		'DELETE /notas/:id - Eliminar una nota',
	].forEach(endPoint => console.log(endPoint));
	console.groupEnd();
	console.log(c('gray', `Detén el servidor presionando Ctrl+C o ejecutando: kill ${process.pid}\n`));
});

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
	console.log('\nCerrando servidor...');
	server.close(() => {
		console.log(c('green', 'Servidor cerrado.'));
		process.exit(0);
	});
}));
