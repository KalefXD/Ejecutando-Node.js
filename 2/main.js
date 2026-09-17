/**
 * 2. Añadiendo texto a un archivo
 *
 * Apunte #1:
 * El módulo `node:process` permite acceder a información y controlar el proceso en ejecución.
 * El módulo `node:path` proporciona utilidades para trabajar con rutas de archivos y directorios de forma multiplataforma.
 * El módulo `node:fs` permite interactuar con el sistema de archivos mediante callbacks,
 * mientras que `node:fs/promises` es su interfaz basada en promesas, evitando el uso de callbacks anidados.
 */

import { argv, exit } from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { styleText as c } from 'node:util';

/**
 * Apunte #2:
 * `process` es un objeto de ámbito global exclusivo de Node.js: no necesita importarse y no existe en los navegadores.
 * En este script se importa explícitamente desde `node:process` para dejar claro su origen,
 * pero al ser un objeto de ámbito global de Node.js, los scripts siguientes lo usarán directamente sin necesidad de importarlo.
 */

// Extrayendo argumentos de la línea de comandos
const [,, fileArg, textArg] = argv;

// Mostrando mensaje de uso y terminando el proceso si no se pasan los argumentos requeridos
if (!fileArg || !textArg) {
	console.error(
		c('red', 'Uso: node main.js <archivo> <texto>'),
		'\nDescripción: Añade texto a un archivo, creándolo si no existe.',
		c('yellow', '\nEjemplo: node main.js archivo.txt "Texto a añadir"')
	);
	exit(1);
}

/**
 * Apunte #3:
 * `path.resolve()` convierte una ruta relativa en absoluta usando `process.cwd()` como base,
 * que es el directorio desde donde se ejecutó el comando, no necesariamente donde está el script.
 */

// Convirtiendo la ruta del archivo a una ruta absoluta
const filePath = path.resolve(fileArg);

try {
	// Verificando si se tiene acceso al archivo
	await fs.access(filePath);
} catch (err) {
	// Terminando el proceso si ocurre un error distinto a "archivo no encontrado"
	if (err.code !== 'ENOENT') {
		console.error(c('red', 'Error al acceder al archivo:'), err.message);
		exit(1);
	}

	// Creando un archivo vacío si el archivo no existe
	console.log(c('cyan', 'El archivo no existe, se creará uno nuevo...'));

	await fs.writeFile(filePath, '')
		.catch(err => {
			console.error(c('red', 'Error al crear el archivo:'), err.message);
			exit(1);
		});
	console.log(c('green', 'Archivo creado:'), c('yellow', path.basename(filePath)));
}

// Añadiendo el texto proporcionado al final del archivo
await fs.appendFile(filePath, textArg)
	.then(() => console.log(c('cyan', 'Texto añadido a:'), c('yellow', filePath)))
	.catch(err => console.error(c('red', 'Error al escribir en el archivo:'), err.message));

// Leyendo y mostrando el contenido completo del archivo
await fs.readFile(filePath, 'utf8')
	.then(data => console.log(c('magenta', 'Contenido del archivo:'), '\n' + data))
	.catch(err => console.error(c('red', 'Error al leer el archivo:'), err.message))
	.finally(() => console.log(c('green', 'Proceso completado.')));
