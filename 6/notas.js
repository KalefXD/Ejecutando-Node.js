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
		// Intentar leer el archivo de la base de datos
		const data = await readFile(DB_PATH, 'utf-8');
		return JSON.parse(data);
	} catch (err) {
		// Devolver un array vacío si el archivo no existe o está corrupto
		if (err.code === 'ENOENT') {
			console.log('Archivo de notas no encontrado, creando base de datos vacía...');
			return [];
		}
		// Propagar el error para otros errores (permisos, JSON malformado, etc.)
		throw new Error(`Error al leer notas: ${err.message}`);
	}
}

export async function agregarNota(nota) {
	try {
		const notas = await leerNotas();

		// Crear una nueva nota con campos controlados
		const nuevaNota = { ...nota };

		// Evitar que el cliente pueda especificar su propio ID
		delete nuevaNota.id;

		// Asignar un ID único
		nuevaNota.id = crypto.randomUUID();

		// Agregar la nueva nota al array y guardar
		notas.push(nuevaNota);
		await guardarNotas(notas);

		return nuevaNota;
	} catch (err) {
		throw new Error(`Error al agregar nota: ${err.message}`);
	}
}


export async function obtenerNota(id) {
	try {
		const notas = await leerNotas();
		
		// Buscar la nota que coincida con el ID proporcionado
		const nota = notas.find(n => n.id === id);

		// Devolver null si no se encuentra
		return nota || null;
	} catch (err) {
		throw new Error(`Error al obtener nota con ID ${id}: ${err.message}`);
	}
}


export async function actualizarNota(id, cambios, reemplazar = false) {
	try {
		const notas = await leerNotas();

		// Buscar el índice de la nota a actualizar
		const idx = notas.findIndex(n => n.id === id);
		if (idx === -1) return null; // Devolver null si no existe

		const notaExistente = notas[idx];

		// Preparar los cambios sin permitir modificar el ID
		const cambiosSinId = { ...cambios };
		delete cambiosSinId.id; // No permitir cambiar el ID

		// Decidir si reemplazar completamente (PUT) o actualizar parcialmente (PATCH)
		notas[idx] = reemplazar
			? { id, ...cambiosSinId }
			: { ...notaExistente, ...cambiosSinId };

		await guardarNotas(notas);
		return notas[idx];
	} catch (err) {
		throw new Error(`Error al actualizar nota con ID ${id}: ${err.message}`);
	}
}


export async function eliminarNota(id) {
	try {
		const notas = await leerNotas();

		// Filtrar todas las notas excepto la que tiene el ID a eliminar
		const nuevas = notas.filter(n => n.id !== id);
		
		// Verificar si se eliminó alguna nota comparando las longitudes
		if (nuevas.length === notas.length) return false; // No se encontró la nota a eliminar

		await guardarNotas(nuevas);
		return true; // Eliminación exitosa
	} catch (err) {
		throw new Error(`Error al eliminar nota con ID ${id}: ${err.message}`);
	}
}
