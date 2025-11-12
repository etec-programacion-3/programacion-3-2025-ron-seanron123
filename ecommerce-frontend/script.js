const API_URL = "http://127.0.0.1:8000/api";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// === LISTAR PRODUCTOS ===
if (document.getElementById("productos")) {
  fetch(${API_URL}/products)
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("productos");
      data.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <p><strong>$${p.price}</strong></p>
          <button onclick="agregarAlCarrito(${p.id}, '${p.name}', ${p.price})">Agregar al carrito</button>
        `;
        contenedor.appendChild(card);
      });
    })
    .catch(err => console.error("Error al obtener productos:", err));
}

// === AGREGAR AL CARRITO ===
function agregarAlCarrito(id, nombre, precio) {
  const item = carrito.find(p => p.id === id);
  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1 });
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert("Producto agregado al carrito 🛒");
}

// === MOSTRAR CARRITO ===
if (document.getElementById("carrito")) {
  const contenedor = document.getElementById("carrito");
  let total = 0;
  carrito.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = <p>${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}</p>;
    contenedor.appendChild(div);
    total += p.precio * p.cantidad;
  });
  const totalElem = document.getElementById("total");
  if (totalElem) totalElem.innerText = Total: $${total};
}

// === FINALIZAR COMPRA ===
if (document.getElementById("finalizar")) {
  document.getElementById("finalizar").addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Debes iniciar sesión para finalizar la compra");
      window.location.href = "login.html";
      return;
    }

    try {
      const res = await fetch(${API_URL}/orders, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": Bearer ${token}
        },
        body: JSON.stringify({ items: carrito })
      });

      if (res.ok) {
        localStorage.removeItem("carrito");
        window.location.href = "confirmacion.html";
      } else {
        alert("❌ Error al procesar la compra");
      }
    } catch (error) {
      console.error("Error en la compra:", error);
    }
  });
}

// === LOGIN ===
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(${API_URL}/auth/login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        alert("✅ Inicio de sesión exitoso");
        window.location.href = "index.html";
      } else {
        alert("❌ Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en login:", error);
    }
  });
}

// === REGISTRO ===
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    try {
      const res = await fetch(${API_URL}/auth/register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        alert("✅ Registro exitoso. Ahora inicia sesión.");
        window.location.href = "login.html";
      } else {
        alert("❌ Error al registrarse (puede que el correo ya exista)");
      }
    } catch (error) {
      console.error("Error en registro:", error);
    }
  });
}