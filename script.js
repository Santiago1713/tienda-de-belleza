// --- 1. ESTADO GLOBAL ---
let carrito = JSON.parse(localStorage.getItem('carrito_belleza')) || [];
let todosLosProductos = [];

// --- 2. SELECTORES DE ELEMENTOS ---
const contenedorCarrito = document.getElementById('cart-items-container');
const contadorIcono = document.getElementById('cart-count');
const totalElemento = document.getElementById('cart-total-amount');

const normalizarTexto = (texto) => (texto || "").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// --- 3. LÓGICA DEL CARRITO (UI) ---
function actualizarCarritoUI() {
    localStorage.setItem('carrito_belleza', JSON.stringify(carrito));
    
    if (contadorIcono) {
        contadorIcono.innerText = carrito.reduce((acc, i) => acc + i.cantidad, 0);
    }

    if (!contenedorCarrito) return; 

    contenedorCarrito.innerHTML = "";
    let subtotal = 0;

    carrito.forEach(producto => {
        const totalP = producto.precio * producto.cantidad;
        subtotal += totalP;
        contenedorCarrito.innerHTML += `
            <div class="cart-item">
                <div class="item-details">
                    <p class="item-name">${producto.nombre}</p>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="cambiarCantidad('${producto.id}', -1)">-</button>
                        <span>${producto.cantidad}</span>
                        <button class="qty-btn" onclick="cambiarCantidad('${producto.id}', 1)">+</button>
                        <button class="delete-btn" onclick="eliminarProducto('${producto.id}')">
                            <img src="logos/papelera.png" class="trash-icon" style="width: 20px;">
                        </button>
                    </div>
                </div>
                <div class="item-total-price">$${totalP.toLocaleString('es-CO')}</div>
            </div>`;
    });

    if (totalElemento) {
        totalElemento.innerText = `$${subtotal.toLocaleString('es-CO')}`;
    }
}

// --- 4. FUNCIONES DE APERTURA ---
window.abrirCarrito = () => {
    const sidebar = document.getElementById('carrito-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
};

window.cerrarCarrito = () => {
    const sidebar = document.getElementById('carrito-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
};

// --- 5. ACCIONES DEL CARRITO ---
window.agregarAlCarrito = (id, nombre, precio) => {
    const existe = carrito.find(item => String(item.id) === String(id));
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ id: String(id), nombre, precio: Number(precio), cantidad: 1 });
    }
    actualizarCarritoUI();
    window.abrirCarrito();
};

window.eliminarProducto = (id) => {
    carrito = carrito.filter(item => String(item.id) !== String(id));
    actualizarCarritoUI();
};

window.cambiarCantidad = (id, cambio) => {
    const p = carrito.find(i => String(i.id) === String(id));
    if (p) {
        p.cantidad += cambio;
        if (p.cantidad <= 0) eliminarProducto(id);
        else actualizarCarritoUI();
    }
};

// --- 6. RENDERIZAR PRODUCTOS ---
function renderizarProductos(lista) {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    if (lista.length === 0) {
        contenedor.innerHTML = `<p class="no-products">No hay productos en esta categoría.</p>`;
        return;
    }

    contenedor.innerHTML = lista.map(p => {
        const precioReal = Math.floor(Number(p.precio));
        return `
        <div class="product-card">
            <div class="product-img">
                <img src="${p.imagen}" alt="${p.nombre}">
                ${p.stock <= 0 ? '<span class="badge-agotado">AGOTADO</span>' : ''}
            </div>
            <div class="product-info">
                <h3>${p.nombre.toUpperCase()}</h3>
                <p class="precio">$${precioReal.toLocaleString('es-CO')}</p>
                <button class="btn-add" 
                    ${p.stock <= 0 ? 'disabled' : ''} 
                    onclick="agregarAlCarrito('${p.id}', '${p.nombre}', ${precioReal})">
                    ${p.stock <= 0 ? 'Sin Stock' : 'Agregar'}
                </button>
            </div>
        </div>`;
    }).join('');
}

// --- 7. FILTROS DE CATEGORÍA ---
function inicializarFiltros() {
    const botones = document.querySelectorAll('.filter-btn');
    if (botones.length === 0) return;

    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            botones.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const categoria = btn.getAttribute('data-category');

            if (categoria === 'todos') {
                renderizarProductos(todosLosProductos);
            } else {
                const filtrados = todosLosProductos.filter(p =>
                    normalizarTexto(p.categoria) === normalizarTexto(categoria)
                );
                renderizarProductos(filtrados);
            }
        });
    });
}

