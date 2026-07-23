const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// Importar función para obtener datos de Open Food Facts
const {obtenerDatos} = require('./codigos');

module.exports = function (db) {
  /**
   * GET /api/productos
   * Obtiene todos los productos de la despensa
   */
  router.get('/', async (req, res) => {
    try {
      // TODO: implementar lógica de obtención de productos
      const productos = await db.collection('productos').find({}).toArray();
      res.json(productos);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  });

  /**
   * POST /api/productos
   * Crea un nuevo producto
   */
  router.post('/', async (req, res) => {
    try {
      const { nombre, cantidad, categoria, fechaVencimiento, imagen, codigoBarras, marca } = req.body;
      let datosProducto = null;

      if (codigoBarras){
        try {
          // Si se proporciona un código de barras, buscar información del producto en Open Food Facts
        datosProducto = await obtenerDatos(codigoBarras);
        } catch(error){
          console.log('Error al obtener datos de Open Food Facts');
        }
      }
      
      const nuevoProducto = {
        // Si se encontró información del producto, usarla, de lo contrario, usar los datos proporcionados por el usuario (??)
        nombre : datosProducto?.nombre ?? nombre,
        cantidad :cantidad,
        categoria,
        fechaVencimiento,
        imagen: datosProducto?.imagen ?? imagen,
        marca: datosProducto?.marca ?? marca,
      };

      const resultado = await db.collection('productos').insertOne(nuevoProducto);
      // Devolver el producto creado con su ID generado por MongoDB
      res.status(201).json({ ...nuevoProducto, _id: resultado.insertedId });

    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  });

  /**
   * PUT /api/productos/:id
   * Actualiza un producto (cantidad, datos, etc.)
   */
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;
      //Actualizar la cantidad del producto en la base de datos
          // Si la nueva cantidad es 0, eliminar el producto de la base de datos
          if (cantidad === 0){
            await db.collection('productos').deleteOne({ _id: new ObjectId(id) });
          // Si la cantidad es mayor a 0, actualizar la cantidad del producto
          }else{
            await db.collection('productos').updateOne(
              { _id: new ObjectId(id) },
              { $set: { cantidad: cantidad } }
            );
          }
      //Respuesta al cliente con el mensaje de éxito
      res.json({ mensaje: 'Producto actualizado', id, cantidad });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  });

  /**
   * DELETE /api/productos/:id
   * Elimina un producto
   */
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Eliminar el producto de la base de datos
      await db.collection('productos').deleteOne({ _id: new ObjectId(id) });

      res.json({ mensaje: 'Producto eliminado', id });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  });

  return router;
};
