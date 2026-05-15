/**
 * Añadir texto al final de un archivo usando promesas.
 *
 * En este script se leen los argumentos de la línea de comandos, se valida
 * que existan los datos necesarios, se resuelve la ruta del archivo, se crea
 * si no existe, se añade texto con `.then()` y `.catch()`, y al final se muestra
 * el contenido completo del archivo.
 */

import { argv, exit } from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { styleText as c } from 'node:util';

/**
 * Apuntes:
 * El módulo `node:process` permite acceder a información y controlar el proceso en ejecución.
 * El módulo `node:path` proporciona utilidades para trabajar con rutas de archivos y directorios de forma multiplataforma.
 * El submódulo `node:fs/promises` permite interactuar con el sistema de archivos utilizando promesas en lugar de callbacks.
 * 
 * Node.js añade nuevos objetos globales que no existen en los navegadores, y uno de ellos es `process`.
 * `process` también puede importarse desde `node:process`, pero no es necesario en la mayoría de los casos.
 * Por eso, en los siguientes scripts de este repositorio no se utilizará `node:process`.
 */

// Extrayendo argumentos de la línea de comandos
const [,, fileArg, textArg] = argv;

/**
 * Apuntes:
 * `argv` contiene los argumentos pasados al ejecutar el script desde la línea de comandos.
 * El índice 0 es la ruta del ejecutable de Node.js y el índice 1 es la ruta del script actual.
 * A partir del índice 2 se encuentran los argumentos personalizados que proporciona el usuario.
 *
 * Existe un método de `node:util` llamado `parseArgs` que permite manejar los argumentos de forma más estructurada.
 * En este ejemplo no se usa para mantener el script más simple.
 */

// Mostrando mensaje de uso si no se pasan los argumentos requeridos
if (!fileArg || !textArg) {
	console.error(
		c('red', 'Uso: node main.js <archivo> <texto>'),
		'\nDescripción: Añade texto a un archivo, creándolo si no existe.',
		c('yellow', '\nEjemplo: node main.js archivo.txt "Texto a añadir"')
	);
	// Terminando el proceso si faltan argumentos
	exit(1);
}

/**
 * Apuntes:
 * `exit()` termina el proceso de forma inmediata y permite especificar un código de salida.
 * `exit(0)` indica que todo terminó correctamente, mientras que `exit(1)` indica un error.
 * Por defecto, el código de salida es 0, pero esto se puede cambiar con `exitCode` de `node:process`.
 */

// Convirtiendo la ruta del archivo a una ruta absoluta
const filePath = path.resolve(fileArg);

/**
 * Apuntes:
 * `path.resolve()` convierte una ruta relativa en una ruta absoluta.
 * Esto facilita trabajar con archivos sin depender de la carpeta actual del usuario.
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

/**
 * Apuntes:
 * En `.then()` se ejecuta el código cuando la promesa se resuelve correctamente.
 * En `.catch()` se maneja el error si la operación falla.
 * También existe el método `.finally()` que se ejecuta independientemente del resultado de la promesa.
 */

// Leyendo y mostrando el contenido completo del archivo
fs.readFile(filePath, 'utf8')
	.then(data => console.log(c('magenta', 'Contenido del archivo:'), '\n' + data))
	.catch(err => console.error(c('red', 'Error al leer el archivo:'), err.message));
