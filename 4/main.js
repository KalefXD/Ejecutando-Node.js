import { exit, stdin, stdout } from 'node:process';
import { styleText as c } from 'node:util';

/** NOTA:
 * Normalmente, debes tener las dependencias instaladas antes de ejecutar un código.
 * Esta practica no es común en un entorno de producción ni recomendable.
 * Aquí se hace para demostrar cómo manejar la ausencia de una dependencia.
 * Consejo: Instala las dependencias necesarias antes de ejecutar un código desde ahora.
 */
// Verificar si la dependencia zod está instalada
const z = await import('zod') // Módulo externo que permite validar datos de forma sencilla
	.then(module => {
		console.log(c('gray', 'La dependencia "zod" está instalada.'));
		return module;
	})
	.catch(() => {
		console.error(
			c('red', 'Error: La dependencia "zod" no está instalada.'),
			c('red', '\nEjecuta: npm install zod'),
			c('redBright', '\nTarea: Investiga sobre las dependencias en Node.js.')
		);
		exit(1);
	});

import readline from 'node:readline'; // Permite leer líneas de entrada desde la consola

// Configurar readline para entrada/salida estándar
const rl = readline.createInterface({
	input: stdin, // Entrada estándar (teclado)
	output: stdout // Salida estándar (pantalla)
});

// Función para hacer preguntas al usuario
function ask(question) { // Retorna una promesa que se resuelve con la respuesta del usuario
	return new Promise(resolve => rl.question(c('cyan', question), resolve));
}

// Definir el esquema de validación con Zod
const UserSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio'),
	age: z.coerce.number('La edad debe ser un número')  // Conversión de string a número
		.int('La edad debe ser un número entero')
		.positive('La edad debe ser un número positivo')
		.max(120, 'La edad no puede ser mayor a 120'),
	email: z.email('El correo electrónico debe ser válido'),
	isActive: z.transform(value => { // Convertir a booleano
		if (value) return value.toLowerCase() === 'sí' || value.toLowerCase() === 'true';
	}).optional(), // Campo opcional
});

console.log(c('magenta', 'Por favor, ingresa los datos del usuario:'));
try {
	const name = await ask('Nombre: ');
	const age = await ask('Edad: ');
	const email = await ask('Correo electrónico: ');
	const isActive = await ask('¿Está activo? (sí/no): ');

	// Si la validación es exitosa, mostrar los datos
	const user = UserSchema.parse({ name, age, email, isActive });
	console.log(c('green', '\nDatos válidos:'), user);
} catch (err) {
	if (err instanceof z.ZodError) {
		const userErrors = z.treeifyError(err).properties;
		console.error(c('red', '\nError de validación:'), userErrors);
	} else {
		console.error(c('red', 'Error inesperado:'), err);
	}
} finally {
	rl.close();
}
