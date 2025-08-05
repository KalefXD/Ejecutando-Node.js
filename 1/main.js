// Importación de módulos nativos de Node.js
import os from 'node:os'; // Permite obtener información del sistema operativo (plataforma, memoria, CPU, red, etc.)
import { styleText as c } from 'node:util'; // Contiene funciones de utilidad para debugging, herencia, etc.

/** NOTA:
 * `global` es el objeto global en Node.js. Similar a `window` en el navegador.
 * `globalThis` es una referencia al objeto global en cualquier entorno de ejecución de JavaScript.
 * En Node.js, `global` y `globalThis` son equivalentes.
 */
// Mostrar mensaje de bienvenida en la consola
global.console.log(
	c('yellow', '¡Hola mundo!'),
	`Bienvenido a ${c('green', 'Node.js')}, un entorno de ejecución de JavaScript del lado del servidor.`,
);

/** NOTA:
 * Node.js es single-threaded por defecto, lo que limita tareas intensivas en CPU.
 * `os.cpus()` devuelve los núcleos disponibles, útil para escalar procesos,
 * creando un proceso worker por cada CPU disponible.
 */
// Mostrar información del sistema operativo
console.group(c(['magenta', 'underline'], '\nInformación del SO:'));
[
	['Plataforma', os.platform()],
	['Nombre del SO', os.type()],
	['Nombre del host', os.hostname()],
	['Versión del SO', os.version()],
	['Release del SO', os.release()],
	['Arquitectura', os.arch()],
	['Número de CPUs', os.cpus().length],
	['Memoria libre (MB)', (os.freemem() / 1024 / 1024).toFixed(2)],
	['Memoria total (MB)', (os.totalmem() / 1024 / 1024).toFixed(2)],
	['Tiempo de actividad (h)', (os.uptime() / 3600).toFixed(2)],
	['Directorio de inicio', os.homedir()],
	['Directorio temporal', os.tmpdir()]
].forEach(([label, val]) => console.log(c('cyan', label + ':'), String(val)));
console.groupEnd();

/** NOTA:
 * `os.networkInterfaces()` obtiene las IPs de las interfaces de red del sistema.
 * Permitiendo identificar la IP local (no interna) para mostrar en qué IP está
 * disponible un servidor, habilitar acceso desde otros dispositivos o realizar
 * diagnósticos según la red activa.
 * Las direcciones "internas" son para loopback (127.0.0.1); las "externas"
 * pueden ser privadas o públicas.
 */
// Mostrar información de la red
console.group(c(['magenta', 'underline'], '\nInformación de red:'));
Object.entries(os.networkInterfaces()).forEach(([name, iface]) => {
	console.group(c('cyan', 'Interfaz:'), c('yellow', name));
	iface.forEach(addr => console.log(
			c('green', 'Familia:'), addr.family,
			c('green', 'Tipo:'), addr.internal ? 'Interna' : 'Externa',
			c('green', 'Dirección IP:'), addr.address
		));
	console.groupEnd();
});
console.groupEnd();
