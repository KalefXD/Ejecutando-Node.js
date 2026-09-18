import { Router } from 'express';
import notesController from '../controllers/notes.js';

const router = Router();

router.get('/', notesController.getAll);
router.get('/:id', notesController.get);
router.post('/', notesController.create);
router.put('/:id', notesController.replace);
router.patch('/:id', notesController.update);
router.delete('/:id', notesController.delete);

export default router;