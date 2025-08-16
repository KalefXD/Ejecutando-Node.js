import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { styleText as c } from 'node:util';
import {
  leerNotas,
  agregarNota,
  obtenerNota,
  actualizarNota,
  eliminarNota
} from './notas.js';

// Obtener nombre y directorio del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde un archivo .env
process.loadEnvFile(path.join(__dirname, '.env'));
const PORT = process.env.PORT ?? 3000;
const HOST = process.env.HOST ?? 'localhost';

// Función para parsear datos de solicitudes POST, PUT, PATCH y DELETE
function parseJsonData(req) {
	return new Promise((resolve, reject) => {
		let body = '';
		const maxSize = 1024 * 1024; // Limite de 1MB para el cuerpo de la solicitud

		// Verificar que el Content-Type sea application/json
        if (!req.headers['content-type']?.includes('application/json')) {
            return reject(new Error('Content-Type debe ser application/json.'));
        }

		// Manejar los fragmentos de datos cuando llegan
		req.on('data', chunk => {
			// Detener la conexión si se excede el límite
            if (body.length > maxSize) {
                req.socket.destroy();
                return reject(new Error('Tamaño máximo de datos excedido (1MB)'));
            }
			// Acumular los fragmentos
            body += chunk.toString('utf8');
		});

		// Manejar el cierre de la petición cuando termina de recibir datos
		req.on('end', () => {
            try {
				// Intentar parsear el cuerpo como JSON
                resolve(JSON.parse(body));
            } catch (err) {
                reject(new Error('JSON inválido: ' + err.message));
            }
		});

		// Manejar errores de la petición
		req.on('error', reject);
	});
}

// Crear el servidor HTTP para la API de Notas
const server = http.createServer(async (req, res) => {
	const { method, url } = req;

	const requestTime = new Date();
	console.log(
		c('gray', requestTime.toLocaleTimeString()),
		c('green', 'Petición:'),
		c('yellow', `${req.socket.remoteAddress}`),
		c('magenta', method),
		c('cyan', url)
	);

	// Función para manejar respuestas JSON
	const send = (status, data) => {
		res.writeHead(status, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(data));
	};

	const currentPath = decodeURIComponent(path.normalize(url).split('?')[0]);

	// Manejar las peticiones de notas y sus IDs
	const partes = currentPath.split('/').filter(Boolean);
	const resource = partes[0];
	const id = partes[1];

	try {
		// Enrutamiento para el recurso "notas"
		if (resource === 'notas') {
			if (method === 'GET' && !id) {
				const notas = await leerNotas();
				return send(200, notas);
			}
			else if (method === 'GET' && id) {
				const nota = await obtenerNota(id);
				return nota ? send(200, nota) : send(404, { error: 'Nota no encontrada' });
			}
			else if (method === 'POST' && !id) {
				const notaData = await parseJsonData(req);
				const nuevaNota = await agregarNota(notaData);
				return send(201, nuevaNota); // 201 Created
			}
			else if ((method === 'PUT' || method === 'PATCH') && id) {
				const cambios = await parseJsonData(req);
				const esReemplazo = method === 'PUT';
				const actualizada = await actualizarNota(id, cambios, esReemplazo);
				return actualizada ? send(200, actualizada) : send(404, { error: 'Nota no encontrada' });
			}
			else if (method === 'DELETE' && id) {
				const exito = await eliminarNota(id);
				return exito ? send(204, null) : send(404, { error: 'Nota no encontrada' }); // 204 No Content
			}
		}

		return send(404, { error: 'Ruta no encontrada' });

	} catch (err) {
		return send(400, { error: 'Error procesando la solicitud', detalle: err.message }); // 400 Bad Request
	} finally {
		const responseTime = Date.now() - requestTime.getTime();
		console.log(
			c('gray', responseTime + 'ms'),
			c('green', 'Respuesta:'),
			c(res.statusCode < 400 ? 'magenta' : 'red', `[${res.statusCode}]`)
		);
	}
});

server.listen(PORT, HOST, () => {
    const { port } = server.address();
	console.log(
    	c('magenta', 'Servidor de Notas iniciado en:'), c('yellow', `http://${HOST}:${port}`),
    	c('cyan', '\nPunto de entrada:'), c('yellow', `/notas`),
		c('gray', `\nDetén el servidor presionando Ctrl+C o ejecutando: kill ${process.pid}\n`)
	);
});


['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
	console.log('\nCerrando servidor...');
	server.close(() => {
		console.log(c('green', 'Servidor cerrado.'));
		process.exit(0);
	});
}));
