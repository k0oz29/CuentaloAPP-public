// @ts-nocheck
const express = require('express');
const router = express.Router();

/**
 * Consulta la informacion de un producto en Open Food Facts.
 * @param {string} codigo - Codigo de barras del producto.
 * @returns {Object|null} Datos del producto o null si hubo un error.
 */

async function obtenerDatos(codigo) {
  try {
    // Construir la URL de la API de Open Food Facts
    const url = `https://world.openfoodfacts.org/api/v2/product/${codigo}.json`;
    // Realizar la solicitud a la API
    const response = await fetch(url);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error('Error al consultar Open Food Facts');
      return null;
    }

    const data = await response.json();
    //Status 1 significa que el producto fue encontrado, status 0 significa que no fue encontrado
    if (data.status === 1 && data.product) {
      const producto = data.product;
      return {
        encontrado: true,
        nombre: producto.product_name_es || producto.product_name || null,
        marca: producto.brands_tags?.[0] || producto.brands || null,
        imagen: producto.image_url || null
      };
    }
    //Producto no encontrado en Open Food Facts
    return {
      encontrado: false,
      nombre: null,
      marca: null,
      imagen: null
    };
  } catch (error) {
    console.error('Error al buscar codigo de barras:', error);
    return null;
  }
}

/**
 * GET /api/buscar-codigo/:codigo
 * Busca informacion de un producto por su codigo de barras.
 * El frontend envia el codigo, el backend consulta Open Food Facts.
 */
module.exports = function () {
  router.get('/:codigo', async (req, res) => {
    try {
      const { codigo } = req.params;
      const datos = await obtenerDatos(codigo);

      if (!datos) {
        return res.status(500).json({ error: 'Error al buscar codigo de barras' });
      }

      res.json(datos);
    } catch (error) {
      console.error('Error al buscar codigo de barras:', error);
      res.status(500).json({ error: 'Error al buscar codigo de barras' });
    }
  });

  return router;
};

// Exportamos la funcion para usarla en otros archivos
module.exports.obtenerDatos = obtenerDatos;
