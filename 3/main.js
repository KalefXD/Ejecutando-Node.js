import { argv, exit } from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { styleText as c } from 'node:util';

// Definir la carpeta a listar (directorio actual por defecto)
const folder = argv[2] ?? '.';

// Mostrar mensaje de uso si no se pasa un argumento
if (!argv[2]) console.log(
	c('red', 'Uso: node main.js <carpeta>'),
	c('green', '[opcional: directorio actual]'),
	'\nDescripción: Lista el contenido de un directorio.',
	c('yellow', '\nEjemplo: node main.js carpeta\n')
);

// Leer el contenido del directorio
fs.readdir(folder)
	.then(async files => {
		// Mostrar encabezado con la ruta absoluta del directorio
		console.group(
			c('magenta', 'Contenido del directorio:'),
			c('yellow', path.resolve(folder))
		);

		// Si el directorio está vacío, informar y salir
		if (files.length === 0) {
			console.groupEnd();
			console.log(c('cyan', 'El directorio está vacío.'));
			exit(0);
		}

		// Calcular el ancho máximo de los nombres para alinear la salida en la consola
		const maxLength = files.reduce((max, str) => Math.max(max, str.length), 0);

		for (const file of files) {
			// Unir la ruta del directorio con el nombre del archivo
			const fullPath = path.join(folder, file);

			// Obtener estadísticas del archivo o directorio
			let stats;
			try {
				stats = await fs.stat(fullPath);
			} catch (err) {
				// Si no se puede acceder al archivo, mostrar error y continuar con el siguiente
				console.log(
					c('red', 'E'),
					c('cyan', file.padEnd(maxLength)),
					c('red', 'ERROR'.padStart(12)),
					c('red', 'No se pudo acceder al archivo')
				);
				continue;
			}

			// Determinar tipo, tamaño y fecha de modificación a partir de las estadísticas
			const fileType = stats.isFile() ? 'F' : stats.isDirectory() ? 'D' : 'O';
			const fileTypeColor = fileType == 'F' ? 'green' : fileType == 'D' ? 'blue' : 'red';
			const fileSize = fileType == 'F' ? (stats.size / 1024).toFixed(3) + ' KB' : '---';
			const fileModified = stats.mtime.toLocaleString();

			// Mostrar la información formateada del archivo
			console.log(
				c(fileTypeColor, fileType),
				c('cyan', file.padEnd(maxLength)),
				c('green', fileSize.padStart(12)),
				c('yellow', fileModified)
			);
		}

		console.groupEnd();
	})
	.catch(err => {
		console.error(c('red', 'Error al leer el directorio:'), err);
		exit(1);
	});

/** Nota:
 * `fs.stat()` devuelve un objeto `stats` con metadatos sobre un archivo o directorio (como tamaño, tipo, fecha de modificación, etc.).
 * Además de archivos y directorios, existen tipos especiales como enlaces simbólicos, sockets, etc.
 * Para obtener los metadatos de un enlace simbólico (en lugar del archivo al que apunta), se utiliza `fs.lstat()`.
 */
