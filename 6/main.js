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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.loadEnvFile(path.join(__dirname, '.env')); // Carga las variables de entorno desde .env
const PORT = process.env.PORT ?? 3000;
const HOST = process.env.HOST ?? 'localhost';

// Función para parsear datos de solicitudes POST, PUT, PATCH y DELETE
function parseJsonData(req) {
	return new Promise((resolve, reject) => {
		let body = '';
		const maxSize = 1024 * 1024; // Limite de 1MB para el cuerpo de la solicitud
		let size = 0;

		// Verifica que el Content-Type sea application/json
		const contentType = req.headers['content-type'];
		if (!contentType.includes('application/json')) {
			return reject(new Error('Content-Type debería ser application/json para esta API.'));
		}

		// Evento que se ejecuta cuando llegan fragmentos de datos
		req.on('data', chunk => {
			size += chunk.length;
			if (size > maxSize) {
				req.pause(); // Pausa la recepción de datos si se excede el límite
				return reject(new Error('Tamaño máximo de datos excedido (1MB)'));
			}
			body += chunk.toString('utf8'); // Acumula los fragmentos
		});

		// Evento que se ejecuta cuando termina la petición de recibir datos
		req.on('end', () => {
			try {
				const data = JSON.parse(body); // Intenta parsear el cuerpo como JSON
				resolve(data);
			} catch (err) {
				// Rechaza la promesa si el JSON es inválido
				reject(new Error('JSON invalido:' + err.message));
			}
		});

		// Manejar errores de la petición
		req.on('error', reject);
	});
}

const server = http.createServer(async (req, res) => {
	const { method, url } = req;
	const currentPath = url.split('?')[0];
	const safePath = decodeURIComponent(currentPath);
	const partes = safePath.split('/').filter(Boolean);
	const id = partes[1]; // Asume que el ID de la nota es la segunda parte de la ruta

	console.log(c('green', 'Petición:'), c('magenta', method), c('cyan', url));

	// Manejar peticiones POST
	const send = (status, data) => {
		res.writeHead(status, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(data));
	};

	// Enrutamiento básico según método y ruta
	try {
		if (req.method === 'GET' && safePath === '/notas') {
			const notas = await leerNotas();
			return send(200, notas);

		} else if (req.method === 'GET' && partes[0] === 'notas' && id) {
			const nota = await obtenerNota(id);
			return nota ? send(200, nota) : send(404, { error: 'Nota no encontrada' });

		} else if (req.method === 'POST' && safePath === '/notas') {
			const nota = await parseJsonData(req);
			const nueva = await agregarNota(nota);
			return send(201, nueva);

		} else if ((req.method === 'PUT' || req.method === 'PATCH') && partes[0] === 'notas' && id) {
			const cambios = await parseJsonData(req);
			const actualizada = await actualizarNota(id, cambios, req.method === 'PUT');
			return actualizada ? send(200, actualizada) : send(404, { error: 'Nota no encontrada' });

		} else if (req.method === 'DELETE' && partes[0] === 'notas' && id) {
			const ok = await eliminarNota(id);
			return ok ? send(200, { mensaje: 'Nota eliminada' }) : send(404, { error: 'Nota no encontrada' });

		} else {
			return send(404, { error: 'Ruta o método no soportado' });
		}
	} catch (err) {
		return send(400, { error: 'Error procesando la solicitud', detalle: err.message });
	}
});

server.listen(PORT, HOST, console.log(
	c('magenta', 'Servidor de Notas iniciado en:'), c('yellow', `http://${HOST}:${PORT}`),
  	c('cyan', '\nPunto de entrada:'), c('yellow', `/notas`),
	c('redBright', '\nTarea: Envía peticiones con JSON a /notas usando curl o un cliente HTTP.'),
  	c('gray', `\nEj: curl -X POST http://${HOST}:${PORT}/notas -H "Content-Type: application/json" -d '{"titulo":"NOTA"}'`),
	c('gray', '\nPresiona Ctrl+C para detener el servidor\n')
));

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
	console.log('\nCerrando servidor...');
	server.close(() => {
		console.log(c('green', 'Servidor cerrado correctamente'));
		process.exit(0);
	});
}));
