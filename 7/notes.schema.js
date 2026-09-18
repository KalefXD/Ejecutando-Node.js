import z from 'zod';

// Traduciendo los mensajes de errores al español
z.config(z.locales.es());

// Definiendo los campos comunes de una nota, sin valores por defecto para reutilizarlo
const noteFields = {
	title: z.string()
		.min(1, 'El título es obligatorio')
		.max(200, 'El título no puede exceder 200 caracteres')
		.trim(),

	content: z.string()
		.min(1, 'El contenido es obligatorio')
		.max(5000, 'El contenido no puede exceder 5000 caracteres')
		.trim(),

	tags: z.array(
		z.string()
			.min(1, 'Las etiquetas no pueden estar vacías')
			.max(50, 'Las etiquetas no pueden exceder 50 caracteres')
			.trim()
			// Normalizando las etiquetas a minúsculas para evitar duplicados por mayúsculas/minúsculas
			.toLowerCase()
	),

	isArchived: z.boolean(),

	priority: z.enum(['low', 'medium', 'high'])
};

// Crear una nota: los campos opcionales reciben un valor por defecto si no se especifican
export const createNoteSchema = z.object({
	...noteFields,
	tags: noteFields.tags.default([]), // Array vacío por defecto si no se especifica
	isArchived: noteFields.isArchived.default(false), // Por defecto las notas no están archivadas
	priority: noteFields.priority.default('medium') // Prioridad media por defecto
});

// Actualizar completamente una nota: todos los campos son obligatorios, sin valores por defecto
export const updateNoteSchema = z.object(noteFields);

// Actualizar parcialmente una nota: todos los campos son opcionales
export const updateNoteSchemaPartial = z.object(noteFields).partial();

// Nota completa con metadatos
export const noteSchema = createNoteSchema.extend({
	id: z.uuid(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Lista de notas
export const notesArraySchema = z.array(noteSchema);
