import z from 'zod';

z.config(z.locales.es()); // Traduce los mensajes de errores al español

export const noteBaseSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  tags: z.array(z.string().min(1)).default([]),
  isArchived: z.boolean(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

// Crear una nota
export const createNoteSchema = noteBaseSchema;

// Actualizar una nota (parcial, útil para PATCH)
export const updateNoteSchema = noteBaseSchema.partial();

// Nota completa con metadatos
export const noteSchema = noteBaseSchema.extend({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Lista de notas
export const notesArraySchema = z.array(noteSchema);
