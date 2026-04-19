// conexion.js

// Definimos la ruta de nuestro servidor local de productos
const API_URL = "http://localhost:3000/api";

// Lo compartimos con los demás archivos JS
window.API_URL = API_URL;

// Mensaje de éxito para que sepas que el "puente" está listo
console.log("✅ Frontend conectado al servidor en: " + API_URL);