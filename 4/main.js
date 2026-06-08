/**
 * 4. Validando datos con una dependencia
 * 
 * En este script se verifica la instalación de Zod y se validan datos de usuario con sus esquemas.
 * Se crea una pequeña CLI interactiva con `node:readline` que solicita datos al usuario
 * y los valida contra un esquema definido con Zod.
 * El lector verá cómo gestionar paquetes externos, definir esquemas de validación,
 * leer entradas desde la consola y manejar errores estructurados.
 */

import readline from 'node:readline';
import { styleText as c } from 'node:util';

/**
 * Apunte #1:
 * El módulo `node:readline` permite leer y procesar entradas de texto línea por línea desde la consola o desde un flujo de datos.
 * Esto facilita la creación de interfaces de línea de comandos (CLI) interactivas.
 * Puede leer datos desde un flujo de entrada (como `stdin` para el teclado) y escribirlos en un flujo de salida (como `stdout`).
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
			'\nInfo: Este script requiere la dependencia "zod" para validar datos',
			c('red', '\nEjecuta: npm install zod')
		);
		process.exit(1);
	});

/**
 * Apunte #2:
 * NPM (Node Package Manager) es un registro público de dependencias para JavaScript (https://www.npmjs.com/).
 * Las dependencias son paquetes de código abierto de terceros que se puede gestionar con `npm` y se listan en el archivo `package.json`.
 * `package.json` es el archivo de configuración fundamental de cualquier proyecto de Node.js.
 * `npm` es una utilidad de CLI que instala por defecto Node.js y permite instalar, actualizar y gestionar dependencias,
 * así como ejecutar scripts definidos en `package.json`. Existen algunas alternativas a `npm` como `yarn` o `pnpm`.
 * 
 * Node.js surgió antes de que existiera un estándar oficial de módulos para JavaScript.
 * ES Modules (ESM) es el sistema de módulos estándar de JavaScript (que usa `import` y `export`).
 * CommonJS (CJS) es el sistema de módulos que Node.js utilizaba (que usa `require()` y `module.exports`).
 * 
 * Ejecutar `npm install` instalará las dependencias listadas en `package.json` y sus versiones especificadas,
 * en la carpeta `node_modules`, creándola si aún no existe. También creará un archivo `package-lock.json`
 * para bloquear las versiones exactas de las dependencias instaladas.
 *
 * La dependencia Zod sirve para validar y tipar datos de forma segura en JavaScript y TypeScript.
 *
 * Se recomienda leer la documentación de cada dependencia que aparezca en este repositorio para entender su propósito,
 * cómo usarla y sus limitaciones, ya que no habrá apuntes detallados sobre cada una de ellas en los scripts siguientes,
 * sino solo las partes relevantes para cada script, y en algunos casos ni siquiera eso.
 *
 * La verificación de instalación con `await import()` es un recurso didáctico, no una práctica común.
 * En proyectos reales, se asume que las dependencias del `package.json` ya fueron instaladas con `npm install`.
 * A partir de ahora, deberás instalarlas por tu cuenta antes de ejecutar los scripts siguientes.
 */

// Creando una interfaz readline usando la entrada/salida estándar
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Función para encapsular la pregunta al usuario en una promesa
function ask(question) {
	return new Promise(resolve => rl.question(c('cyan', question), resolve));
}

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

/**
 * Apunte #3:
 * Los esquemas de Zod definen la estructura y las reglas que deben cumplir los datos.
 * `z.coerce` intenta convertir un valor al tipo esperado (ej: el string "50" al number `50`) antes de validar.
 */

// Solicitando datos al usuario y validándolos con el esquema definido
console.log(c('magenta', 'Por favor, ingresa los datos del usuario:'));
try {
	const name = await ask('Nombre: ');
	const age = await ask('Edad: ');
	const email = await ask('Correo electrónico: ');
	const isActive = await ask('¿Está activo? (sí/no): ');

	// Validando los datos del usuario usando el esquema definido
	const user = UserSchema.parse({ name, age, email, isActive });
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
