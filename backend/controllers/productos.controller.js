const prisma = require('../prismaClient');

const getAllProducts = async (req, res) => {
  try {
    const productos = await prisma.productos.findMany({
      include: {
        categorias: {
          select: { nombre: true }
        },
        marcas: {
          select: { nombre: true }
        },
        unidades_medida: {
          select: { nombre: true }
        },
        almacenes: {
          select: { nombre: true }
        }
      },
      orderBy: { creado_en: 'desc' }
    });

    res.json(productos);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await prisma.productos.findUnique({
      where: { id: parseInt(id) },
      include: {
        categorias: {
          select: { id: true, nombre: true }
        },
        marcas: {
          select: { id: true, nombre: true }
        },
        unidades_medida: {
          select: { id: true, nombre: true }
        },
        almacenes: {
          select: { id: true, nombre: true }
        }
      }
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(producto);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      categoria_id,
      subcategoria,
      descripcion,
      precio,
      costo,
      unidad_id,
      marcas_id,
      stock_minimo,
      stock_maximo,
      almacen_id,
      gestionado = true,
      estado = 'Disponible'
    } = req.body;

    // Validar campos requeridos
    if (!codigo || !nombre || !categoria_id || !unidad_id || !marcas_id || !almacen_id) {
      return res.status(400).json({ 
        message: 'Campos obligatorios: código, nombre, categoría, unidad, marca, almacén' 
      });
    }

    // Verificar si el código ya existe
    const existingProduct = await prisma.productos.findUnique({
      where: { codigo }
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'El código del producto ya existe' });
    }

    const nuevoProducto = await prisma.productos.create({
      data: {
        codigo,
        nombre,
        categoria_id: parseInt(categoria_id),
        subcategoria,
        descripcion,
        precio: parseFloat(precio),
        costo: parseFloat(costo),
        unidad_id: parseInt(unidad_id),
        marcas_id: parseInt(marcas_id),
        stock_minimo: parseInt(stock_minimo) || 0,
        stock_maximo: parseInt(stock_maximo) || 0,
        almacen_id: parseInt(almacen_id),
        gestionado,
        estado,
        stock_actual: 0
      },
      include: {
        categorias: {
          select: { nombre: true }
        },
        marcas: {
          select: { nombre: true }
        },
        unidades_medida: {
          select: { nombre: true }
        },
        almacenes: {
          select: { nombre: true }
        }
      }
    });

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: nuevoProducto
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo,
      nombre,
      categoria_id,
      subcategoria,
      descripcion,
      precio,
      costo,
      unidad_id,
      marcas_id,
      stock_minimo,
      stock_maximo,
      almacen_id,
      gestionado,
      estado
    } = req.body;

    const productoExistente = await prisma.productos.findUnique({
      where: { id: parseInt(id) }
    });

    if (!productoExistente) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el código ya existe en otro producto
    if (codigo && codigo !== productoExistente.codigo) {
      const existingCode = await prisma.productos.findUnique({
        where: { codigo }
      });

      if (existingCode) {
        return res.status(400).json({ message: 'El código ya está en uso' });
      }
    }

    const updateData = {};
    if (codigo) updateData.codigo = codigo;
    if (nombre) updateData.nombre = nombre;
    if (categoria_id) updateData.categoria_id = parseInt(categoria_id);
    if (subcategoria !== undefined) updateData.subcategoria = subcategoria;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (precio) updateData.precio = parseFloat(precio);
    if (costo) updateData.costo = parseFloat(costo);
    if (unidad_id) updateData.unidad_id = parseInt(unidad_id);
    if (marcas_id) updateData.marcas_id = parseInt(marcas_id);
    if (stock_minimo) updateData.stock_minimo = parseInt(stock_minimo);
    if (stock_maximo) updateData.stock_maximo = parseInt(stock_maximo);
    if (almacen_id) updateData.almacen_id = parseInt(almacen_id);
    if (gestionado !== undefined) updateData.gestionado = gestionado;
    if (estado) updateData.estado = estado;

    const productoActualizado = await prisma.productos.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        categorias: {
          select: { nombre: true }
        },
        marcas: {
          select: { nombre: true }
        },
        unidades_medida: {
          select: { nombre: true }
        },
        almacenes: {
          select: { nombre: true }
        }
      }
    });

    res.json({
      message: 'Producto actualizado exitosamente',
      product: productoActualizado
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const productoExistente = await prisma.productos.findUnique({
      where: { id: parseInt(id) }
    });

    if (!productoExistente) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await prisma.productos.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};