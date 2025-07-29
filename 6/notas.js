import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simular una base de datos con un archivo JSON
const DB_PATH = path.join(__dirname, 'notas.json');

async function guardarNotas(notas) {
  await writeFile(DB_PATH, JSON.stringify(notas, null, 2));
}

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
  nota.id = crypto.randomUUID(); // Genera un ID único
  notas.push(nota);
  await guardarNotas(notas);
  return nota;
}

export async function obtenerNota(id) {
  const notas = await leerNotas();
  return notas.find(n => n.id === id);
}

export async function actualizarNota(id, cambios, reemplazar = false) {
  const notas = await leerNotas();
  const idx = notas.findIndex(n => n.id === id);
  if (idx === -1) return null;

  notas[idx] = reemplazar
    ? { id, ...cambios }
    : { ...notas[idx], ...cambios };

  await guardarNotas(notas);
  return notas[idx];
}

export async function eliminarNota(id) {
  const notas = await leerNotas();
  const nuevas = notas.filter(n => n.id !== id);
  if (nuevas.length === notas.length) return false;
  await guardarNotas(nuevas);
  return true;
}
