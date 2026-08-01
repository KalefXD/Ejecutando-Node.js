import z from 'zod';

// Traduciendo mensajes de errores al español
z.config(z.locales.es());

// Definiendo el esquema base de una nota común
export const noteBaseSchema = z.object({
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
				.toLowerCase() // Normalizar a minúsculas para búsquedas consistentes
		).default([]), // Array vacío por defecto si no se especifica
	
	isArchived: z.boolean()
		.default(false), // Por defecto las notas no están archivadas

	priority: z.enum(['low', 'medium', 'high'])
		.default('medium') // Prioridad media por defecto
});

// Crear una nota
export const createNoteSchema = noteBaseSchema;

// Actualizar completamente una nota
export const updateNoteSchema = noteBaseSchema.required({
	isArchived: true // Hacer explícitamente requerido el campo isArchived
});

// Actualizar parcialmente una nota
export const updateNoteSchemaPartial = noteBaseSchema.partial();

// Nota completa con metadatos
export const noteSchema = noteBaseSchema.extend({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Lista de notas
export const notesArraySchema = z.array(noteSchema);
