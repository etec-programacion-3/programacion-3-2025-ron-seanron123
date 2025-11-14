// ------------------------------
// VARIABLES GLOBALES
// ------------------------------
const API_URL = "http://127.0.0.1:8000/api";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let usuario = JSON.parse(localStorage.getItem("usuario")) || null;

// ------------------------------
// FUNCIÓN FETCH AUTENTICADO (Wrapper para enviar el JWT)
// ------------------------------
async function fetchAutenticado(url, options = {}) {
    const token = localStorage.getItem("jwt");
    
    if (!token) {
        console.error("No se encontró JWT. Petición no autorizada.");
        // Devuelve una promesa con un error para que el bloque try/catch lo maneje
        return Promise.reject(new Error("Usuario no autenticado")); 
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}` // Añade el header de autenticación
    };

    return fetch(url, { ...options, headers });
}

// ------------------------------
// VERIFICAR AUTENTICACIÓN (Solo protege páginas específicas)
// ------------------------------
function verificarAutenticacion() {
    const paginasProtegidas = ['cart.html'];
    const paginaActual = window.location.pathname.split('/').pop();
    
    if (paginasProtegidas.includes(paginaActual)) {
        if (!usuario) {
            console.log("Usuario no autenticado, redirigiendo al login...");
            window.location.href = "login.html";
            return false;
        }
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
            loginLink.innerHTML = `
                <span style="color: #48bb78; font-weight: bold;">Bienvenido, ${usuario.username}</span>
                <button onclick="cerrarSesion()">
                    Cerrar Sesión
                </button>
            `;
        } else {
            loginLink.innerHTML = `<a href="login.html">Login</a>`;
        }
    }
}

// ------------------------------
// CERRAR SESIÓN
// ------------------------------
function cerrarSesion() {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) { 
        localStorage.removeItem("usuario");
        localStorage.removeItem("jwt");
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

    try {
        const res = await fetch(`${API_URL}/products/`); 
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        const productos = await res.json();

        productosDiv.innerHTML = "";
        
        if (productos.length === 0) {
            productosDiv.innerHTML = "<p style='text-align: center; font-size: 1.2em; color: #f56565;'>No hay productos disponibles. Verifica que el backend esté corriendo y se haya ejecutado seed.py.</p>";
            return;
        }

        productos.forEach(producto => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <h3>${producto.name}</h3>
                <img src="${producto.imageURL || 'https://placehold.co/300x200/2b6cb0/ffffff?text=Producto'}" alt="${producto.name}">
                <p>${producto.description || "Sin descripción"}</p>
                <p style="font-size: 1.2em; color: #e53e3e; font-weight: bold;">Precio: $${producto.price.toFixed(2)}</p>
                <p>Stock: ${producto.stock}</p>
                <button onclick="agregarAlCarrito(${producto.id}, '${producto.name}', ${producto.price})">Agregar al carrito</button>
            `;
            productosDiv.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        productosDiv.innerHTML = "<p style='text-align: center;'>Error al cargar productos. Verifica que el servidor de FastAPI esté corriendo en http://127.0.0.1:8000</p>";
    }
}

// ------------------------------
// AGREGAR PRODUCTO AL CARRITO
// ------------------------------
function agregarAlCarrito(id, nombre, precio) {
    if (!usuario) {
        alert("Debes iniciar sesión para agregar productos al carrito.");
        window.location.href = "login.html";
        return;
    }

    const productoEnCarrito = carrito.find(p => p.id === id);
    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(`${nombre} agregado al carrito`);
    // Recargar carrito si estamos en la página del carrito
    if (document.getElementById("carrito")) {
        mostrarCarrito();
    }
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

    if (carrito.length === 0) {
        carritoDiv.innerHTML = "<p style='text-align: center; padding: 20px;'>El carrito está vacío 😔</p>";
        if (totalDiv) totalDiv.innerText = "Total: $0.00";
        return;
    }

    carrito.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.innerHTML = `
            <p><strong>${item.nombre}</strong> - $${item.precio.toFixed(2)} x ${item.cantidad}</p>
            <button onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
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
// FINALIZAR COMPRA (Uso de fetchAutenticado)
// ------------------------------
async function finalizarCompra() {
    if (!usuario) {
        alert("Debes iniciar sesión para finalizar la compra.");
        window.location.href = "login.html";
        return;
    }
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    const orderData = {
        items: carrito.map(item => ({ product_id: item.id, quantity: item.cantidad }))
    };

    try {
        const res = await fetchAutenticado(`${API_URL}/orders/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            carrito = [];
            localStorage.removeItem("carrito");
            alert("Compra finalizada con éxito.");
            window.location.href = "confirmacion.html";
        } else {
            if (res.status === 401 || res.status === 403) {
                alert("Sesión expirada o no autorizada. Por favor, vuelve a iniciar sesión.");
                cerrarSesion();
            }
            const error = await res.json().catch(() => ({}));
            alert("Error al finalizar compra: " + (error.detail || `HTTP Error ${res.status}`));
        }
    } catch (error) {
        console.error("Error al enviar orden:", error);
        alert("Error al conectar con el servidor o token faltante. Asegúrate de estar logueado.");
    }
}

