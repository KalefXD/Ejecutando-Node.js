/**
 * 7. Creando una APP de notas
 * 
 * Apunte #1:
 * La dependencia Express permite crear y gestionar servidores web de forma sencilla y eficiente.
 * La dependencia Cors permite habilitar y controlar CORS de manera sencilla.
 */

import express from 'express';
import cors from 'cors';
import { styleText as c } from 'node:util';
import { notasRouter } from './routes/notas.js'

const PORT = process.env.PORT ?? 3000, HOST = process.env.HOST ?? 'localhost';

const app = express();

// Middleware para parsear automáticamente el cuerpo de las peticiones como JSON
app.use(express.json());

// Middleware para habilitar CORS
app.use(cors());

/**
 * Apunte #2:
 * El header "X-Powered-By: Express" revela información sobre la tecnología usada.
 * Los atacantes pueden usar esta información para exploits específicos de Express.
 * Es una buena práctica de seguridad ocultar detalles de implementación.
 */

app.disable('x-powered-by');

app.use('/api', notasRouter);

app.listen(PORT, HOST, () => {
	const { port } = app.address();
	console.log(
		c('magenta', 'APP de Notas con Express iniciado en:'), c('yellow', `http://${HOST}:${port}`),
		c('gray', `Detén la APP con Ctrl+C o: kill ${process.pid}\n`)
	);
});
