/**
 * 1. Mostrando información del SO
 *
 * En este script se usan módulos nativos para mostrar información básica
 * del sistema operativo y de la red, además de un saludo inicial en consola.
 * Se consultan propiedades del SO con `node:os` y se recorren las interfaces de red con `Object.entries()`.
 * El lector verá cómo importar módulos nativos, consultar propiedades del sistema
 * y recorrer interfaces de red.
 */

// Importando módulos nativos de Node.js
import os from 'node:os';
import { styleText as c } from 'node:util';

/**
 * Apunte #1:
 * Los módulos nativos de Node.js forman parte de su núcleo, por lo que no requieren instalación adicional.
 * 
 * El módulo `node:os` permite consultar datos del sistema operativo en el que se ejecuta Node.js.
 * El módulo `node:util` ofrece diversas utilidades para el desarrollo.
 * 
 * `styleText` aplica colores y estilos a un texto mediante secuencias de escape ANSI.
 * Para poder quitar esos caracteres de formato, `node:util` también incluye `stripVTControlCharacters()`.
 * 
 * El prefijo `node:` indica que el módulo forma parte del núcleo de Node.js,
 * lo que ayuda a evitar confusiones con paquetes de terceros que tengan el mismo nombre.
 */

// Mostrando mensaje de bienvenida en la consola
global.console.log(
	c('yellow', '¡Hola mundo!'),
	c('green', 'Node.js'), 'es un entorno de ejecución para JavaScript fuera del navegador.'
);

/**
 * Apunte #2:
 * `global` es el objeto global de Node.js, el equivalente a `window` en los navegadores, pero exclusivo de Node.
 * `global.console.log` solo demuestra que `console` vive ahí; en la práctica, nadie lo llama así.
 * `globalThis` es la alternativa estándar que funciona en cualquier entorno de JavaScript,
 * y en Node.js apunta al mismo objeto que `global`.
 * 
 * Node.js usa el motor V8 de Chrome para ejecutar JavaScript, lo que le permite correr fuera del navegador.
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

// Mostrando información de las interfaces de la red con sus direcciones IP y tipos de conexiones
console.group(c(['magenta', 'underline'], '\nInformación de la red:'));
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
 * Apunte #3:
 * La propiedad `internal` indica si la dirección pertenece a una interfaz de loopback,
 * como `127.0.0.1` (IPv4) o `::1` (IPv6), que el sistema usa para comunicarse consigo mismo.
 * `internal: false` solo significa "no es loopback"; no implica que la IP sea pública.
 * Distinguir si una IP es privada (como 192.168.x.x o 10.x.x.x) o pública requiere
 * analizar el rango de la dirección, algo que `os.networkInterfaces()` no hace.
 */
