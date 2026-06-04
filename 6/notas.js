import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Simulando una base de datos con un archivo JSON en la misma carpeta del script
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'notas.json');

// Función interna para guardar el arreglo de notas en el archivo JSON
async function saveNotes(notes) {
	await writeFile(DB_PATH, JSON.stringify(notes, null, 2));
}

// Exportando funciones para las operaciones CRUD sobre las notas
export async function getNotes() {
	try {
		// Intentando leer el archivo de la base de datos
		const data = await readFile(DB_PATH, 'utf-8');
		return JSON.parse(data);
	} catch (err) {
		// Devolviendo un array vacío si el archivo no existe o está corrupto
		if (err.code === 'ENOENT') {
			console.log('Archivo de notas no encontrado, creando base de datos vacía...');
			await saveNotes([]);
			return [];
		}
		// Propagando el error para otros errores (permisos, JSON malformado, etc.)
		throw new Error(`Error al leer notas: ${err.message}`);
	}
}

export async function addNote(note) {
	try {
		const notes = await readNotes();

		// Creando una nueva nota con campos controlados
		const newNote = { ...note };

		// Evitando que el cliente pueda especificar su propio ID
		delete newNote.id;

		// Asignando un ID único
		newNote.id = crypto.randomUUID();

		// Agregando la nueva nota al array y guardar
		notes.push(newNote);
		await saveNotes(notes);

		return newNote;
	} catch (err) {
		throw new Error(`Error al agregar nota: ${err.message}`);
	}
}


export async function getNote(id) {
	try {
		const notes = await readNotes();

		// Buscando la nota que coincida con el ID proporcionado
		const note = notes.find(n => n.id === id);

		// Devolviendo null si no se encuentra
		return note || null;
	} catch (err) {
		throw new Error(`Error al obtener nota con ID ${id}: ${err.message}`);
	}
}


export async function updateNote(id, changes, replace = false) {
	try {
		const notes = await readNotes();

		// Buscando el índice de la nota a actualizar
		const idx = notes.findIndex(n => n.id === id);
		if (idx === -1) return null; // Devolviendo null si no existe

		const existingNote = notes[idx];

		// Preparando los cambios sin permitir modificar el ID
		const changesWithoutId = { ...changes };
		delete changesWithoutId.id; // No permitir cambiar el ID

		// Decidiendo si reemplazar completamente (PUT) o actualizar parcialmente (PATCH)
		notes[idx] = replace
			? { id, ...changesWithoutId }
			: { ...existingNote, ...changesWithoutId };

		await saveNotes(notes);
		return notes[idx];
	} catch (err) {
		throw new Error(`Error al actualizar nota con ID ${id}: ${err.message}`);
	}
}


export async function deleteNote(id) {
	try {
		const notes = await readNotes();

		// Filtrar todas las notas excepto la que tiene el ID a eliminar
		const updatedNotes = notes.filter(n => n.id !== id);

		// Verificar si se eliminó alguna nota comparando las longitudes
		if (updatedNotes.length === notes.length) return false; // No se encontró la nota a eliminar

		await saveNotes(updatedNotes);
		return true; // Eliminación exitosa
	} catch (err) {
		throw new Error(`Error al eliminar nota con ID ${id}: ${err.message}`);
	}
}
