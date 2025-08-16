import { argv, exit } from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { styleText as c } from 'node:util';

/** Nota:
 * El módulo `node:process` permite acceder a información y controlar el proceso en ejecución.
 * El módulo `node:path` proporciona utilidades para trabajar con rutas de archivos y directorios de forma multiplataforma.
 * El submódulo `node:fs/promises` permite interactuar con el sistema de archivos utilizando promesas en lugar de callbacks.
 */

// Extraer argumentos de la línea de comandos
const [,, fileArg, textArg] = argv;

/** Nota:
 * `argv` es un arreglo que contiene los argumentos pasados al ejecutar el script desde la línea de comandos.
 * El índice 0 es la ruta del ejecutable de Node.js, y el índice 1 es la ruta del script actual.
 * A partir del índice 2 se encuentran los argumentos personalizados que proporciona el usuario.
 * Existe una método de `node:util` llamada `parseArgs` que permite manejar los argumentos de forma más estructurada, pero por simplicidad no se usa aquí.
 */

// Mostrar mensaje de uso si no se pasan los argumentos requeridos
if (!fileArg || !textArg) {
	console.error(
		c('red', 'Uso: node main.js <archivo> <texto>'),
		'\nDescripción: Añade texto a un archivo, creándolo si no existe.',
		c('yellow', '\nEjemplo: node main.js archivo.txt "Texto a añadir"')
	);
	// Terminar el proceso si faltan argumentos
	exit(1);
}

/** Nota:
 * `exit` termina el proceso de forma inmediata, en el que se puede especificar un código de salida.
 * Si se usa `exit(0)` significa que el script terminó correctamente, mientras que `exit(1)` indica un error.
 * Por defecto, el código de salida es 0, pero esto se puede cambiar con `exitCode` de `node:process`.
 */

// Convertir la ruta del archivo a una ruta absoluta
const filePath = path.resolve(fileArg);

try {
    // Verificar si se tiene acceso al archivo
	await fs.access(filePath);
} catch (err) {
    // Si el archivo no existe, crearlo vacío
    console.log(c('cyan', 'El archivo no existe, se creará uno nuevo.'));

    await fs.writeFile(filePath, '')
        .catch(err => {
            console.error(c('red', 'Error al crear el archivo:'), err);
            exit(1);
        });

	// Mostrar mensaje de éxito con el nombre del archivo creado
	console.log(c('green', 'Archivo creado:'), c('yellow', path.basename(filePath)));
}

// Añadir el texto proporcionado al final del archivo
await fs.appendFile(filePath, textArg + '\n')
	.then(console.log(c('cyan', 'Texto añadido a:'), c('yellow', filePath)))
	.catch(err => console.error(c('red', 'Error al escribir en el archivo:'), err));

// Leer y mostrar el contenido completo del archivo
fs.readFile(filePath, 'utf8')
	.then(data => console.log(c('magenta', 'Contenido del archivo:'), '\n' + data))
	.catch(err => console.error(c('red', 'Error al leer el archivo:'), err));
