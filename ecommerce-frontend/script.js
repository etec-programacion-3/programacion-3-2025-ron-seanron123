// ------------------------------
// VARIABLES GLOBALES
// ------------------------------
const API_URL = "http://127.0.0.1:8000/api";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let usuario = JSON.parse(localStorage.getItem("usuario")) || null;

// ------------------------------
// VERIFICAR AUTENTICACIÓN
// ------------------------------
function verificarAutenticacion() {
    const paginasPublicas = ['login.html', 'register.html'];
    const paginaActual = window.location.pathname.split('/').pop();
    
    // Si no hay usuario logueado y no está en una página pública
    if (!usuario && !paginasPublicas.includes(paginaActual)) {
        console.log("Usuario no autenticado, redirigiendo al login...");
        window.location.href = "login.html";
        return false;
    }
    
    return true;
}

// ------------------------------
// ACTUALIZAR UI SEGÚN USUARIO
// ------------------------------
function actualizarNavegacion() {
    const loginLink = document.getElementById("loginLink");
    
    if (loginLink) {
        if (usuario) {
            // Usuario logueado: mostrar nombre y botón de cerrar sesión
            loginLink.innerHTML = `
                ${usuario.username} 
                <button onclick="cerrarSesion()" style="margin-left: 10px; padding: 5px 10px; cursor: pointer;">
                    Cerrar Sesión
                </button>
            `;
            loginLink.removeAttribute('href');
        } else {
            // Usuario no logueado: mostrar link de login
            loginLink.textContent = "Login";
            loginLink.href = "login.html";
        }
    }
}

// ------------------------------
// CERRAR SESIÓN
// ------------------------------
function cerrarSesion() {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
        localStorage.removeItem("usuario");
        localStorage.removeItem("carrito");
        usuario = null;
        carrito = [];
        alert("Sesión cerrada exitosamente");
        window.location.href = "login.html";
    }
}

// ------------------------------
// INDEX.HTML - MOSTRAR PRODUCTOS
// ------------------------------
async function cargarProductos() {
    const productosDiv = document.getElementById("productos");
    if (!productosDiv) return;

    // Verificar autenticación antes de cargar productos
    if (!verificarAutenticacion()) return;

    try {
        const res = await fetch(`${API_URL}/products/`);
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        const productos = await res.json();

        productosDiv.innerHTML = "";
        
        if (productos.length === 0) {
            productosDiv.innerHTML = "<p>No hay productos disponibles. Ejecuta el script seed.py para agregar productos de prueba.</p>";
            return;
        }

        productos.forEach(producto => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <h3>${producto.name}</h3>
                <img src="${producto.imageURL || 'https://via.placeholder.com/150'}" alt="${producto.name}">
                <p>${producto.description || ""}</p>
                <p>Precio: $${producto.price.toFixed(2)}</p>
                <p>Stock: ${producto.stock}</p>
                <button onclick="agregarAlCarrito(${producto.id}, '${producto.name}', ${producto.price})">Agregar al carrito</button>
            `;
            productosDiv.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        productosDiv.innerHTML = "<p>Error al cargar productos. Verifica que el servidor esté corriendo.</p>";
    }
}

// ------------------------------
// AGREGAR PRODUCTO AL CARRITO
// ------------------------------
function agregarAlCarrito(id, nombre, precio) {
    const productoEnCarrito = carrito.find(p => p.id === id);
    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(`${nombre} agregado al carrito`);
}

// ------------------------------
// CART.HTML - MOSTRAR CARRITO
// ------------------------------
function mostrarCarrito() {
    const carritoDiv = document.getElementById("carrito");
    const totalDiv = document.getElementById("total");
    if (!carritoDiv) return;

    // Verificar autenticación
    if (!verificarAutenticacion()) return;

    carritoDiv.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        carritoDiv.innerHTML = "<p>El carrito está vacío</p>";
        if (totalDiv) totalDiv.innerText = "Total: $0.00";
        return;
    }

    carrito.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.innerHTML = `
            <p>${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad} 
            <button onclick="eliminarDelCarrito(${item.id})">Eliminar</button></p>
        `;
        carritoDiv.appendChild(itemDiv);
        total += item.precio * item.cantidad;
    });

    if (totalDiv) totalDiv.innerText = `Total: $${total.toFixed(2)}`;
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
}

// ------------------------------
// FINALIZAR COMPRA
// ------------------------------
async function finalizarCompra() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    const orderData = {
        items: carrito.map(item => ({ product_id: item.id, quantity: item.cantidad }))
    };

    try {
        const res = await fetch(`${API_URL}/orders/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            carrito = [];
            localStorage.setItem("carrito", JSON.stringify(carrito));
            window.location.href = "confirmacion.html";
        } else {
            const error = await res.json().catch(() => ({}));
            alert("Error al finalizar compra: " + (error.detail || JSON.stringify(error)));
        }
    } catch (error) {
        console.error("Error al enviar orden:", error);
        alert("Error al conectar con el servidor");
    }
}

// ------------------------------
// REGISTER.HTML - REGISTRO
// ------------------------------
async function registrarUsuario(event) {
    event.preventDefault();
    const username = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    console.log("Intentando registrar:", username);

    try {
        const res = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role: "user" })
        });

        const data = await res.json();
        console.log("Respuesta registro:", data);

        if (res.ok) {
            alert("✅ " + (data.message || "Registro exitoso. Ahora puedes iniciar sesión."));
            window.location.href = "login.html";
        } else {
            alert("❌ " + (data.detail || "Error al registrar usuario"));
        }
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert("Error al conectar con el servidor. Verifica que esté corriendo en http://127.0.0.1:8000");
    }
}

// ------------------------------
// LOGIN.HTML - LOGIN
// ------------------------------
async function loginUsuario(event) {
    event.preventDefault();
    const username = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("Intentando login:", username);

    try {
        const res = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        console.log("Respuesta login:", data);

        if (res.ok) {
            // ✅ Guardar usuario con todos los datos
            usuario = { 
                username, 
                user_id: data.user_id,
                role: data.role 
            };
            localStorage.setItem("usuario", JSON.stringify(usuario));
            alert("✅ " + (data.message || "Login exitoso"));
            window.location.href = "index.html";
        } else {
            alert("❌ " + (data.detail || "Error al iniciar sesión"));
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Error al conectar con el servidor. Verifica que esté corriendo en http://127.0.0.1:8000");
    }
}

// ------------------------------
// EVENTOS
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
    console.log("Página cargada");
    console.log("Usuario actual:", usuario);
    
    // Verificar autenticación en todas las páginas
    verificarAutenticacion();
    
    // Actualizar navegación según estado de autenticación
    actualizarNavegacion();
    
    // Cargar productos si estamos en index.html
    if (document.getElementById("productos")) {
        console.log("Cargando productos...");
        cargarProductos();
    }

    // Mostrar carrito si estamos en cart.html
    if (document.getElementById("carrito")) {
        mostrarCarrito();
        const botonFinalizar = document.getElementById("finalizar");
        if (botonFinalizar) botonFinalizar.addEventListener("click", finalizarCompra);
    }

    // Registro
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        console.log("Formulario de registro encontrado");
        registerForm.addEventListener("submit", registrarUsuario);
    }

    // Login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        console.log("Formulario de login encontrado");
        loginForm.addEventListener("submit", loginUsuario);
    }
});