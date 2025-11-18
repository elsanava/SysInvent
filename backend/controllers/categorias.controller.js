const prisma = require('../prismaClient');

const getAllCategories = async (req, res) => {
  try {
    const categorias = await prisma.categorias.findMany({
      orderBy: { nombre: 'asc' }
    });

    res.json(categorias);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.categorias.findUnique({
      where: { id: parseInt(id) }
    });

    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json(categoria);
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }

    // Verificar si la categoría ya existe
    const existingCategory = await prisma.categorias.findFirst({
      where: { nombre }
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }

    const nuevaCategoria = await prisma.categorias.create({
      data: {
        nombre,
        descripcion
      }
    });

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category: nuevaCategoria
    });
  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const categoriaExistente = await prisma.categorias.findUnique({
      where: { id: parseInt(id) }
    });

    if (!categoriaExistente) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Verificar si el nombre ya existe en otra categoría
    if (nombre && nombre !== categoriaExistente.nombre) {
      const existingName = await prisma.categorias.findFirst({
        where: { nombre }
      });

      if (existingName) {
        return res.status(400).json({ message: 'El nombre ya está en uso' });
      }
    }

    const categoriaActualizada = await prisma.categorias.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        descripcion
      }
    });

    res.json({
      message: 'Categoría actualizada exitosamente',
      category: categoriaActualizada
    });
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const categoriaExistente = await prisma.categorias.findUnique({
      where: { id: parseInt(id) }
    });

    if (!categoriaExistente) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Verificar si hay productos usando esta categoría
    const productosConCategoria = await prisma.productos.findMany({
      where: { categoria_id: parseInt(id) },
      take: 1
    });

    if (productosConCategoria.length > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar la categoría porque hay productos asociados' 
      });
    }

    await prisma.categorias.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};