// --- 8. CARGA DINÁMICA DE PRODUCTOS DESDE DB ---
async function cargarContenido() {
    const path = window.location.pathname;
    const pagina = path.split("/").pop() || "index.html";
    const contenedor = document.getElementById('contenedor-productos');
    const titulo = document.getElementById('titulo-seccion');

    if (!contenedor) return;

    const categoriasConocidas = ['maquillaje', 'capilares', 'skin-care', 'corporales'];

    try {
        // ✅ URL de Render en lugar de localhost
        const res = await fetch('https://tienda-de-belleza.onrender.com/api/productos');
        const productos = await res.json();
        let filtrados = [];

        if (pagina === "index.html" || pagina === "") {
            let destacados = productos.filter(p => p.es_destacado == 1);
            if (destacados.length === 0) destacados = productos;

            const marcasVistas = new Set();
            filtrados = destacados.filter(p => {
                const marca = normalizarTexto(p.marca);
                if (marcasVistas.has(marca)) return false;
                marcasVistas.add(marca);
                return true;
            });
            todosLosProductos = filtrados;

        } else if (categoriasConocidas.includes(normalizarTexto(pagina.replace(".html", "")))) {
            const categoria = pagina.replace(".html", "");
            if (titulo) titulo.innerText = categoria.toUpperCase();
            filtrados = productos.filter(p =>
                normalizarTexto(p.categoria) === normalizarTexto(categoria)
            );
            todosLosProductos = filtrados;

        } else {
            const marca = pagina.replace(".html", "");
            if (titulo) titulo.innerText = marca.toUpperCase();
            filtrados = productos.filter(p =>
                normalizarTexto(p.marca) === normalizarTexto(marca)
            );
            todosLosProductos = filtrados;
        }

        renderizarProductos(filtrados);
        inicializarFiltros();
        inicializarFiltrosDisponibilidad();
        inicializarOrdenar();

    } catch (e) {
        console.error("Error al cargar productos:", e);
    }
}

// --- 9. BUSCADOR ---
function inicializarBuscador() {
    const input = document.getElementById('input-busqueda');
    const btnBuscar = document.querySelector('.search-btn');
    if (!input) return;

    function buscar() {
        const termino = normalizarTexto(input.value);
        if (termino === '') {
            renderizarProductos(todosLosProductos);
            return;
        }
        const resultado = todosLosProductos.filter(p =>
            normalizarTexto(p.nombre).includes(termino) ||
            normalizarTexto(p.marca).includes(termino)
        );
        renderizarProductos(resultado);
    }

    input.addEventListener('input', buscar);
    if (btnBuscar) btnBuscar.addEventListener('click', buscar);
}

// --- 10. FILTROS DE DISPONIBILIDAD ---
function inicializarFiltrosDisponibilidad() {
    const checkExistencia = document.getElementById('check-existencia');
    const checkAgotado = document.getElementById('check-agotado');
    const countExistencia = document.getElementById('count-existencia');
    const countAgotado = document.getElementById('count-agotado');

    if (!checkExistencia || !checkAgotado) return;

    if (countExistencia) countExistencia.innerText = todosLosProductos.filter(p => p.stock > 0).length;
    if (countAgotado) countAgotado.innerText = todosLosProductos.filter(p => p.stock <= 0).length;

    function aplicarFiltroDisponibilidad() {
        const soloExistencia = checkExistencia.checked;
        const soloAgotado = checkAgotado.checked;

        if ((!soloExistencia && !soloAgotado) || (soloExistencia && soloAgotado)) {
            renderizarProductos(todosLosProductos);
            return;
        }

        const resultado = todosLosProductos.filter(p => {
            if (soloExistencia) return p.stock > 0;
            if (soloAgotado) return p.stock <= 0;
        });

        renderizarProductos(resultado);
    }

    checkExistencia.addEventListener('change', aplicarFiltroDisponibilidad);
    checkAgotado.addEventListener('change', aplicarFiltroDisponibilidad);
}

// --- 11. ORDENAR PRODUCTOS ---
function inicializarOrdenar() {
    const select = document.getElementById('ordenar-productos');
    if (!select) return;

    select.addEventListener('change', () => {
        const valor = select.value;
        let lista = [...todosLosProductos];

        if (valor === 'bajo') {
            lista.sort((a, b) => a.precio - b.precio);
        } else if (valor === 'alto') {
            lista.sort((a, b) => b.precio - a.precio);
        }

        renderizarProductos(lista);
    });
}

// --- 12. INICIALIZACIÓN ---
window.addEventListener('load', () => {
    actualizarCarritoUI();
    cargarContenido();
    inicializarBuscador();

    const btnCerrar = document.getElementById('close-cart');
    if (btnCerrar) btnCerrar.onclick = window.cerrarCarrito;
    
    const btnAbrir = document.getElementById('open-cart');
    if (btnAbrir) btnAbrir.onclick = window.abrirCarrito;

    const overlay = document.getElementById('cart-overlay');
    if (overlay) overlay.onclick = window.cerrarCarrito;
});

// --- 13. BOTÓN WHATSAPP ---
window.addEventListener('load', () => {
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    if (btnWhatsapp) {
        btnWhatsapp.onclick = () => {
            if (carrito.length === 0) {
                alert('Tu carrito está vacío');
                return;
            }

            const numero = '573054361205';
            let mensaje = '*Hola! Quiero realizar el siguiente pedido:*\n\n';
            
            carrito.forEach(p => {
                mensaje += `- ${p.nombre} x${p.cantidad} -> $${(p.precio * p.cantidad).toLocaleString('es-CO')}\n`;
            });

            const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
            mensaje += `\n*Total estimado: $${total.toLocaleString('es-CO')}*`;
            mensaje += '\n\nPor favor confirmar disponibilidad y datos de envio.';

            const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');
        };
    }
});