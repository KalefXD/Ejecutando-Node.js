/**
 * Primer contacto con Node.js.
 *
 * En este script se usan módulos nativos para mostrar información básica
 * del sistema operativo y de la red, además de un saludo inicial en consola.
 * El lector verá cómo importar módulos nativos, consultar propiedades del sistema
 * y recorrer interfaces de red, antes de profundizar en el código.
 */

// Importando módulos nativos de Node.js
import os from 'node:os';
import { styleText as c } from 'node:util'; // Función para estilizar texto en la consola

/**
 * Apuntes:
 * Los módulos nativos de Node.js forman parte de su núcleo, por lo que no requieren instalación adicional.
 * El módulo `node:os` permite consultar datos del sistema operativo en el que se ejecuta Node.js.
 * El módulo `node:util` ofrece utilidades generales para el desarrollo, como formateo de texto y depuración.
 *
 * El prefijo `node:` indica que el módulo forma parte del núcleo de Node.js,
 * lo que ayuda a evitar confusiones con paquetes de terceros que tengan el mismo nombre.
 */

// Mostrando mensaje de bienvenida en la consola
global.console.log(
	c('yellow', '¡Hola mundo!'),
	`Bienvenido a ${c('green', 'Node.js')}, un entorno de ejecución de JavaScript del lado del servidor.`,
);

/**
 * Apuntes:
 * En Node.js, el objeto global equivale a `window` en el navegador: contiene las variables
 * y funciones disponibles en cualquier parte del código sin necesidad de importarlas.
 * Se puede acceder a él con `global`, que es exclusivo de Node.js,
 * o con `globalThis`, que es estándar de JavaScript y funciona en cualquier entorno.
 * Ambos apuntan al mismo objeto, pero `globalThis` es preferible cuando se escribe
 * código pensado para ser portable entre entornos.
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
 * `os.cpus()` devuelve un arreglo con información de cada núcleo del procesador.
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
 * Cada interfaz puede tener varias direcciones, por ejemplo una IPv4 y una IPv6.
 *
 * Las direcciones internas se usan dentro de la red local del equipo.
 * Las externas son las que identifican la conexión hacia Internet y son asignadas por el ISP.
 * Los rangos más comunes para direcciones internas son 192.168.x.x y 10.x.x.x.
 */
