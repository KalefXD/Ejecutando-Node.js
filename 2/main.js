import { argv, exit } from 'node:process'; // Proporciona información y control sobre el proceso actual de Node.js
import path from 'node:path'; // Proporciona utilidades para trabajar con rutas de archivos y directorios
import fs from 'node:fs/promises'; // Permite trabajar con el sistema de archivos
import { styleText as c } from 'node:util';

// Extraer los argumentos de la línea de comandos
const [,, fileArg, textArg] = argv; // `argv[0]` Path del ejecutable de Node.js; `argv[1]` Path del script actual

// Validar de argumentos
if (!fileArg || !textArg) {
	console.error(
		c('red', 'Uso: node main.js <archivo> <texto>'),
		'\nDescripción: Añade texto a un archivo, creándolo si no existe.',
		c('yellow', '\nEjemplo: node main.js archivo.txt "Texto a añadir"')
	);
	exit(1); // Termina el proceso. Código 1 = error; código 0 = éxito
}

const filePath = path.resolve(fileArg); // Convierte a ruta absoluta

/** NOTA:
 * `fs/promises` usa promesas, permite usar `async/await` para manejar operaciones asíncronas.
 * `fs` usa callbacks, lo que puede complicar el código con "callback hell".
 * `fs/promises` es recomendado para código moderno y asíncrono.
 */
try {
	await fs.access(filePath); // Verifica si podemos acceder al archivo
} catch (err) { // Si falla, el archivo no existe y lo crea vacío
	await fs.writeFile(filePath, '') // Crea el archivo vacío
		.catch(err => {
			console.error(c('red', 'Error al crear el archivo:'), err);
			exit(1);
		});

	console.log(
		c('cyan', 'Se ha creado el archivo:'),
		c('yellow', path.basename(filePath)) // Muestra solo el nombre del archivo
	);
}

await fs.appendFile(filePath, textArg + '\n') // Añade el texto al final del archivo
	.then(console.log(c('cyan', 'Texto añadido a:'), c('yellow', filePath)))
	.catch(err => console.error(c('red', 'Error al escribir en el archivo:'), err));

fs.readFile(filePath, 'utf8') // Lee el contenido del archivo
	.then(data => console.log(c('magenta', 'Contenido del archivo:'), '\n' + data))
	.catch(err => console.error(c('red', 'Error al leer el archivo:'), err));
