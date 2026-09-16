import { Router } from 'express';
import notesController from '../controllers/notes.js';

const router = Router();

router.get('/', notesController.getAll);
router.get('/:id', notesController.get);
router.post('/', notesController.create);
router.delete('/:id', notesController.delete);
router.patch('/:id', notesController.update);

export default router;