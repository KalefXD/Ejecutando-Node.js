import fs from 'node:fs/promises';
import path from 'node:path';

// Simulando una base de datos con un archivo JSON en la misma carpeta del script
const DB_PATH = path.join(import.meta.dirname, 'notas.json');

// Función de carga inicial: intenta leer el archivo, si no existe lo crea vacío
async function loadNotes() {
	try {
		const content = await fs.readFile(DB_PATH, 'utf-8');
		return JSON.parse(content);
	} catch {
		await fs.writeFile(DB_PATH, '[]', 'utf-8');
		return [];
	}
}

// Función interna para guardar el arreglo de notas en el archivo JSON
async function saveNotes(notes) {
	await fs.writeFile(DB_PATH, JSON.stringify(notes, null, 2), 'utf-8');
}

// Exportando funciones para las operaciones CRUD para las notas:
export async function getListNotes() {
	return loadNotes();
}
 
export async function getNote(id) {
	const notes = await loadNotes();
	return notes.find(n => n.id === id) ?? null;
}
 
export async function addNote(data) {
	const notes = await loadNotes();
	const note = {
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
		...data
	};
	notes.push(note);
	await saveNotes(notes);
	return note;
}

export async function replaceNote(id, data) {
	const notes = await loadNotes();
	const index = notes.findIndex(n => n.id === id);
	if (index === -1) return null;
	// Conservando id y createdAt y reemplazando todo lo demás
	notes[index] = { id, createdAt: notes[index].createdAt, ...data };
	await saveNotes(notes);
	return notes[index];
}

export async function updateNote(id, data) {
	const notes = await loadNotes();
	const index = notes.findIndex(n => n.id === id);
	if (index === -1) return null;
	notes[index] = { ...notes[index], ...data, id };
	await saveNotes(notes);
	return notes[index];
}
 
export async function deleteNote(id) {
	const notes = await loadNotes();
	const index = notes.findIndex(n => n.id === id);
	if (index === -1) return null;
	const [deleted] = notes.splice(index, 1);
	await saveNotes(notes);
	return deleted;
}
