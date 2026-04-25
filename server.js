const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// ✅ Lee productos desde el JSON en lugar de MySQL
const data = require('./productos.json');
const productos = data[2].data.map(p => ({
    ...p,
    precio: parseFloat(p.precio),
    es_destacado: parseInt(p.es_destacado),
    stock: parseInt(p.stock)
}));

app.get('/api/productos', (req, res) => {
    res.json(productos);
});

app.get('/', (req, res) => {
    res.send('Servidor de la Tienda de Belleza corriendo.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});