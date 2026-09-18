/**
 * 7. Creando una APP de notas
 * 
 * Apunte #1:
 * La dependencia Express permite crear y gestionar servidores web de forma sencilla y eficiente.
 */

import express from 'express';
import { styleText as c } from 'node:util';
import notesRouter from './routes/notes.js';

const PORT = process.env.PORT ?? 3000, HOST = process.env.HOST ?? 'localhost';

const app = express();

// Middleware para parsear automáticamente el cuerpo de las peticiones como JSON
app.use(express.json());

/**
 * Apunte #2:
 * El header "X-Powered-By: Express" revela información sobre la tecnología usada.
 * Los atacantes pueden usar esta información para exploits específicos de Express.
 * Es una buena práctica de seguridad ocultar detalles de implementación.
 */

app.disable('x-powered-by');

app.use('/api', notesRouter);

// Respondiendo con un error 404 (Not Found) si ninguna ruta anterior coincidió
app.use((req, res) => {
	res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de manejo de errores: captura cualquier error ocurrido en las rutas anteriores
app.use((err, req, res, next) => {
	console.error(c('red', 'Error:'), err.message);
 
	// Detectando específicamente un cuerpo JSON malformado enviado por el cliente
	if (err.type === 'entity.parse.failed') {
		return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
	}
 
	res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, HOST, () => {
	console.log(
		c('magenta', 'APP de Notas con Express iniciado en:'), c('yellow', `http://${HOST}:${PORT}`),
		c('gray', `\nDetén la APP con Ctrl+C o: kill ${process.pid}\n`)
	);
});
