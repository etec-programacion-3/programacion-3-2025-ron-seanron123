const API_URL = "http://127.0.0.1:8000/api/products";

export async function fetchProducts() {
  const response = await fetch(API_URL);
  const data = await response.json();
  return data;
}

export async function fetchProductById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  const data = await response.json();
  return data;
}
