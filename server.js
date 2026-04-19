require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // Nueva herramienta para manejar rutas de carpetas

const app = express();
app.use(cors());
app.use(express.json());

// --- NUEVO CAMBIO: CARPETA DE IMÁGENES ESTÁTICA ---
// Esto permite que cuando alguien pida una imagen, Express la busque en tu carpeta física
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// 1. Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Usuario por defecto de XAMPP
    password: '',      // Contraseña por defecto (vacía)
    database: 'tienda_belleza'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
        return;
    }
    console.log('🐬 ¡CONECTADO A MYSQL (XAMPP)!');
});

// 2. Ruta para obtener productos (Consulta SQL)
app.get('/api/productos', (req, res) => {
    const sql = "SELECT * FROM productos";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).json({ error: "Error en la consulta SQL" });
        }
        res.json(results);
    });
});

// --- OPCIONAL: RUTA PRINCIPAL PARA QUE NO SALGA "CANNOT GET /" ---
app.get('/', (req, res) => {
    res.send('🚀 El servidor de la Tienda de Belleza está corriendo perfectamente.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor SQL corriendo en http://localhost:${PORT}`);
});