import { exit, stdin, stdout } from 'node:process';
import { styleText as c } from 'node:util';

// Verificar si la dependencia "zod" está instalada
const z = await import('zod')
	.then(module => {
		console.log(c('gray', 'La dependencia "zod" está instalada.'));
		return module;
	})
	.catch(() => {
		console.error(
			c('red', 'Error: La dependencia "zod" no está instalada.'),
			c('red', '\nEjecuta: npm install zod')
		);
		exit(1);
	});

/** Nota:
 * Este script utiliza una dependencia externa: `zod`. Las dependencias son paquetes de código de terceros.
 * Se gestionan con un manejador de paquetes como `npm` y se listan en un archivo `package.json`.
 * La dependencia `zod` sirve para validar y tipar datos de forma segura en JavaScript/TypeScript.
 *
 * IMPORTANTE: La verificación de instalación con `await import()` es un recurso didáctico, NO una práctica común.
 * En proyectos reales, se asume que las dependencias ya fueron instaladas con `npm install`.
 * A partir de ahora, deberás instalar las dependencias por tu cuenta antes de ejecutar los siguientes scripts.
 */

import readline from 'node:readline';

/** Nota:
 * El módulo `node:readline` permite leer y procesar entradas de texto línea por línea desde la consola o desde un flujo de datos.
 * Lo que facilita la creación de interfaces de línea de comandos (CLI) interactivas.
 * Puede leer datos desde un flujo de entrada (como `stdin` para el teclado) y escribirlos en un flujo de salida (como `stdout`).
 */

// Crear interfaz readline usando la entrada/salida estándar
const rl = readline.createInterface({
	input: stdin,
	output: stdout
});

// Función para encapsular la pregunta al usuario en una promesa
function ask(question) {
	return new Promise(resolve => rl.question(c('cyan', question), resolve));
}

// Definir esquema de validación para un objeto de usuario con Zod
const UserSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio'),
	age: z.coerce.number('La edad debe ser un número')
		.int('La edad debe ser un número entero')
		.positive('La edad debe ser un número positivo')
		.max(120, 'La edad no puede ser mayor a 120'),
	email: z.email('El correo electrónico debe ser válido'),
	isActive: z.transform(value => {
		if (value) return value.toLowerCase() === 'sí' || value.toLowerCase() === 'true';
	}).optional()
});

/** Nota:
 * Los esquemas de `zod` definen la estructura y las reglas que deben cumplir los datos.
 * `z.coerce` intenta convertir un valor al tipo esperado (ej: el string "50" al number 50) antes de validar.
 * El método `.parse()` valida los datos contra el esquema y lanza un error detallado si no cumplen las reglas.
 */

// Solicitar datos al usuario y validarlos
console.log(c('magenta', 'Por favor, ingresa los datos del usuario:'));
try {
	const name = await ask('Nombre: ');
	const age = await ask('Edad: ');
	const email = await ask('Correo electrónico: ');
	const isActive = await ask('¿Está activo? (sí/no): ');

	// Validar los datos del usuario usando el esquema definido
	const user = UserSchema.parse({ name, age, email, isActive });

	console.log(c('green', '\nDatos válidos:'), user);

} catch (err) {
	if (err instanceof z.ZodError) {
    // Capturar y mostrar errores de validación de Zod de forma estructurada
		const userErrors = z.treeifyError(err).properties;
		console.error(c('red', '\nError de validación:'), userErrors);
	} else {
		console.error(c('red', '\nError inesperado:'), err);
	}
} finally {
	// Cerrar la interfaz readline para acabar el proceso
	rl.close();
}
