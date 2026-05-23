/**
 * 5. Creando un servidor HTTP
 *
 * En este script se crea un servidor HTTP que sirve archivos estáticos desde una carpeta pública.
 * Se trabaja con rutas, tipos MIME, manejo de errores HTTP y señales del sistema operativo.
 * El lector verá cómo funciona un servidor web básico desde adentro: recibir una petición,
 * localizar el archivo en disco, asignarle el tipo correcto y enviarlo como respuesta al navegador.
 */

import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { styleText as c } from 'node:util';

// Configurando la carpeta pública y las variables del servidor
const PUBLIC_DIR = path.resolve(process.argv[2] ?? '.');
const PORT = process.env.PORT ?? 0;
const HOST = process.env.HOST ?? 'localhost';

/**
 * Apuntes:
 * `PORT` define en qué puerto escuchará el servidor, y `HOST` en qué interfaz de red lo hará.
 * Usar `localhost` limita el acceso al equipo local, mientras que `0.0.0.0` lo expone a la red.
 * Asignar el puerto a `0` le indica al sistema operativo que elija uno libre automáticamente.
 * Puedes definir estas variables al ejecutar el script: `PORT=3000 HOST=0.0.0.0 node main.js carpeta`.
 */

if (!process.argv[2]) console.log(
	c('red', 'Uso: node main.js <carpeta>'),
	c('green', '[opcional: directorio actual]'),
	'\nDescripción: Inicia un servidor HTTP que sirve archivos estáticos.'
);

// Función para obtener el tipo MIME según la extensión del archivo
function getMimeType(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	const mimeTypes = {
		'.txt': 'text/plain', '.html': 'text/html', '.css': 'text/css',
		'.js': 'application/javascript', '.json': 'application/json', '.xml': 'application/xml',
		'.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif',
		'.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
		'.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav'
	};
	const mimeType = mimeTypes[ext] ?? 'application/octet-stream';
	// Tipos de archivos que deben incluir `charset=utf-8`
	const textTypes = ['.txt', '.html', '.css', '.js', '.json', '.svg', '.xml'];
	return textTypes.includes(ext) ? mimeType + '; charset=utf-8' : mimeType;
}

/**
 * Apuntes:
 * Los tipos MIME le indican al navegador cómo interpretar el contenido de un archivo (ej.: `text/html` para una página web).
 * `application/octet-stream` es el tipo genérico para datos binarios desconocidos, lo que usualmente provoca su descarga.
 * Añadir `charset=utf-8` a los tipos de texto asegura que los caracteres especiales (tildes, ñ) se muestren correctamente.
 */

// Llevando el conteo de peticiones
let reqCount = 0;

// Creando el servidor HTTP
const server = http.createServer(async (req, res) => {
	const { method, url } = req;

	// Registrando cada petición en la consola con su hora de llegada
	const requestTime = new Date();
	console.log(
		c('gray', requestTime.toLocaleString()),
		c('green', `Petición #${++reqCount}:`),
		c('yellow', req.socket.remoteAddress),
		c('magenta', method),
		c('cyan', url)
	);

	// Ignorando query strings y decodificando caracteres especiales de la URL
	const urlPath = decodeURIComponent(url.split('?')[0]);
	let filePath = path.join(PUBLIC_DIR, urlPath);

	// Buscando el archivo `index.html` si la ruta es un directorio
	if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');

	try {
		// Leyendo el archivo solicitado
		const data = await fs.readFile(filePath);
		const mimeType = getMimeType(filePath);

		// Enviando la respuesta con el contenido y su tipo MIME
		res.setHeader('Content-Type', mimeType);
		res.end(data);

	} catch (err) {
        // Manejando errores, principalmente si el archivo no existe
		if (err.code === 'ENOENT') {
			res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
			res.write('<!DOCTYPE html><h1>404 - Not Found</h1>');
            res.end('<p>No se encontró el archivo solicitado.</p>');
		} else {
			res.statusCode = 500;
			res.end('500 - Internal Server Error');
		}

	} finally {
        // Registrando la respuesta con el tiempo de procesamiento
		const responseTime = Date.now() - requestTime.getTime();
		console.log(
			c('gray', responseTime + 'ms'),
			c('green', `Respuesta #${reqCount}:`),
			c(res.statusCode < 400 ? 'magenta' : 'red', `[${res.statusCode}]`)
		);
	}
});

/**
 * Apuntes:
 * El módulo `node:http` permite crear y manejar servidores y clientes HTTP.
 * `http.createServer()` crea un servidor HTTP y recibe un callback que se ejecuta con cada petición.
 * El callback recibe dos objetos: `req` (request), con información sobre la petición del cliente
 * (método, URL, cabeceras, etc.), y `res` (response), para construir y enviar la respuesta.
 * Los códigos de estado HTTP (200, 404, 500) forman parte del protocolo e indican al cliente
 * si la operación fue exitosa, si el recurso no existe o si hubo un error en el servidor.
 */

// Iniciando el servidor para que escuche peticiones
server.listen(PORT, HOST, () => {
	// Mostrando información del servidor al iniciar
    const { port } = server.address();
	console.log(
		c('magenta', '\nServidor HTTP iniciado en:'), c('yellow', `http://${HOST}:${port}`),
		c('cyan', '\nCarpeta pública:'), c('yellow', PUBLIC_DIR),
		c('gray', `\nDetén el servidor presionando Ctrl+C o ejecutando: kill ${process.pid}\n`)
	);
});

// Manejando el cierre del servidor de forma controlada ante señales del sistema operativo
['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
	console.log('\nCerrando servidor...');
	server.close(() => {
		console.log(c('green', 'Servidor cerrado.'));
		process.exit(0);
	});
}));

/**
 * Apuntes:
 * `SIGINT` y `SIGTERM` son señales que el sistema operativo envía a un proceso para pedirle que termine.
 * `SIGINT` se genera cuando el usuario pulsa Ctrl+C en la terminal.
 * `SIGTERM` la envían herramientas del sistema o comandos como `kill`.
 * Escuchar estas señales permite hacer una limpieza ordenada antes de salir:
 * cerrar el servidor, liberar recursos o terminar conexiones abiertas.
 * También existe el evento `exit` en `process`, que se dispara cuando el proceso está a punto de cerrarse.
 * Sin embargo, mezclarlo con señales en el mismo handler causa problemas: al pulsar Ctrl+C,
 * `SIGINT` llama a `server.close()`, que termina con `process.exit(0)`, lo que dispara `exit`
 * y ejecuta el handler una segunda vez. Además, `exit` solo admite código síncrono,
 * por lo que operaciones como `server.close()` no tendrían tiempo de completarse ahí.
 */
