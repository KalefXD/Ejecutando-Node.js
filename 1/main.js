import os from 'node:os'; // Módulo para obtener información del sistema
import { styleText } from 'node:util'; // Módulo para aplicar estilos a texto en la consola

// Mostrar un mensaje de bienvenida en la consola
global.console.log( // globalThis es el objeto global en Node.js
	styleText('yellow', '¡Hola mundo!'),
	'Bienvenido a Node.js, una plataforma para ejecutar JavaScript en el servidor.'
);

// Mostrar información del sistema operativo
console.group(styleText(['magenta', 'underline'], '\nInformación del SO:'));
[
	['Plataforma', os.platform()],
	['Nombre del SO', os.type()],
	['Nombre del host', os.hostname()],
	['Versión del SO', os.version()],
	['Release del SO', os.release()],
	['Arquitectura', os.arch()],
	['Número de núcleos', os.cpus().length],
	['Memoria libre (MB)', (os.freemem() / 1024 / 1024).toFixed(2)],
	['Memoria total (MB)', (os.totalmem() / 1024 / 1024).toFixed(2)],
	['Tiempo de actividad (h)', (os.uptime() / 3600).toFixed(2)],
	['Directorio de inicio', os.homedir()],
	['Directorio temporal', os.tmpdir()]
].forEach(([label, val]) => console.log(styleText('cyan', label + ':'), String(val)));
console.groupEnd();
