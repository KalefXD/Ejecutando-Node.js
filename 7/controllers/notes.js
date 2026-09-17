import noteModel from '../models/note.js';
import { createNoteSchema, updateNoteSchema } from '../notas.schema.js';

export default class notesController {
	// Obtener todas las notas
	static async getAll(req, res) {
		const { tags } = req.query;
	
		const notes = await noteModel.getAll({ tags });

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
		// Validando los datos recibidos usando el esquema Zod
		const result = createNoteSchema.safeParse(req.body);

		if (!result.success) {
			// Si la validación falla, devolver error 400 con detalles específicos
			return res.status(400).json({ 
				error: 'Datos de entrada inválidos',
				details: z.treeifyError(result.error)
			});
		}

		await noteModel.add(result.data);

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
				details: z.treeifyError(result.error)
			});
		}

		const newNote = await noteModel.update(req.params.id, result.data);
		res.json(newNote);
	}
}