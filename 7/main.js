/**
 * 7. Creando una APP de notas
 * 
 * [3 Resumenes]
 */

import cors from 'cors';
import z from 'zod';
import path from 'node:path';
import { env, pid } from 'node:process';
import { fileURLToPath } from 'node:url';
import { styleText as c } from 'node:util';
import {
	createNoteSchema,
	updateNoteSchema,
	updateNoteSchemaPartial
} from './notas.schema.js'; // Importa los esquemas de validación

/**
 * Apunte #1:
 * La dependencia `express` permite crear y gestionar servidores web de forma sencilla y eficiente.
 * La dependencia `cors` permite habilitar y controlar el acceso de recursos entre distintos orígenes en una API o servidor.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = env.PORT ?? 3000;
const HOST = env.HOST ?? 'localhost';

// Creando la instancia principal de Express
const app = express();

// Simulando una base de datos en memoria usando un array (solo para demostración)
const notas = [];

// Desactivando el header X-Powered-By para mayor seguridad
app.disable('x-powered-by');

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Middleware para parsear automáticamente el cuerpo de las peticiones como JSON
app.use(express.json());

/**
 * Apunte #2:
 * El header "X-Powered-By: Express" revela información sobre la tecnología usada.
 * Los atacantes pueden usar esta información para exploits específicos de Express.
 * Es una buena práctica de seguridad ocultar detalles de implementación.
 */

// Obtener todas las notas
app.get('/notas', (req, res) => {
	const { tags } = req.query;

	// Aplicando filtro por etiquetas si se especifica una
	if (tags) {
		const notasFiltradas = notas.filter(
			nota => nota.tags && nota.tags.some(tag =>
				tag.toLowerCase() === tags.toLowerCase()
			)
		);
		return res.json(notasFiltradas);
	}

	// Devolviendo todas las notas si no hay filtros
	res.json(notas);
});

// Obtener una nota por ID
app.get('/notas/:id', (req, res) => {
	const nota = notas.find(n => n.id === req.params.id);
	if (!nota) return res.status(404).json({ error: 'Not found' });

	res.json(nota);
});

// Crear nueva nota
app.post('/notas', (req, res) => {
	// Validando los datos recibidos usando el esquema Zod
	const result = createNoteSchema.safeParse(req.body);

	if (!result.success) {
		// Si la validación falla, devolver error 400 con detalles específicos
		return res.status(400).json({ 
			error: 'Datos de entrada inválidos',
			detalles: z.treeifyError(result.error),

		});
	}

	// Creando nueva nota con los datos validados y metadatos automáticos
	const nuevaNota = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
		...result.data // Spread de los datos validados
	};

	// Agregando a la "base de datos" en memoria
	notas.push(nuevaNota);

	// Respondiendo con estatus 201 (Created) y la nota creada
	res.status(201).json(nuevaNota);
})

// Reemplazar completamente una nota
app.put('/notas/:id', async (req, res) => {
	// Buscando la nota existente
	const nota = notas.find(n => n.id === req.params.id);
	if (!nota) {
		return res.status(404).json({ error: 'Nota no encontrada' });
	}

	// Preveniendo modificación de campos protegidos
	delete req.body.id;
	delete req.body.createdAt;

	// Validando los nuevos datos
	const result = updateNoteSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({ 
			error: 'Datos de entrada inválidos',
			detalles: z.treeifyError(result.error)
		});
	}

	// Reemplazando todos los campos manteniendo metadatos protegidos
	Object.assign(nota, {
		...result.data,
		id: nota.id, // Mantener ID original
		createdAt: nota.createdAt, // Mantener fecha de creación
		updatedAt: new Date() // Actualizar timestamp
	});

	res.json(nota);
});

// Actualizar parcialmente una nota
app.patch('/notas/:id', (req, res) => {
	// Buscando la nota existente
	const nota = notas.find(n => n.id === req.params.id);
	if (!nota) {
		return res.status(404).json({ error: 'Nota no encontrada' });
	}

	// Preveniendo modificación de campos protegidos
	delete req.body.id;
	delete req.body.createdAt;

	// Validando usando el esquema parcial (todos los campos opcionales)
	const result = updateNoteSchemaPartial.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({
			error: 'Datos de entrada inválidos',
			detalles: z.treeifyError(result.error)
		});
	}

	// Actualizando solo los campos proporcionados
	Object.assign(nota, result.data, {
		updatedAt: new Date() // Siempre actualizar timestamp
	});

	res.json(nota);
});

// Eliminar una nota
app.delete('/notas/:id', (req, res) => {
	// Buscar el índice de la nota a eliminar
	const index = notas.findIndex(n => n.id === req.params.id);

	if (index === -1)  return res.status(404).json({ error: 'Nota no encontrada' });

	// Eliminar la nota del array y obtener la nota eliminada
	const [notaEliminada] = notas.splice(index, 1);

	// Responder con la nota eliminada para confirmación
	res.json({ 
		mensaje: 'Nota eliminada exitosamente',
		nota: notaEliminada 
	});
});

// Middleware para manejar rutas no encontradas (debe ir después de todas las rutas)
app.use((req, res) => {
	res.status(404).json({ 
		error: 'Endpoint no encontrado',
		mensaje: `La ruta ${req.method} ${req.originalUrl} no existe`,
		endpointsDisponibles: [
			'GET    /notas        - Listar todas las notas',
			'GET    /notas?tags=X - Filtrar notas por etiqueta',
			'GET    /notas/:id    - Obtener nota específica',
			'POST   /notas        - Crear nueva nota',
			'PUT    /notas/:id    - Reemplazar nota completa',
			'PATCH  /notas/:id    - Actualizar nota parcialmente',
			'DELETE /notas/:id    - Eliminar una nota',
		]
	});
});

// Middleware global para manejo de errores al final
app.use((err, req, res, next) => {
	// Registrando el error para debugging
	console.error('Error no manejado:', err);

	// Respondiendo con error genérico al cliente
	res.status(500).json({
		error: 'Error interno del servidor',
		mensaje: 'Ocurrió un error inesperado. Por favor intente más tarde.'
	});
});

app.listen(PORT, HOST, () => {
	console.log(
		c('magenta', 'Servidor de Notas con Express iniciado en:'), c('yellow', `http://${HOST}:${PORT}`),
		c('cyan', '\nPunto de entrada:'), c('yellow', `/notas`),
		c('gray', `Detén el servidor con Ctrl+C o: kill ${pid}\n`)
	);
});
