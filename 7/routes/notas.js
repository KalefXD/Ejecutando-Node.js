import { Router } from 'express';
import { notasController } from '../controllers/notas.js';

export const notasRouter = Router();

notasRouter.get('/', notasController.getAll);
notasRouter.get('/:id', notasController.get);
notasRouter.post('/', notasController.create);
notasRouter.delete('/:id', notasController.delete);
notasRouter.patch('/:id', notasController.update);
