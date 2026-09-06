/**
 * 1. Mostrando información del SO
 * 
 * Apunte #1:
 * Node.js tiene módulos nativos que permiten interactuar con el sistema operativo y realizar tareas comunes.
 * Un módulo nativo es un módulo que viene incluido por defecto con el lenguaje o entorno de ejecución.
 * Un módulo es una archivo que exporta parte de su código para reutilizarlo.
 * 
 * El módulo `node:os` permite consultar datos del sistema operativo en el que se ejecuta Node.js.
 * El módulo `node:util` ofrece diversas utilidades para el desarrollo.
 * 
 * `styleText` aplica colores y estilos a un texto mediante secuencias de escape ANSI.
 * Para poder quitar esos caracteres de formato, `node:util` también incluye `stripVTControlCharacters()`.
 * 
 * El prefijo `node:` indica que el módulo es nativo de Node.js,
 * esto evita confusiones con paquetes de terceros que tengan el mismo nombre.
 */

// Importando módulos nativos de Node.js
import os from 'node:os';
import { styleText as c } from 'node:util';

/**
 * Apunte #2:
 * `global` es el objeto global y exclusivo de Node.js, el equivalente a `window` en los navegadores web.
 * El objeto global es un objeto que representa el ámbito global, y los objetos disponibles globalmente se definen en él (ámbito global).
 * Solo hay un objeto global por entorno, en navegadores es `window`, en Workers es `WorkerGlobalScope`, en Node.js es `global`.
 * `globalThis` es una propiedad global que permite acceder al objeto global independientemente del entorno actual.
 * 
 * Node.js usa el motor V8 de Chrome para ejecutar JavaScript, lo que le permite correr fuera del navegador.
 */

// Mostrando mensaje de bienvenida con colores y estilos en la consola
console.log(c('yellow', '¡Hola mundo!'));
global.console.log(c('green', 'Node.js'), 'es un entorno de ejecución para JavaScript fuera del navegador.');

// Mostrando información general del sistema operativo
console.group(c(['magenta', 'underline'], '\nInformación del SO:'));
Object.entries({
	'Plataforma': os.platform(),
	'Nombre del SO': os.type(),
	'Nombre del host': os.hostname(),
	'Versión del SO': os.version(),
	'Release del SO': os.release(),
	'Arquitectura': os.arch(),
	'Número de CPUs': os.cpus().length,
	'Memoria libre (MiB)': (os.freemem() / 1024 ** 2).toFixed(2),
	'Memoria total (MiB)': (os.totalmem() / 1024 ** 2).toFixed(2),
	'Tiempo de actividad (h)': (os.uptime() / 3600).toFixed(2),
	'Directorio de inicio': os.homedir(),
	'Directorio temporal': os.tmpdir()
}).forEach(([label, val]) => console.log(c('cyan', label + ':'), String(val)));
console.groupEnd();

/**
 * Apunte #3:
 * La propiedad `internal` indica si la dirección pertenece a una interfaz interna (loopback), como `127.0.0.1`
 * (IPv4) o `::1` (IPv6), que el sistema utiliza para comunicarse consigo mismo sin salir a la red.
 * Una dirección no loopback de un dispositivo puede utilizarse para comunicarse con otros dispositivos a través de una red.
 * Una dirección IP privada identifica un dispositivo dentro de una red interna, y una pública identifica una red desde el exterior.
 * Distinguir si una IP es privada o pública (suele estar en el router) requiere analizar el rango de la dirección.
 * Rangos de una IPv4 privada: `10.0.0.0 – 10.255.255.255`, `172.16.0.0 – 172.31.255.255` y `192.168.0.0 – 192.168.255.255`.
 */

// Mostrando información de las interfaces de la red con sus direcciones IP y tipos de conexiones
console.group(c(['magenta', 'underline'], '\nInformación de la red:'));
Object.entries(os.networkInterfaces()).forEach(([name, interfaces]) => {
	console.group(c('cyan', 'Interfaz:'), c('yellow', name));
	interfaces?.forEach(iface => console.log(
		c('green', 'Familia:'), iface.family,
		c('green', 'Tipo:'), iface.internal ? 'Interna' : 'Externa',
		c('green', 'Dirección IP:'), iface.address
	));
	console.groupEnd();
});
console.groupEnd();
