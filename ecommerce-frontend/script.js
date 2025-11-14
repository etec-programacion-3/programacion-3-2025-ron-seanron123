// ...existing code...
// ------------------------------
// VARIABLES GLOBALES
// ------------------------------
const API_URL = "http://127.0.0.1:8000/api";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let usuario = JSON.parse(localStorage.getItem("usuario")) || null;

// ------------------------------
// INDEX.HTML - MOSTRAR PRODUCTOS
// ------------------------------
async function cargarProductos() {
    const productosDiv = document.getElementById("productos");
    if (!productosDiv) return;

    try {
        // Construir headers: preferir token real si existe, si no usar fake token (compatibilidad)
        const storedToken = localStorage.getItem("token");
        const headers = { "Accept": "application/json" };
        if (storedToken) {
            headers["Authorization"] = `Bearer ${storedToken}`;
        } else {
            // Compatibilidad con backend actual
            headers["x-token"] = "fake-jwt-token";
        }

        const res = await fetch(`${API_URL}/products/`, { headers });
        const productos = await res.json();

        productosDiv.innerHTML = "";
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

    carritoDiv.innerHTML = "";
    let total = 0;

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
    // Si hay un usuario autenticado, incluir su id en la orden para asociarla
    if (usuario && usuario.user_id) {
        orderData.user_id = usuario.user_id;
    }

    try {
        const storedToken = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;
        else headers["x-token"] = "fake-jwt-token";

        const res = await fetch(`${API_URL}/orders/`, {
            method: "POST",
            headers,
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            carrito = [];
            localStorage.setItem("carrito", JSON.stringify(carrito));
            // Archivo real: confirmacion.html (sin tilde)
            window.location.href = "confirmacion.html";
        } else {
            const error = await res.json().catch(() => ({}));
            alert("Error al finalizar compra: " + (error.detail || JSON.stringify(error)));
        }
    } catch (error) {
        console.error("Error al enviar orden:", error);
    }
}

// ------------------------------
// REGISTER.HTML - REGISTRO
// ------------------------------
async function registrarUsuario(event) {
    event.preventDefault();
    const username = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    console.log("Registrar usuario:", username);

    try {
        const res = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role: "user" })
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            // Backend devuelve el objeto de usuario; mostrar mensaje genérico si no hay 'message'
            alert(data.message || "Registro exitoso");
            window.location.href = "login.html";
        } else {
            alert(data.detail || JSON.stringify(data) || "Error al registrar usuario");
        }
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert("Error de red al registrar usuario");
    }
}

// ------------------------------
// LOGIN.HTML - LOGIN
// ------------------------------
async function loginUsuario(event) {
    event.preventDefault();
    const username = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log("Login usuario:", username);

    try {
        const res = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json().catch(() => ({}));
        console.log('Login response', res.status, data);
        if (res.ok) {
            // Guardar token devuelto por el backend (o fallback al fake token)
            const token = data.token || "fake-jwt-token";
            // Guardar también el user_id si el backend lo devuelve
            usuario = { username, role: data.role, token, user_id: data.user_id };
            localStorage.setItem("usuario", JSON.stringify(usuario));
            localStorage.setItem("token", token);
            alert(data.message || "Login exitoso");
            window.location.href = "index.html";
        } else {
            alert(data.detail || JSON.stringify(data) || "Error al iniciar sesión");
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Error de red al iniciar sesión");
    }
}

// ------------------------------
// EVENTOS
// ------------------------------
// ------------------------------
// AUTENTICACIÓN / NAVEGACIÓN
// ------------------------------
function verificarAutenticacion() {
    // Actualiza la variable global `usuario` desde localStorage
    usuario = JSON.parse(localStorage.getItem("usuario")) || null;
    return !!usuario;
}

function actualizarNavegacion() {
    const loginLink = document.getElementById("loginLink");
    if (!loginLink) return;

    if (usuario) {
        // Mostrar nombre y botón de logout
        loginLink.innerHTML = `
            <span style="color: white; margin-right:10px;">${usuario.username || ''}</span>
            <button id="logoutBtn" style="background:#e53e3e;color:white;border:none;padding:6px 10px;border-radius:4px;cursor:pointer">Cerrar sesión</button>
        `;
        const btn = document.getElementById("logoutBtn");
        if (btn) {
            btn.addEventListener("click", () => {
                localStorage.removeItem("usuario");
                localStorage.removeItem("token");
                usuario = null;
                actualizarNavegacion();
                // redirigir al inicio
                window.location.href = "index.html";
            });
        }
    } else {
        loginLink.innerHTML = `<a href="login.html">Login</a>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Cargar productos si estamos en index.html
    if (document.getElementById("productos")) {
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
    if (registerForm) registerForm.addEventListener("submit", registrarUsuario);

    // Login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", loginUsuario);
});

// If the script loaded after DOMContentLoaded fired, attach handlers immediately
if (document.readyState !== 'loading') {
    const registerFormImmediate = document.getElementById("registerForm");
    if (registerFormImmediate) registerFormImmediate.addEventListener("submit", registrarUsuario);
    const loginFormImmediate = document.getElementById("loginForm");
    if (loginFormImmediate) loginFormImmediate.addEventListener("submit", loginUsuario);
}
// ...existing code...
