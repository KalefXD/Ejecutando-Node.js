import z from 'zod';
import noteModel from '../models/note.js';
import { createNoteSchema, updateNoteSchema, updateNoteSchemaPartial } from '../notas.schema.js';

export default class notesController {
	static async getAll(req, res) {
		const { tags } = req.query;

		const notes = await noteModel.getAll({ tags });

		res.json(notes);
	}

	static async get(req, res) {
		const note = await noteModel.get(req.params.id);
		if (!note) return res.status(404).json({ error: 'Nota no encontrada' });

		res.json(note);
	}

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

		const newNote = await noteModel.add(result.data);

		res.status(201).json(newNote);
	}

	static async delete(req, res) {
		const note = await noteModel.get(req.params.id);
		if (!note) return res.status(404).json({ error: 'Nota no encontrada' });

		await noteModel.delete(req.params.id);
		res.json({ message: 'Nota eliminada' });
	}

	// PUT /notes/:id - Actualiza una nota por completo (todos los campos son obligatorios)
	static async replace(req, res) {
		const note = await noteModel.get(req.params.id);
		if (!note) return res.status(404).json({ error: 'Nota no encontrada' });

		const result = updateNoteSchema.safeParse(req.body);
		if (!result.success) {
			return res.status(400).json({
				error: 'Datos de entrada inválidos',
				details: z.treeifyError(result.error)
			});
		}

		const newNote = await noteModel.replace(req.params.id, result.data);
		res.json(newNote);
	}

	// PATCH /notes/:id - Actualiza una nota parcialmente (solo los campos enviados)
	static async update(req, res) {
		const note = await noteModel.get(req.params.id);
		if (!note) return res.status(404).json({ error: 'Nota no encontrada' });

		const result = updateNoteSchemaPartial.safeParse(req.body);
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