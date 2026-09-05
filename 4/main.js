/**
 * 4. Validando datos con una dependencia
 * 
 * Apunte #1:
 * El módulo `node:readline` permite leer y procesar entradas de texto línea por línea desde la consola o desde un flujo de datos.
 * Esto facilita la creación de interfaces de línea de comandos (CLI) interactivas.
 * Puede leer datos desde un flujo de entrada (como `stdin` para el teclado) y escribirlos en un flujo de salida (como `stdout`).
 */

import readline from 'node:readline';
import { styleText as c } from 'node:util';

/**
 * Apunte #2:
 * NPM (Node Package Manager) es el gestor de paquetes de Node.js (`npm`), y también
 * el nombre del registro público donde se publican paquetes (https://www.npmjs.com/).
 * Un paquete es un conjunto de código que puede reutilizarse en un proyecto.
 * Una dependencia es un paquete externo que el proyecto puede necesitar para funcionar.
 * Sus dependencias directas se declaran en el archivo `package.json` y pueden gestionarse mediante `npm`.
 * `npm` es una herramienta de línea de comandos que instala por defecto Node.js y permite instalar, actualizar y gestionar dependencias,
 * así como ejecutar líneas de comandos definidas en el `package.json`. Existen alternativas a `npm` como `pnpm` o `yarn`.
 * `package.json` es el archivo de configuración y metadatos principal de un proyecto Node.js.
 * Contiene información del proyecto, sus dependencias y los scripts que se pueden ejecutar con `npm`.
 * 
 * `npm install` instala las dependencias declaradas en el `package.json` y sus dependencias
 * transitivas dentro de la carpeta `node_modules`, creándola si no existe.
 * También genera o actualiza `package-lock.json`, que registra las versiones exactas y las resoluciones
 * de las dependencias instaladas, permitiendo reproducir instalaciones de forma más consistente.
 *
 * La dependencia Zod permite validar y tipar datos en tiempo de ejecución de forma segura en JavaScript y TypeScript.
 *
 * La verificación de instalación con `await import()` de aquí es un recurso didáctico, no una práctica común.
 * En proyectos reales, se asume que las dependencias del `package.json` ya fueron instaladas con `npm install`.
 * A partir de ahora, deberás instalarlas por tu cuenta antes de ejecutar los scripts siguientes.
 */

// Verificando si la dependencia "zod" está instalada
const z = await import('zod')
	.then(module => {
		console.log(c('gray', 'La dependencia "zod" está instalada.'));
		return module;
	})
	.catch(() => {
		console.error(
			c('red', 'Error: La dependencia "zod" no está instalada.'),
			'\nInfo: Este script necesita la dependencia "zod" para validar datos',
			c('red', '\nEjecuta: npm install zod')
		);
		process.exit(1);
	});

// Creando una interfaz readline usando la entrada/salida estándar
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Función para encapsular la pregunta al usuario en una promesa
function ask(question) {
	return new Promise(resolve => rl.question(c('cyan', question), resolve));
}

/**
 * Apunte #3:
 * Los esquemas de Zod definen la estructura y las reglas que deben cumplir los datos.
 * `z.coerce` intenta convertir un valor al tipo esperado (ej: el string "50" al number `50`) antes de validar.
 */

// Definiendo esquema de validación para un objeto de usuario con Zod
const UserSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio'),
	age: z.coerce.number('La edad debe ser un número')
		.int('La edad debe ser un número entero')
		.positive('La edad debe ser un número positivo')
		.max(120, 'La edad no puede ser mayor a 120'),
	email: z.email('El correo electrónico debe ser válido'),
	isActive: z.string().transform(value => 
		['sí', 'si', 'true', '1'].includes(value.toLowerCase())
	).optional()
});

// Compilando el esquema para optimizar la validación
const compiledUserSchema = z.compile(UserSchema);

// Solicitando datos al usuario y validándolos con el esquema definido
console.log(c('magenta', 'Por favor, ingresa los datos del usuario:'));

try {
	const name = await ask('Nombre: ');
	const age = await ask('Edad: ');
	const email = await ask('Correo electrónico: ');
	const isActive = await ask('¿Está activo? (sí/no): ');

	// Validando los datos del usuario usando el esquema definido
	const user = compiledUserSchema.parse({ name, age, email, isActive });
	console.log(c('green', '\nDatos válidos:'), user);

} catch (err) {
	if (err instanceof z.ZodError) {
		// Capturando y mostrando errores de validación de Zod de forma estructurada
		const userErrors = z.treeifyError(err).properties;
		console.error(c('red', '\nError de validación:'), userErrors);
	} else {
		console.error(c('red', '\nError inesperado:'), err);
	}
} finally {
	// Cerrando la interfaz readline para acabar el proceso
	rl.close();
}
