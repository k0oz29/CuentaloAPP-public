/**
 * Comunicacion con el backend
 */

const API = {
  // Localhost para desarrollo, Render para produccion
  BASE_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://TU-URL-RENDER/api',  // <-- CAMBIAR por tu URL de Render

  /**
   * Realiza una peticion al backend
   */
  async request(endpoint, options = {}) {
    const url = `${this.BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en API:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los productos
   */
  async getProducts() {
    return this.request('/productos');
  },

  /**
   * Crea un nuevo producto
   */
  async createProduct(product) {
    return this.request('/productos', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },

  /**
   * Actualiza la cantidad de un producto
   */
  async updateQuantity(id, quantity) {
    return this.request(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidad: quantity })
    });
  },

  /**
   * Elimina un producto
   */
  async deleteProduct(id) {
    return this.request(`/productos/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Busca informacion de un codigo de barras
   */
  async searchBarcode(barcode) {
    return this.request(`/buscar-codigo/${barcode}`);
  }
};
