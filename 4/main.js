import { exit, stdin, stdout } from 'node:process';
import { styleText as c } from 'node:util';

// Verificar si la dependencia zod está instalada (NOTA: No se recomienda hacer esto)
const z = await import('zod') // Módulo externo para validación de esquemas
	.then(module => {
		console.log(c('gray', 'La dependencia "zod" está instalada.'));
		return module;
	})
	.catch(() => { // NOTA: Ten instaladas las dependencias antes de ejecutar cada código
		console.error(
			c('red', 'Error: La dependencia "zod" no está instalada.'),
			c('red', '\nEjecuta: npm install zod'),
			c('redBright', '\nTarea: Investiga sobre las dependencias en Node.js.')
		);
		exit(1);
	});

import readline from 'node:readline'; // Módulo para manejar la entrada/salida estándar

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
