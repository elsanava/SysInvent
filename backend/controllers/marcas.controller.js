const prisma = require('../prismaClient');

const getAllBrands = async (req, res) => {
  try {
    const marcas = await prisma.marcas.findMany({
      orderBy: { nombre: 'asc' }
    });

    res.json(marcas);
  } catch (error) {
    console.error('Error obteniendo marcas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const marca = await prisma.marcas.findUnique({
      where: { id: parseInt(id) }
    });

    if (!marca) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    res.json(marca);
  } catch (error) {
    console.error('Error obteniendo marca:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createBrand = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }

    // Verificar si la marca ya existe
    const existingBrand = await prisma.marcas.findUnique({
      where: { nombre }
    });

    if (existingBrand) {
      return res.status(400).json({ message: 'La marca ya existe' });
    }

    const nuevaMarca = await prisma.marcas.create({
      data: {
        nombre,
        descripcion
      }
    });

    res.status(201).json({
      message: 'Marca creada exitosamente',
      brand: nuevaMarca
    });
  } catch (error) {
    console.error('Error creando marca:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const marcaExistente = await prisma.marcas.findUnique({
      where: { id: parseInt(id) }
    });

    if (!marcaExistente) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    // Verificar si el nombre ya existe en otra marca
    if (nombre && nombre !== marcaExistente.nombre) {
      const existingName = await prisma.marcas.findUnique({
        where: { nombre }
      });

      if (existingName) {
        return res.status(400).json({ message: 'El nombre ya está en uso' });
      }
    }

    const marcaActualizada = await prisma.marcas.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        descripcion
      }
    });

    res.json({
      message: 'Marca actualizada exitosamente',
      brand: marcaActualizada
    });
  } catch (error) {
    console.error('Error actualizando marca:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const marcaExistente = await prisma.marcas.findUnique({
      where: { id: parseInt(id) }
    });

    if (!marcaExistente) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    // Verificar si hay productos usando esta marca
    const productosConMarca = await prisma.productos.findMany({
      where: { marcas_id: parseInt(id) },
      take: 1
    });

    if (productosConMarca.length > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar la marca porque hay productos asociados' 
      });
    }

    await prisma.marcas.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Marca eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando marca:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};