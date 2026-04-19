// base de datos/data.js

window.productosBase = [];

// 1. Función para renderizar las tarjetas (Se mantiene casi igual, solo cambia el ID)
window.mostrarProductos = (lista) => {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;
    contenedor.innerHTML = ""; 

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <p style="font-size: 1.2rem; color: var(--color-texto-vino); font-family: var(--fuente-titulos);">
                    🔍 No encontramos productos en esta categoría todavía.
                </p>
            </div>`;
        return;
    }

    lista.forEach((producto) => {

        const id = producto._id || producto.id; 
        
        const nombreValido = producto.nombre ? producto.nombre.trim().toUpperCase() : "PRODUCTO";
        const imagenValida = producto.imagen ? producto.imagen.trim() : 'https://via.placeholder.com/250';
        const precioValido = Number(producto.precio) || 0;

        contenedor.innerHTML += `
            <div class="product-card">
                <div class="product-img" onclick="abrirDetalle('${id}')" style="cursor: zoom-in;">
                    <img src="${imagenValida}" alt="${nombreValido}" loading="lazy" onerror="this.src='https://via.placeholder.com/250'">
                </div>
                <div class="product-info">
                    <h3>${nombreValido}</h3>
                    <p class="precio">$${precioValido.toLocaleString()}</p>
                    <button class="btn-add" onclick="agregarAlCarrito('${id}', '${nombreValido}', ${precioValido})">
                        Agregar al carrito
                    </button>
                </div>
            </div>`;
    });
};

// 2. NUEVA FUNCIÓN: Obtener datos de tu servidor MongoDB (reemplaza a la de Firebase)
async function renderizarProductos() {
    console.log("Intentando obtener productos de MongoDB vía Node.js...");
    
    const url = window.API_URL + "/productos";

    try {
        const respuesta = await fetch(url);
        
        if (!respuesta.ok) {
            throw new Error("No se pudo conectar con el servidor local");
        }

        const datos = await respuesta.json();
        
        window.productosBase = datos.map(prod => ({
            ...prod,
            id: prod._id, 
            categoria: prod.categoria ? prod.categoria.toLowerCase().trim() : "sin categoria"
        }));

        console.log("Productos cargados desde MongoDB:", window.productosBase);
        window.mostrarProductos(window.productosBase);

    } catch (error) {
        console.error("Error al conectar con el Backend:", error);
        const cont = document.getElementById('contenedor-productos');
        if(cont) cont.innerHTML = "<p style='text-align:center;'>⚠️ Error de conexión con el servidor local. Asegúrate de que el comando 'node server.js' esté corriendo en el puerto 3000.</p>";
    }
}

// 3. Ejecutamos la carga al iniciar
window.addEventListener('load', () => {
    renderizarProductos();
});