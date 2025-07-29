import express from 'express'; // Módulo externo para crear el servidor
import cors from 'cors'; // Módulo externo para permitir solicitudes desde otros orígenes
import { env } from 'node:process';
import { styleText as c } from 'node:util';
import { createNoteSchema, updateNoteSchema } from './notes.schema.js'; // Importa los esquemas de validación

const PORT = env.PORT ?? 3000;
const HOST = env.HOST ?? 'localhost';
const app = express(); // Crea una instancia de Express

 // Array para almacenar las notas
const notes = []; // NOTA: Esto se almacenaría en una base de datos persistente en un entorno real

app.use(cors()); // Middleware para permitir solicitudes CORS
app.use(express.json()); // Middleware para parsear JSON
app.disable('x-powered-by'); // Desactiva el header X-Powered-By para mayor seguridad

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

app.listen(PORT, HOST, console.log(
	c('magenta', 'Servidor ejecutándose en:'), c('yellow', `http://${HOST}:${PORT}`),
	c('gray', '\nPresiona Ctrl+C para detener el servidor\n')
));