// ------------------------------
// REGISTER.HTML - REGISTRO (JSON - usa 'username' para el email)
// ------------------------------
async function registrarUsuario(event) {
    event.preventDefault();
    const email = document.getElementById("regEmail").value; 
    const password = document.getElementById("regPassword").value;

    console.log("Intentando registrar:", email);

    try {
        // FIX: Usamos 'username' para enviar el valor del email, tal como exige el backend para el registro.
        const res = await fetch(`${API_URL}/users/register`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password: password, role: "user" }) 
        });

        const data = await res.json();
        console.log("Respuesta registro:", data);

        if (res.ok) {
            alert("✅ " + (data.message || "Registro exitoso. Ahora puedes iniciar sesión."));
            window.location.href = "login.html";
        } else {
            if (res.status === 422) {
                alert("❌ Error de datos: Asegúrate que el email sea válido y la contraseña cumpla los requisitos. Detalle: " + JSON.stringify(data.detail));
            } else {
                 alert("❌ " + (data.detail || "Error al registrar usuario"));
            }
        }
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert("Error al conectar con el servidor. Verifica que esté corriendo en http://127.0.0.1:8000");
    }
}

// ------------------------------
// LOGIN.HTML - LOGIN (URL ENCODED - usa 'username' para el email)
// ------------------------------
async function loginUsuario(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("Intentando login:", email);

    // SOLUCIÓN FINAL: Usar URLSearchParams y Content-Type explícito para simular un formulario tradicional.
    const bodyParams = new URLSearchParams();
    bodyParams.append("username", email); // El email va en el campo 'username'
    bodyParams.append("password", password); // Debe ser 'password'

    const requestBody = bodyParams.toString();
    console.log("Cuerpo de la petición de Login (Encoded):", requestBody); // <-- Log de depuración

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                // ESTO ES CRUCIAL: Asegura que FastAPI reciba la codificación de formulario esperada.
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: requestBody
        });
        
        // Manejamos la respuesta como texto o JSON
        const responseText = await res.text();
        let data;
        try {
             data = JSON.parse(responseText);
        } catch (e) {
             data = { detail: "Respuesta del servidor no es JSON o está vacía." };
        }
        
        console.log("Respuesta login:", data);

        if (res.ok) {
            // Un login exitoso retorna el token directamente
            if (!data.access_token) {
                 alert("❌ Login fallido: El servidor no devolvió un token. Verifique la lógica del backend.");
                 return;
            }
            
            usuario = { 
                username: email, 
                user_id: data.user_id,
                role: data.role 
            };
            localStorage.setItem("usuario", JSON.stringify(usuario));
            
            localStorage.setItem("jwt", data.access_token); 
            
            alert("✅ Login exitoso");
            window.location.href = "index.html";
        } else {
            // Manejamos la salida para evitar el error de diccionario
            let errorMessage = "Error al iniciar sesión. Credenciales incorrectas o servidor caído.";
            if (data.detail) {
                if (Array.isArray(data.detail)) {
                    // Si el error es 401 (no autorizado)
                    if (res.status === 401) {
                         errorMessage = "Credenciales incorrectas (Usuario o Contraseña inválida).";
                    } else {
                        // Error de validación (422)
                        errorMessage = "Error de validación del formulario. Detalle: " + data.detail.map(d => d.msg).join(", ");
                    }
                } else {
                    // Manejo para errores generales (401, etc.)
                    if (data.detail === "Not authenticated") {
                        errorMessage = "Credenciales incorrectas (Usuario o Contraseña inválida).";
                    } else {
                        errorMessage = data.detail.toString();
                    }
                }
            } else if (res.status === 401) {
                errorMessage = "Credenciales incorrectas (Usuario o Contraseña inválida).";
            }
            alert("❌ " + errorMessage);
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
    
    const paginaActual = window.location.pathname.split('/').pop();

    // REDIRECCIÓN FORZADA: Si no hay usuario y no estamos ya en la página de login o registro, redirige.
    if (!usuario && paginaActual !== 'login.html' && paginaActual !== 'register.html') {
        console.log("Usuario no autenticado, forzando redirección a login.");
        window.location.href = "login.html";
        return; 
    }

    // Asignar eventos según la página actual
    if (paginaActual === 'index.html' || paginaActual === '') {
        cargarProductos();
        actualizarNavegacion();
    } else if (paginaActual === 'cart.html') {
        verificarAutenticacion();
        actualizarNavegacion();
        mostrarCarrito();
        const finalizarBtn = document.getElementById("finalizar");
        if (finalizarBtn) {
            finalizarBtn.addEventListener("click", finalizarCompra);
        }
    } else if (paginaActual === 'register.html') {
        actualizarNavegacion();
        const registerForm = document.getElementById("registerForm");
        if (registerForm) {
            registerForm.addEventListener("submit", registrarUsuario);
        }
    } else if (paginaActual === 'login.html') {
        actualizarNavegacion();
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", loginUsuario);
        }
    } else if (paginaActual === 'confirmacion.html') {
        actualizarNavegacion();
    } else {
        actualizarNavegacion();
    }
});