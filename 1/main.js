/**
 * Primer contacto con Node.js.
 *
 * En este script se usan módulos nativos para mostrar información básica
 * del sistema operativo y de la red, además de un saludo inicial en consola.
 * La idea es que el lector vea primero el resultado y después entienda cómo está construido.
 */

// Importando módulos nativos de Node.js
import os from 'node:os';
import { styleText as c } from 'node:util'; // Función para estilizar texto en la consola

/**
 * Apuntes:
 * Los módulos nativos de Node.js forman parte de su núcleo, por lo que no requieren instalación adicional.
 * El módulo `node:os` permite consultar datos del sistema operativo en el que se ejecuta Node.js.
 * El módulo `node:util` proporciona utilidades internas de soporte para el desarrollo.
 *
 * El prefijo `node:` indica que el módulo forma parte del núcleo de Node.js,
 * lo que ayuda a evitar confusiones con paquetes de terceros.
 */

// Mostrando mensaje de bienvenida en la consola
global.console.log(
	c('yellow', '¡Hola mundo!'),
	`Bienvenido a ${c('green', 'Node.js')}, un entorno de ejecución de JavaScript del lado del servidor.`,
);

/**
 * Apuntes:
 * `global` (similar a `window` en el navegador) es el objeto global en Node.js,
 * y `globalThis` hace referencia al objeto global en cualquier entorno de JavaScript.
 * Por lo tanto, `global` y `globalThis` apuntan al mismo objeto global en Node.js.
 */

// Mostrando información general del sistema operativo
console.group(c(['magenta', 'underline'], '\nInformación del SO:'));
[
	['Plataforma', os.platform()],
	['Nombre del SO', os.type()],
	['Nombre del host', os.hostname()],
	['Versión del SO', os.version()],
	['Release del SO', os.release()],
	['Arquitectura', os.arch()],
	['Número de CPUs', os.cpus().length],
	['Memoria libre (MB)', (os.freemem() / 1024 ** 2).toFixed(2)],
	['Memoria total (MB)', (os.totalmem() / 1024 ** 2).toFixed(2)],
	['Tiempo de actividad (h)', (os.uptime() / 3600).toFixed(2)],
	['Directorio de inicio', os.homedir()],
	['Directorio temporal', os.tmpdir()]
].forEach(([label, val]) => console.log(c('cyan', label + ':'), String(val)));
console.groupEnd();

/**
 * Apuntes:
 * `os.cpus()` devuelve un arreglo con información de cada núcleo disponible.
 * Esto permite conocer la capacidad del sistema para ejecutar tareas en paralelo.
 */

// Mostrando información de las interfaces de red con sus direcciones IP y tipos de conexiones 
console.group(c(['magenta', 'underline'], '\nInformación de red:'));
Object.entries(os.networkInterfaces()).forEach(([name, interfaces]) => {
	console.group(c('cyan', 'Interfaz:'), c('yellow', name));
	interfaces?.forEach(addr => console.log(
		c('green', 'Familia:'), addr.family,
		c('green', 'Tipo:'), addr.internal ? 'Interna' : 'Externa',
		c('green', 'Dirección IP:'), addr.address
	));
	console.groupEnd();
});
console.groupEnd();

/**
 * Apuntes:
 * `os.networkInterfaces()` devuelve un objeto con todas las interfaces de red disponibles.
 * Cada interfaz puede incluir varias direcciones, por ejemplo IPv4 e IPv6.
 *
 * Una IP interna suele usarse dentro de la red local.
 * Una IP externa es la que normalmente identifica la conexión hacia fuera.
 * 
 * Las IP internas suelen usar rangos como 192.168.x.x o 10.x.x.x,
 * mientras que las externas son asignadas por el proveedor de servicios de Internet (ISP).
 */
