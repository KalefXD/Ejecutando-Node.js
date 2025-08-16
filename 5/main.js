import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import process from 'node:process';
import { styleText as c } from 'node:util';

// Configurar servidor HTTP con carpeta pública y variables de entorno
const PUBLIC_DIR = path.resolve(process.argv[2] ?? '.');
const PORT = process.env.PORT ?? 0;
const HOST = process.env.HOST ?? 'localhost';

/** Nota:
 * `process.env` es un objeto que contiene las variables de entorno del proceso actual.
 * Puedes definirlas en la terminal: `PORT=3000 HOST=127.0.0.1 node main.js`.
 * Al asignar el puerto a 0, el sistema operativo elige un puerto libre automáticamente.
 */

if (!process.argv[2]) console.log(
	c('red', 'Uso: node main.js <carpeta>'),
	c('green', '[opcional: directorio del archivo actual]'),
	'\nDescripción: Inicia un servidor HTTP que sirve archivos estáticos.',
);

// Función para obtener el tipo MIME según la extensión del archivo
function getMimeType(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	const mimeTypes = {
		'.txt': 'text/plain', '.html': 'text/html', '.htm': 'text/html',
		'.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript',
		'.json': 'application/json', '.xml': 'application/xml', '.pdf': 'application/pdf',
		'.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg',
		'.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
		'.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
		'.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg'
	};
	const mimeType = mimeTypes[ext] ?? 'application/octet-stream';
	// Tipos de texto que deben incluir charset=utf-8
	const textTypes = ['.html', '.css', '.txt', '.js', '.json', '.svg'];
	return textTypes.includes(ext) ? mimeType + '; charset=utf-8' : mimeType;
}

/** Nota:
 * Los tipos MIME le indican al navegador cómo interpretar un archivo (ej: `text/html` para una página web).
 * `application/octet-stream` es el tipo genérico para datos binarios, lo que usualmente provoca su descarga.
 * Añadir `charset=utf-8` a los tipos de texto asegura que los caracteres especiales se muestren correctamente.
 */

// Crear servidor HTTP
const server = http.createServer(async (req, res) => {
	const { method, url } = req;

	// Registrar la petición en la consola
	const requestTime = new Date();
	console.log(
		c('gray', requestTime.toLocaleTimeString()),
		c('green', 'Petición:'),
		c('yellow', `${req.socket.remoteAddress}`),
		c('magenta', method),
		c('cyan', url)
	);

    // Normalizar ruta, ignorar query-strings y decodificar la URL
    const currentPath = decodeURIComponent(path.normalize(url).split('?')[0]);
	let filePath = path.join(PUBLIC_DIR, currentPath);

	// Si la ruta es un directorio, buscar el archivo index.html
	if (currentPath.endsWith('/')) filePath = path.join(filePath, 'index.html');

	try {
		// Leer el archivo solicitado
		const data = await fs.readFile(filePath);
		const mimeType = getMimeType(filePath);

		// Enviar la respuesta con el contenido y el tipo MIME correcto
		res.setHeader('Content-Type', mimeType);
		res.end(data);

	} catch (err) {
        // Manejar errores, principalmente si el archivo no existe
		if (err.code === 'ENOENT') {
			res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
			res.write('<!DOCTYPE html><h1>404 - Not Found</h1>');
            res.end('<p>No se encontró el archivo solicitado.</p>');
		} else {
			res.statusCode = 500;
			res.end('500 - Internal Server Error');
		}

	} finally {
        // Registrar la respuesta y el tiempo de procesamiento
		const responseTime = Date.now() - requestTime.getTime();
		console.log(
			c('gray', responseTime + 'ms'),
			c('green', 'Respuesta:'),
			c(res.statusCode < 400 ? 'magenta' : 'red', `[${res.statusCode}]`)
		);
	}
});

/** Nota:
 * El módulo `node:http` permite crear y manejar servidores y clientes HTTP.
 * `http.createServer` crea un servidor HTTP y usa un callback con req (request) y res (response) para manejar solicitudes y respuestas.
 * `req` contiene información sobre la petición (método, URL, cabeceras, etc.), y `res` se usa para enviar la respuesta al cliente.
 * Los códigos de estado HTTP (200 OK, 404 Not Found, 500 Error) son parte del protocolo y le indican al cliente el resultado de su solicitud.
 */

// Iniciar el servidor para que escuche peticiones
server.listen(PORT, HOST, () => {
	// Mostrar información del servidor al iniciar
    const { port } = server.address();
	console.log(
		c('cyan', '\nCarpeta pública:'), c('yellow', PUBLIC_DIR),
		c('magenta', '\nServidor HTTP iniciado en:'), c('yellow', `http://${HOST}:${port}`),
		c('gray', `\nDetén el servidor presionando Ctrl+C o ejecutando: kill ${process.pid}\n`)
	);
});

// Manejar el cierre del servidor de forma controlada
['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
	console.log('\nCerrando servidor...');
	server.close(() => {
		console.log(c('green', 'Servidor cerrado.'));
		process.exit(0);
	});
}));

/** Nota:
 * `SIGINT` y `SIGTERM` son señales que el sistema operativo envía a un proceso para solicitar su terminación.
 * La primera es comúnmente enviada por el usuario (Ctrl+C), y la segunda por herramientas de sistema o comandos (kill).
 * Estas señales nos permite realizar una limpieza (como cerrar el servidor o la base de datos) antes de que el proceso finalice abruptamente.
 */
