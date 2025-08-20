import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Simular una base de datos con un archivo JSON en la misma carpeta del script
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'notas.json');

// Función interna para guardar el arreglo de notas en el archivo JSON
async function guardarNotas(notas) {
	await writeFile(DB_PATH, JSON.stringify(notas, null, 2));
}

// Exportar funciones para las operaciones CRUD (Create, Read, Update, Delete) sobre las notas.
export async function leerNotas() {
	try {
		const data = await readFile(DB_PATH, 'utf-8');
		return JSON.parse(data);
	} catch {
		return [];
	}
}

export async function agregarNota(nota) {
	const notas = await leerNotas();
	// Asignar un id único a la nota usando crypto.randomUUID()
	const nuevaNota = { ...nota };
	// Si el usuario intenta enviar un id, ignorarlo
	delete nuevaNota.id;
	nuevaNota.id = crypto.randomUUID();
	notas.push(nuevaNota);
	await guardarNotas(notas);
	return nuevaNota;
}


export async function obtenerNota(id) {
	const notas = await leerNotas();
	// Buscar la nota por id
	return notas.find(n => n.id === id);
}


export async function actualizarNota(id, cambios, reemplazar = false) {
	const notas = await leerNotas();
	const idx = notas.findIndex(n => n.id === id);
	if (idx === -1) return null; // La nota no existe

	const notaExistente = notas[idx];
	// No permitir modificar el id
	const cambiosSinId = { ...cambios };
	delete cambiosSinId.id;
	// Reemplazar toda la nota con PUT o actualizar los campos indicados con PATCH
	notas[idx] = reemplazar
		? { id, ...cambiosSinId }
		: { ...notaExistente, ...cambiosSinId };

	await guardarNotas(notas);
	return notas[idx];
}


export async function eliminarNota(id) {
	const notas = await leerNotas();
	const nuevas = notas.filter(n => n.id !== id);
	// Si la longitud no cambió, la nota no se encontró
	if (nuevas.length === notas.length) return false;
	await guardarNotas(nuevas);
	return true;
}
