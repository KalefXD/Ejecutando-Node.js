/**
 * Listar el contenido de un directorio.
 *
 * En este script se lee un directorio con `fs.readdir()`, se recorren sus entradas
 * y se consultan los metadatos de cada una con `fs.stat()`.
 * El lector verá cómo trabajar con rutas, manejar errores por entrada
 * y formatear una salida tabular en la consola.
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { styleText as c } from 'node:util';

// Definiendo la carpeta a listar (directorio actual por defecto)
const folder = process.argv[2] ?? '.';

/**
 * Apuntes:
 * `process.argv` es un arreglo con los argumentos de la línea de comandos.
 * Los primeros dos elementos son la ruta de Node.js y la del script actual.
 * El índice 2 en adelante contiene los argumentos del usuario.
 *
 * `process` es un objeto global exclusivo de Node.js que no existe en los navegadores.
 * No necesita importarse; está disponible en cualquier parte del código.
 */

// Mostrando mensaje de uso si no se pasa un argumento
if (!process.argv[2]) console.log(
	c('red', 'Uso: node main.js <carpeta>'),
	c('green', '[opcional: directorio actual]'),
	'\nDescripción: Lista el contenido de un directorio.',
	c('yellow', '\nEjemplo: node main.js carpeta\n')
);

// Leyendo el contenido del directorio
fs.readdir(folder)
	.then(async files => {
		// Mostrando encabezado con la ruta absoluta del directorio
		console.group(
			c('magenta', 'Contenido del directorio:'),
			c('yellow', path.resolve(folder))
		);

		// Informando y saliendo si el directorio está vacío
		if (files.length === 0) {
			console.groupEnd();
			console.log(c('cyan', 'El directorio está vacío.'));
			process.exit(0);
		}

		// Encontrando el ancho máximo de los nombres para alinear la salida en consola
		const maxLength = Math.max(...files.map(f => f.length));

		for (const file of files) {
			// Uniendo la ruta del directorio con el nombre del archivo
			const fullPath = path.join(folder, file);

			/**
			 * Apuntes:
			 * `path.join()` construye una ruta combinando segmentos con el separador del sistema operativo.
			 * Es preferible a concatenar strings con `/` o `\`, ya que funciona igual en Windows, macOS y Linux.
			 */

			// Obteniendo estadísticas del archivo o directorio
			let stats;
			try {
				stats = await fs.stat(fullPath);
			} catch {
				// Mostrando error y continuando con el siguiente si no se puede acceder al archivo
				console.log(
					c('red', 'E'),
					c('cyan', file.padEnd(maxLength)),
					c('red', 'ERROR'.padStart(12)),
					c('red', 'Acceso denegado')
				);
				continue;
			}

			/**
			 * Apuntes:
			 * `fs.stat()` devuelve un objeto con metadatos sobre una entrada del sistema de archivos:
			 * tipo, tamaño, fechas de creación y modificación, permisos, entre otros.
			 * El objeto incluye métodos como `isFile()` e `isDirectory()` para identificar el tipo.
			 *
			 * Además de archivos y directorios, existen tipos especiales como enlaces simbólicos o sockets.
			 * Si se necesita consultar los metadatos de un enlace simbólico en lugar del archivo al que apunta,
			 * se usa `fs.lstat()`.
			 */

			// Determinando tipo, tamaño y fecha de modificación a partir de las estadísticas
			const fileType = stats.isFile() ? 'F' : stats.isDirectory() ? 'D' : 'O';
			const fileTypeColor = fileType == 'F' ? 'green' : fileType == 'D' ? 'blue' : 'red';
			const fileSize = fileType == 'F' ? (stats.size / 1024).toFixed(3) + ' KB' : '---';
			const fileModified = stats.mtime.toLocaleString();

			// Mostrando la información formateada del archivo
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
		console.error(c('red', 'Error al leer el directorio:'), err.message);
		process.exit(1);
	});
