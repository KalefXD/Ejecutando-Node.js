import { noteModel } from '../models/nota.js';

export class notasController {
	// Obtener todas las notas
	static async getAll(req, res) {
		const notes = await noteModel.getAll();

		const { tags } = req.query;

		// Aplicando filtro por etiquetas si se especifica una
		if (tags) {
			const notasFiltradas = notes.filter(note =>
				note.tags && note.tags.some(tag => tag.toLowerCase() === tags.toLowerCase())
			);
			return res.json(notasFiltradas);
		}

		// Devolviendo todas las notas si no hay filtros
		res.json(notes);
	}

	// Obtener una nota por ID
	static async get(req, res) {
		const note = await noteModel.get(req.params.id);
		if (!note) return res.status(404).json({ error: 'Nota no encontrada' });

		res.json(note);
	}

	// Crear nueva nota
	static async create(req, res) {
		const notes = await noteModel.getAll();

		// Validando los datos recibidos usando el esquema Zod
		const result = createNoteSchema.safeParse(req.body);

		if (!result.success) {
			// Si la validación falla, devolver error 400 con detalles específicos
			return res.status(400).json({ 
				error: 'Datos de entrada inválidos',
				detalles: z.treeifyError(result.error)
			});
		}

		// Creando nueva nota con los datos validados y metadatos automáticos
		const newNote = {
			id: crypto.randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date(),
			...result.data // Spread de los datos validados
		};

		// Agregando a la "base de datos" en memoria
		await noteModel.add(newNote);

		res.status(201).json(newNote);
	}

	static async delete(req, res) {
		const note = await noteModel.get(req.params.id);
		if (!note) return res.status(404).json({ error: 'Nota no encontrada' });

		await noteModel.delete(req.params.id);
		res.json({ message: 'Nota eliminada' });
	}

	static async update(req, res) {
		const note = await noteModel.get(req.params.id);
		if (!note) return res.status(404).json({ error: 'Nota no encontrada' });

		const result = updateNoteSchema.safeParse(req.body);
		if (!result.success) {
			return res.status(400).json({
				error: 'Datos de entrada inválidos',
				detalles: z.treeifyError(result.error)
			});
		}

		const newNote = Object.assign(note, result.data, {
			updatedAt: new Date()
		});

		await noteModel.update(req.params.id, newNote);
		res.json(newNote);
	}
}