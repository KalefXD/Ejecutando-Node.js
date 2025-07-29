import { argv, exit } from 'node:process'; // Módulo para manejar argumentos y proceso
import path from 'node:path'; // Módulo para manejar rutas de archivos
import fs from 'node:fs/promises'; // Módulo para manejar archivos de forma asíncrona
import { styleText as c } from 'node:util';

// Destructuring: extraemos solo los argumentos que necesitamos
const [,, fileArg, textArg] = argv;

// Validación de argumentos - Una buena práctica en aplicaciones CLI
if (!fileArg || !textArg) {
	console.error(
		c('red', 'Uso: node main.js <archivo> <texto>'),
		'\nDescripción: Añade texto a un archivo, creándolo si no existe.',
		c('yellow', '\nEjemplo: node main.js archivo.txt "Texto a añadir"')
	);
	exit(1); // Termina el proceso. Código 1 = error, código 0 = éxito
}

const filePath = path.resolve(fileArg); // Convierte a ruta absoluta

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
		c('yellow', path.basename(filePath)) // Devuelve lo último del path
	);
}

await fs.appendFile(filePath, textArg + '\n') // Añade el texto al final del archivo
	.then(console.log(c('cyan', 'Texto añadido a:'), c('yellow', filePath)))
	.catch(err => console.error(c('red', 'Error al escribir en el archivo:'), err));

fs.readFile(filePath, 'utf8') // Lee el contenido del archivo
	.then(data => console.log(c('magenta', 'Contenido del archivo:'), '\n' + data))
	.catch(err => console.error(c('red', 'Error al leer el archivo:'), err));
