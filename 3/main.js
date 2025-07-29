import { argv, exit } from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { styleText as c } from 'node:util';

const folder = argv[2] ?? '.'; // Si no se pasa un path, se usará el directorio actual

if (!argv[2]) console.log(
	c('red', 'Uso: node main.js <path>'),
	c('green', '[opcional: directorio actual]'),
	'\nDescripción: Lista el contenido de un directorio.',
	c('yellow', '\nEjemplo: node main.js ./carpeta')
);

fs.readdir(folder) // Lee el contenido del directorio
	.then(async files => {
		console.group(
			c('magenta', '\nContenido del directorio:'),
			c('yellow', path.resolve(folder))
		);

		if (files.length === 0) {
			console.log(c('cyan', 'El directorio está vacío.'));
			console.groupEnd();
			exit(0);
		}

		// Calcular el ancho máximo para alinear la salida
		const maxLength = files.reduce((max, str) => {
			return Math.max(max, str.length);
		}, 0);

		for (const file of files) {
			// Unir las rutas de forma segura
			const fullPath = path.join(folder, file);

			// Obtener estadisticas del archivo
			let stats;
			try {
				stats = await fs.stat(fullPath);
			} catch (err) {
				console.log(
					c('red', 'E'),
					c('cyan', file.padEnd(maxLength)),
					c('red', 'ERROR'.padStart(11)),
					c('red', 'No se pudo acceder al archivo')
				);
				continue;
			}

			// Obtenemos el tipo de archivo, tamaño y fecha de modificación
			const fileType = stats.isDirectory() ? 'D' : 'F';
			const fileSize = fileType === 'D' ? '---' : (stats.size / 1024).toFixed(2);
			const fileModified = stats.mtime.toLocaleString();

			console.log(
				c(fileType === 'D' ? 'blue' : 'white', fileType),
				c('cyan', file.padEnd(maxLength)),
				c('green', fileSize.padStart(8) + ' KB'),
				c('yellow', fileModified)
			);
		}

		console.groupEnd();
	})
	.catch(err => {
		console.error(c('red', 'Error al leer el directorio:'), err);
		exit(1);
	});
