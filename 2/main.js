/**
 * Añadir texto al final de un archivo usando promesas.
 *
 * En este script se trabaja con el sistema de archivos de Node.js a través de `fs/promises`,
 * se leen argumentos desde la línea de comandos y se encadenan promesas con `.then()` y `.catch()`.
 * El flujo muestra cómo verificar si un archivo existe, crearlo si no, añadirle contenido
 * y leerlo al final para confirmar el resultado.
 */

import { argv, exit } from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { styleText as c } from 'node:util';

/**
 * Apuntes:
 * El módulo `node:process` permite acceder a información y controlar el proceso en ejecución.
 * El módulo `node:path` proporciona utilidades para trabajar con rutas de archivos y directorios de forma multiplataforma.
 * El módulo `node:fs` permite interactuar con el sistema de archivos mediante callbacks,
 * mientras que `node:fs/promises` es su interfaz basada en promesas,
 * lo que facilita el manejo de operaciones asíncronas sin anidar callbacks.
 */

// Extrayendo argumentos de la línea de comandos
const [,, fileArg, textArg] = argv;

/**
 * Apuntes:
 * `argv` contiene los argumentos pasados al ejecutar el script desde la línea de comandos.
 * El índice 0 es la ruta del ejecutable de Node.js y el índice 1 es la ruta del script actual.
 * A partir del índice 2 se encuentran los argumentos personalizados que proporciona el usuario.
 * 
 * `process` es un objeto global exclusivo de Node.js: no existe en los navegadores y no necesita importarse.
 * En este script se importa explícitamente desde `node:process` para dejar claro su origen,
 * pero al ser un objeto global de Node.js, los scripts siguientes lo usarán directamente sin necesidad de importarlo.
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
 * `exit()` termina el proceso de forma inmediata y acepta un código de salida como argumento.
 * `exit(0)` indica que todo terminó correctamente, mientras que `exit(1)` señala un error.
 * Si se necesita establecer el código de salida sin detener el proceso de inmediato,
 * se puede usar la propiedad `process.exitCode`, que se aplica cuando el proceso termina de forma natural.
 */

// Convirtiendo la ruta del archivo a una ruta absoluta
const filePath = path.resolve(fileArg);

/**
 * Apuntes:
 * `path.resolve()` convierte una ruta relativa en una ruta absoluta tomando como referencia
 * el directorio de trabajo actual (`process.cwd()`). Esto evita comportamientos inesperados
 * cuando el script se ejecuta desde un directorio distinto al que contiene el archivo.
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
 * `.then()` recibe una función que se ejecuta cuando la promesa se resuelve correctamente.
 * `.catch()` recibe una función que se ejecuta si la promesa falla.
 * También existe `.finally()`, que se ejecuta siempre al terminar, independientemente del resultado.
 */

// Leyendo y mostrando el contenido completo del archivo
fs.readFile(filePath, 'utf8')
	.then(data => console.log(c('magenta', 'Contenido del archivo:'), '\n' + data))
	.catch(err => console.error(c('red', 'Error al leer el archivo:'), err.message));
