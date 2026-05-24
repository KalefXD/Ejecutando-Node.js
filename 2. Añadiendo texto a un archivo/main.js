/**
 * 2. Añadiendo texto a un archivo
 *
 * En este script se usa el sistema de archivos de Node para añadir un texto al final de un archivo.
 * Se leen argumentos desde la línea de comandos y se encadenan promesas con `.then()` y `.catch()`.
 * El lector verá cómo verificar si un archivo existe, crearlo si no, añadirle contenido
 * y leerlo al final para confirmar el resultado.
 */

import { argv, exit } from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { styleText as c } from 'node:util';

/**
 * Apunte #1:
 * El módulo `node:process` permite acceder a información y controlar el proceso en ejecución.
 * El módulo `node:path` proporciona utilidades para trabajar con rutas de archivos y directorios de forma multiplataforma.
 * El módulo `node:fs` permite interactuar con el sistema de archivos mediante callbacks,
 * mientras que `node:fs/promises` es su interfaz basada en promesas,
 * lo que facilita el manejo de operaciones asíncronas sin anidar callbacks.
 */

// Extrayendo argumentos de la línea de comandos
const [,, fileArg, textArg] = argv;

/**
 * Apunte #2:
 * `process` es un objeto global exclusivo de Node.js: no existe en los navegadores y no necesita importarse.
 * En este script se importa explícitamente desde `node:process` para dejar claro su origen,
 * pero al ser un objeto global de Node.js, los scripts siguientes lo usarán directamente sin necesidad de importarlo.
 *
 * Existe un método de `node:util` llamado `parseArgs` que permite manejar los argumentos de forma más estructurada.
 * En este ejemplo no se usa para mantener el script más simple.
 */

// Mostrando mensaje de uso y terminando el proceso si no se pasan los argumentos requeridos
if (!fileArg || !textArg) {
	console.error(
		c('red', 'Uso: node main.js <archivo> <texto>'),
		'\nDescripción: Añade texto a un archivo, creándolo si no existe.',
		c('yellow', '\nEjemplo: node main.js archivo.txt "Texto a añadir"')
	);
	exit(1);
}

// Convirtiendo la ruta del archivo a una ruta absoluta
const filePath = path.resolve(fileArg);

/**
 * Apunte #3:
 * `path.resolve()` convierte una ruta relativa en absoluta usando `process.cwd()` como base,
 * que es el directorio desde donde se ejecutó el comando, no necesariamente donde está el script.
 * Esto evita comportamientos inesperados cuando el script se llama desde otro directorio.
 */

try {
	// Verificando si se tiene acceso al archivo
	await fs.access(filePath);
} catch {
	// Creando un archivo vacío si el archivo no existe
	console.log(c('cyan', 'El archivo no existe, se creará uno nuevo...'));

	try {
		await fs.writeFile(filePath, '');
		console.log(c('green', 'Archivo creado:'), c('yellow', path.basename(filePath)));
	} catch (err) {
		console.error(c('red', 'Error al crear el archivo:'), err.message);
		exit(1);
	}
}

// Añadiendo el texto proporcionado al final del archivo
await fs.appendFile(filePath, textArg + '\n')
	.then(() => console.log(c('cyan', 'Texto añadido a:'), c('yellow', filePath)))
	.catch(err => console.error(c('red', 'Error al escribir en el archivo:'), err.message));

// Leyendo y mostrando el contenido completo del archivo
fs.readFile(filePath, 'utf8')
	.then(data => console.log(c('magenta', 'Contenido del archivo:'), '\n' + data))
	.catch(err => console.error(c('red', 'Error al leer el archivo:'), err.message))
	.finally(() => console.log(c('yellow', 'Proceso terminado.')));
