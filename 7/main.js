import express from 'express';
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

/** Nota:
 * La dependencia `express` permite crear y gestionar servidores web de forma sencilla y eficiente.
 * La dependencia `cors` permite habilitar y controlar el acceso de recursos entre distintos orígenes en una API o servidor.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = env.PORT ?? 3000;
const HOST = env.HOST ?? 'localhost';

// Crear la aplicación de Express
const app = express();

 // Simular una base de datos en un array para almacenar las notas
const notes = [];

// Permitir solicitudes CORS con un Middleware
app.use(cors());

// Parsear los datos del cuerpo en JSON con un Middleware
app.use(express.json());

// Desactivar el header X-Powered-By para mayor seguridad
app.disable('x-powered-by');

// Obtener todas las notas
app.get('/notas', (req, res) => {
	const { tags } = req.query;
	if (tags) {
		const filterNotes = notes.filter(
			note => note.genre.some(t => t.toLowerCase() === tags.toLowerCase())
		);
		return res.json(filterNotes);
	}

	res.json(notes);
});

// Obtener una nota por ID
app.get('/notas/:id', (req, res) => {
	const note = notes.find(n => n.id === req.params.id);
	if (!note) return res.status(404).json({ error: 'Not found' });
	res.json(note);
});

// Crear nueva nota
app.post('/notas', (req, res) => {
	const result = createNoteSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({ error: z.treeifyError(result.error) })
	}

	const newNote = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
		...result.data
	}

	notes.push(newNote);
	res.status(201).json(newNote);
})

// Actualizar una nota
app.put('/notas/:id', async (req, res) => {
	const note = notes.find(n => n.id === req.params.id);
	if (!note) return res.status(404).json({ error: 'Not found' });

	delete req.body.id
	delete req.body.createdAt
	const result = updateNoteSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({ error: z.treeifyError(result.error) })
	}

	Object.assign(note, result.data);
	note.updatedAt = new Date();
	res.json(note);
});

// Actualizar parcialmente una nota
app.patch('/notas/:id', (req, res) => {
	const note = notes.find(n => n.id === req.params.id);
	if (!note) return res.status(404).json({ error: 'Not found' });

	const result = updateNoteSchemaPartial.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({ error: z.treeifyError(result.error) })
	}

	Object.assign(note, result.data);
	note.updatedAt = new Date();
	res.json(note);
});

// Eliminar una nota
app.delete('/notas/:id', (req, res) => {
	const index = notes.findIndex(n => n.id === req.params.id);
	if (index === -1) return res.status(404).json({ error: 'Not found' });

	const deleted = notes.splice(index, 1)[0];
	res.json(deleted);
});

// Ruta inexistente
app.use((req, res) => {
	res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, HOST, () => {
	console.log(
		c('magenta', 'Servidor de Notas Express iniciado en:'),
		c('yellow', `http://${HOST}:${PORT}`),
		c('cyan', '\nPunto de entrada:'), c('yellow', `/notas`),
		c('gray', `\nDetén con Ctrl+C o: kill ${pid}\n`)
	);
});
