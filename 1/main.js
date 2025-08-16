// Importación de módulos nativos de Node.js
import os from 'node:os';
import { styleText as c } from 'node:util'; // Función para estilizar texto en la consola

/** Nota:
 * El módulo `node:os` permite obtener información y utilidades relacionadas con el sistema operativo donde corre Node.js.
 * El módulo `node:util` proporciona funciones para depuración, formateo y utilidades internas de soporte para el desarrollo.
 * Los módulos nativos son parte del núcleo de Node.js y no requieren instalación adicional.
 * El prefijo `node:` indica que son módulos nativos de Node.js, lo que mejora la claridad y evita conflictos con módulos de terceros.
 */

// Mostrar mensaje de bienvenida en la consola
global.console.log(
	c('yellow', '¡Hola mundo!'),
	`Bienvenido a ${c('green', 'Node.js')}, un entorno de ejecución de JavaScript del lado del servidor.`,
);

/** Nota:
 * `global` (similar a `window` en el navegador) es el objeto global en Node.js, el cual contiene todas las variables y funciones globales.
 * `globalThis` es una referencia al objeto global en cualquier entorno de JavaScript, permitiendo escribir código multiplataforma.
 * Por lo que en Node.js, `global` y `globalThis` apuntan al mismo objeto global.
 */

// Mostrar información general del sistema operativo
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

/** Nota:
 * `os.cpus()` devuelve un arreglo con información sobre cada núcleo de CPU del sistema.
 * Lo que permite optimizar tareas dividiéndolas entre varios núcleos y mejorar el rendimiento.
 * `os.uptime()` devuelve el tiempo que lleva encendido el sistema desde su último reinicio, útil para monitorización o diagnósticos.
 */

// Mostrar información sobre las interfaces de red y direcciones IP
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

/** Nota:
 * `os.networkInterfaces()` devuelve todas las interfaces de red y sus direcciones IP (IPv4 o IPv6).
 * Lo que permite identificar direcciones internas (solo accesibles en la red local) y externas (accesibles desde Internet).
 * Las IP internas suelen usar rangos como 192.168.x.x o 10.x.x.x, mientras que las externas son asignadas por el proveedor de Internet (ISP).
 */
