// 3. Listando el contenido de una carpeta

import path from 'node:path';
import fs from 'node:fs/promises';
import { styleText as c } from 'node:util';

// Definiendo la carpeta a listar (directorio actual por defecto)
const folder = process.argv[2] ?? '.';

// Mostrando mensaje de uso si no se pasa un argumento
if (!process.argv[2]) console.log(
	c('red', 'Uso: node main.js <carpeta>'),
	c('green', '[opcional: directorio actual]'),
	'\nDescripción: Lista el contenido de un directorio.',
	c('yellow', '\nEjemplo: node main.js carpeta\n')
);

// Leyendo el contenido del directorio
fs.readdir(folder)
	.then(showDirFiles)
	.catch(err => {
		console.error(c('red', 'Error al leer el directorio:'), err.message);
		process.exit(1);
	});

/**
 * Apunte #1:
 * Se usa una función `async` dentro de `.then()` para poder utilizar `await`.
 * Una función `async` siempre devuelve una Promise.
 * Si ocurre un error durante un `await`, la Promise se rechaza y el `.catch()`
 * de la cadena puede capturarlo.
 * Sin `async`, `await` no es válido sintácticamente y `.then()` no esperaría
 * automáticamente el trabajo asíncrono realizado dentro de la función.
 */

async function showDirFiles(files) {
	// Mostrando encabezado con la ruta absoluta del directorio
	console.group(
		c('magenta', 'Contenido del directorio:'),
		c('yellow', path.resolve(folder))
	);

	// Informando y saliendo si el directorio está vacío
	if (files.length === 0) {
		console.groupEnd();
		console.log(c('cyan', 'El directorio está vacío.'));
		process.exit();
	}

	// Encontrando el ancho máximo de los nombres para alinear la salida en consola
	const maxLength = Math.max(...files.map(f => f.length));

	// Leyendo en paralelo los metadatos de cada archivo
	const entries = await Promise.all(
		// Creando un array de promesas para cada archivo
		files.map(async (file, i) => {
			// Uniendo la ruta del directorio con el nombre del archivo
			const fullPath = path.join(folder, file);

			/**
			 * Apunte #2:
			 * Si se necesita consultar los metadatos de un enlace simbólico
			 * en lugar del archivo al que apunta, se usa `fs.lstat()`.
			 */

			// Obteniendo información del archivo
			return fs.stat(fullPath)
				.then(stats => {
					// Determinando tipo, tamaño y fecha de modificación a partir de las estadísticas
					const fileType = stats.isFile() ? 'F' : stats.isDirectory() ? 'D' : 'O';
					const fileTypeColor = fileType == 'F' ? 'green' : fileType == 'D' ? 'blue' : 'red';
					const fileSize = fileType == 'F' ? (stats.size / 1024).toFixed(3) + ' KB' : '---';
					const fileModified = stats.mtime.toLocaleString();

					// Devolviendo un array de texto formateado para cada columna, con colores y alineación
					return [
						c(fileTypeColor, fileType),
						c('cyan', file.padEnd(maxLength)),
						c('green', fileSize.padStart(12)),
						c('yellow', fileModified)
					];
				})
				.catch(() => {
					// Devolviendo una fila de error si no se pudo obtener la información del archivo
					return [
						c('red', 'E'),
						c('cyan', file.padEnd(maxLength)),
						c('red', 'ERROR'.padStart(12)),
						c('red', 'Acceso denegado')
					];
				});
		})
	);

	// Imprimiendo cada entrada formateada en consola
	for (const entry of entries) {
		console.log(...entry);
	}

	console.groupEnd();
}
