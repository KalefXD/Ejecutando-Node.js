const notes = [];

export class noteModel {
	static async getAll() {
		return notes.map(note => ({ ...note }));
	}

	static async get(id) {
		const note = notes.find(note => note.id === id);
		return note ? { ...note } : null;
	}

	static async add(note) {
		notes.push({ ...note });
		return { ...note };
	}

	static async update(id, data) {
		const index = notes.findIndex(note => note.id === id);
		if (index === -1) return null;

		notes[index] = { ...notes[index], ...data, id };
		return { ...notes[index] };
	}

	static async delete(id) {
		const index = notes.findIndex(note => note.id === id);
		if (index === -1) return null;

		const [deletedNote] = notes.splice(index, 1);
		return { ...deletedNote };
	}
}