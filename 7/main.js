import express from 'express'; // Módulo externo para crear el servidor
import cors from 'cors'; // Módulo externo para permitir solicitudes desde otros orígenes
import { env } from 'node:process';
import { styleText as c } from 'node:util';
import { createNoteSchema, updateNoteSchema } from './notas.schema.js'; // Importa los esquemas de validación

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = env.PORT ?? 3000;
const HOST = env.HOST ?? 'localhost';

// Crear la instancia de Express
const app = express();

 // Similar una base de datos en un array para almacenar las notas
const notes = [];

// Permitir solicitudes CORS con un Middleware
app.use(cors());

// Parsear JSON con un Middleware
app.use(express.json());

// Desactivar el header X-Powered-By para mayor seguridad
app.disable('x-powered-by');

app.get('/api/notes', (req, res) => {
	const { tags } = req.query;
	if (tags) {
		const filterNotes = notes.filter(
			note => note.genre.some(t => t.toLowerCase() === tags.toLowerCase())
		);
		return res.json(filterNotes);
	}

	res.json(notes);
});

// Obtener una por ID
app.get('/api/notes/:id', (req, res) => {
	const note = notes.find(n => n.id === req.params.id);
	if (!note) return res.status(404).json({ error: 'Not found' });
	res.json(note);
});

app.post('/api/notes', (req, res) => {
	const result = createNoteSchema.safeParse(req.body);
	if (!result.success) {
		// Los códigos 400 Bad Request y 422 Unprocessable Entity son intercambiables a veces.
		return res.status(400).json({ error: JSON.parse(z.treeifyError(result.error)) })
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

app.patch('/api/notes/:id', (req, res) => {
	const note = notes.find(n => n.id === req.params.id);
	if (!note) return res.status(404).json({ error: 'Not found' });

	const result = updateNoteSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({ error: JSON.parse(z.treeifyError(result.error)) })
	}

	Object.assign(note, result.data); // muta directamente
	note.updatedAt = new Date();
	res.json(note);
});

app.delete('/api/notes/:id', (req, res) => {
	const index = notes.findIndex(n => n.id === req.params.id);
	if (index === -1) return res.status(404).json({ error: 'Not found' });

	const deleted = notes.splice(index, 1)[0];
	res.json(deleted);
});

app.use((req, res) => {
	res.status(404).send('Ruta no encontrada');
});

app.listen(PORT, HOST, () => {
	console.log(
		c('magenta', 'Servidor ejecutándose en:'), c('yellow', `http://${HOST}:${PORT}`),
		c('gray', '\nPresiona Ctrl+C para detener el servidor\n')
	);
});
