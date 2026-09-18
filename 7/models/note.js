const notes = [];

export default class noteModel {
	static async getAll({ tags } = {}) {
		if (tags) {
			return notes.filter(note =>
				note.tags && note.tags.some(tag => tag.toLowerCase() === tags.toLowerCase())
			);
		}

		return notes.map(note => ({ ...note }));
	}

	static async get(id) {
		const note = notes.find(note => note.id === id);
		return note ? { ...note } : null;
	}

	static async add(data) {
		const newNote = {
			id: crypto.randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date(),
			...data
		};

		notes.push({ ...newNote });
		return { ...newNote };
	}

	// Actualiza una nota combinando (merge) los campos enviados sobre los que ya tenía
	static async update(id, data) {
		const index = notes.findIndex(note => note.id === id);
		if (index === -1) return null;

		delete data.id; delete data.createdAt;
		const newNote = Object.assign(notes[index], data, {
			updatedAt: new Date()
		});

		notes[index] = { ...newNote };
		return { ...newNote };
	}

	// Reemplaza una nota por completo, conservando su id y fecha de creación original
	static async replace(id, data) {
		const index = notes.findIndex(note => note.id === id);
		if (index === -1) return null;

		delete data.id; delete data.createdAt;
		const replacedNote = {
			...data,
			updatedAt: new Date()
		};

		notes[index] = replacedNote;
		return { ...replacedNote };
	}

	static async delete(id) {
		const index = notes.findIndex(note => note.id === id);
		if (index === -1) return null;

		const [deletedNote] = notes.splice(index, 1);
		return { ...deletedNote };
	}
}