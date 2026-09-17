/**
 * 3. Listando el contenido de una carpeta
 * 
 * Apunte #1:
 * `parseArgs` permite manejar los argumentos usando opciones y valores, en lugar de depender de la posición de los argumentos.
 * Las opciones de tipo booleano (como `--help` o `-h`) solo necesitan ser indicadas para activarse,
 * mientras que las de tipo string (como `--folder` o `-f`) requieren asignarle un valor (ej. `-f folder`).
 * Para obtener información más detallada de cada argumento, indicarle `tokens: true` permite extraer `tokens`,
 * un array de objetos que contiene el tipo, índice, nombre, valor, etc., de cada argumento.
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { parseArgs, styleText as c } from 'node:util';

// Parseando los argumentos de la línea de comandos
const { values } = parseArgs({
	options: {
		help: { type: 'boolean', short: 'h' },
		folder: { type: 'string', short: 'f' }
	}
});

// Definiendo la carpeta a listar (directorio actual por defecto)
const folder = values.folder ?? '.';

// Mostrando mensaje de uso si se solicita ayuda
if (values.help) console.log(
	c('cyan', 'Uso: node main.js -f <carpeta> [opcional: directorio actual]'),
	'\nDescripción: Lista el contenido de un directorio.\n'
);

// Leyendo el contenido del directorio
await fs.readdir(folder)
	.then(showDirFiles)
	.catch(err => {
		console.error(c('red', 'Error al leer el directorio:'), err.message);
		process.exit(1);
	});

/**
 * Apunte #2:
 * Se usa una función `async` dentro de `.then()` para poder utilizar `await`. Una función `async` siempre devuelve una Promise.
 * Si ocurre un error durante un `await`, la Promise se rechaza y el `.catch()` de la cadena puede capturarlo.
 * Sin `async`, `await` no es válido sintácticamente y `.then()` no esperaría el trabajo asíncrono realizado dentro de la función.
 */

/**
 * Muestra el contenido de un directorio en la consola.
 * @param {string[]} files 
 */
async function showDirFiles(files) {
	// Mostrando encabezado con la ruta absoluta del directorio
	console.group(
		c('magenta', 'Contenido del directorio:'),
		c('yellow', path.resolve(folder))
	);

	// Informando y saliendo si el directorio está vacío
	if (files.length === 0) return console.log(c('cyan', 'El directorio está vacío.'));

	// Encontrando el ancho máximo de los nombres para alinear la salida en consola
	const maxLength = Math.max(...files.map(f => f.length));

	// Leyendo en paralelo los metadatos de cada archivo
	const entries = await Promise.all(
		// Creando un array de promesas para cada archivo sin bloquear la ejecución
		files.map(async file => {
			// Uniendo la ruta del directorio con el nombre del archivo
			const fullPath = path.join(folder, file);

			/**
			 * Apunte #3:
			 * Para poder leer los metadatos de un enlace simbólico en lugar del archivo al que apunta, se usa `fs.lstat()`.
			 * 
			 * Un error al intentar acceder a un archivo puede deberse a permisos insuficientes,
			 * que el archivo fue eliminado mientras se leía el directorio, o que el archivo es un enlace simbólico roto.
			 */

			// Obteniendo información del archivo
			return fs.stat(fullPath)
				.then(stats => {
					// Determinando tipo, tamaño y fecha de modificación a partir de las estadísticas
					const fileType = stats.isFile() ? 'F' : stats.isDirectory() ? 'D' : 'O';
					const fileTypeColor = fileType == 'F' ? 'green' : fileType == 'D' ? 'blue' : 'red';
					const fileSize = fileType == 'F' ? (stats.size / 1024).toFixed(3) + ' KiB' : '---';
					const fileModified = stats.mtime.toLocaleString();

					// Devolviendo un array de texto formateado para cada columna, con colores y alineación
					return [
						c(fileTypeColor, fileType),
						c('cyan', file.padEnd(maxLength)),
						c('green', fileSize.padStart(14)),
						c('yellow', fileModified)
					];
				})
				.catch(() => {
					// Devolviendo una fila de error si no se pudo obtener la información del archivo
					return [
						c('red', 'E'),
						c('cyan', file.padEnd(maxLength)),
						c('red', 'ERROR'.padStart(14)),
						c('red', 'Acceso denegado')
					];
				});
		})
	);

	// Imprimiendo cada entrada formateada en consola
	for (const entry of entries) console.log(...entry);

	console.groupEnd();
}
