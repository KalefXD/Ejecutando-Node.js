import { Router } from 'express';
import { notesController } from '../controllers/notas.js';

export const notesRouter = Router();

notesRouter.get('/', notesController.getAll);
notesRouter.get('/:id', notesController.get);
notesRouter.post('/', notesController.create);
notesRouter.delete('/:id', notesController.delete);
notesRouter.patch('/:id', notesController.update);
