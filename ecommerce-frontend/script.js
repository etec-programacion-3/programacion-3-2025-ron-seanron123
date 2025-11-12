const contenedor = document.getElementById("productos-container");

async function cargarProductos() {
    try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/products/");
        if (!respuesta.ok) throw new Error("Error al obtener los productos");

        const productos = await respuesta.json();

        if (productos.length === 0) {
            contenedor.innerHTML = "<p>No hay productos cargados.</p>";
            return;
        }

        contenedor.innerHTML = ""; // Limpia el "Cargando..."

        productos.forEach(prod => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${prod.image_url || 'https://via.placeholder.com/150'}" alt="${prod.name}">
                <h3>${prod.name}</h3>
                <p>${prod.description}</p>
                <p><strong>$${prod.price}</strong></p>
                <button>Agregar al carrito</button>
            `;
            contenedor.appendChild(card);
        });
    } catch (error) {
        console.error("⚠️ Error al cargar productos:", error);
        contenedor.innerHTML = "<p style='color:red;'>Error al cargar los productos.</p>";
    }
}

cargarProductos();