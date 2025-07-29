import http from 'node:http'; // Módulo para crear un servidor HTTP
import path from 'node:path';
import fs from 'node:fs/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url'; // Módulo para manejar URLs de archivos
import { styleText as c } from 'node:util';

// NOTA: __filename y __dirname son variables globales solo en módulos CommonJS.
const __filename = fileURLToPath(import.meta.url); // Obtener el nombre del archivo actual
const __dirname = path.dirname(__filename); // Obtener el directorio del archivo actual
const PUBLIC_DIR = path.join(__dirname, 'public'); // Ruta absoluta a la carpeta /public

// Configuración del servidor con variables de entorno
const PORT = process.env.PORT ?? 3000;
const HOST = process.env.HOST ?? 'localhost';

// Función para obtener el tipo mimeType según la extensión
function getMimeType(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	const mimeTypes = {
		'.html': 'text/html', '.css': 'text/css', '.txt': 'text/plain',
		'.js': 'application/javascript', '.json': 'application/json',
		'.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg',
		'.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
		'.ico': 'image/x-icon', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg'
	};
	const mimeType = mimeTypes[ext] ?? 'application/octet-stream';
	// Tipos de texto que deben incluir charset=utf-8
	const textTypes = ['.html', '.css', '.txt', '.js', '.json', '.svg'];
	return textTypes.includes(ext) ? mimeType + '; charset=utf-8' : mimeType;
}

// Crear servidor HTTP
const server = http.createServer(async (req, res) => { // Petición y respuesta
	const { method, url } = req;
	const currentPath = url.split('?')[0]; // Ignorar query-strings primero
	const safePath = decodeURIComponent(currentPath); // Luego decodificar la ruta

	console.log(c('green', 'Petición:'), c('magenta', method), c('cyan', url));

	// Manejar peticiones GET
	let filePath = safePath === '/' ? '/index.html' : safePath;
	filePath = path.join(PUBLIC_DIR, filePath);

	try { // Leer el archivo si existe
		const data = await fs.readFile(filePath);
		const mimeType = getMimeType(filePath);

		res.setHeader('Content-Type', mimeType); // Establece el tipo del contenido
		res.end(data); // Finaliza la respuesta enviando el contenido del archivo

		console.log(c('green', 'Archivo servido:'), c('yellow', path.basename(filePath)));
	} catch (err) {
		// Si el archivo no existe, devolver código 404 Not Found (por defecto 200 OK)
		if (err.code === 'ENOENT') {
			res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
			res.write('<!DOCTYPE html><h1>404 - Ruta no encontrada</h1>');
			res.end('<nav><a href="/">Volver al inicio</a></nav>');

			console.log(c('red', 'Se ha servido un error 404'));
		} else { // Si es otro error, devolver código 500 Internal Server Error
			res.statusCode = 500;
			res.end('Error interno del servidor');

			console.error(c('red', 'Error del servidor:'), err.message);
		}
	}
});

// Iniciar servidor
server.listen(PORT, HOST, console.log(
	c('magenta', 'Servidor HTTP iniciado en:'), c('yellow', `http://${HOST}:${PORT}`),
	c('gray', '\nPresiona Ctrl+C para detener el servidor\n')
));

// Manejar cierre del servidor
['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
	// SIGINT Proceso interrumpido, causa común: Usuario (Ctrl+C)
	// SIGTERM Proceso terminado de forma limpia, causa común: Sistema o comandos (kill)
	console.log('\nCerrando servidor...');
	server.close(() => {
		console.log(c('green', 'Servidor cerrado correctamente'));
		process.exit(0);
	});
}));
