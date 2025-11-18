const prisma = require('../prismaClient');

const getAllUnits = async (req, res) => {
  try {
    const unidades = await prisma.unidades_medida.findMany({
      orderBy: { nombre: 'asc' }
    });

    res.json(unidades);
  } catch (error) {
    console.error('Error obteniendo unidades:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;

    const unidad = await prisma.unidades_medida.findUnique({
      where: { id: parseInt(id) }
    });

    if (!unidad) {
      return res.status(404).json({ message: 'Unidad no encontrada' });
    }

    res.json(unidad);
  } catch (error) {
    console.error('Error obteniendo unidad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createUnit = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }

    // Verificar si la unidad ya existe
    const existingUnit = await prisma.unidades_medida.findUnique({
      where: { nombre }
    });

    if (existingUnit) {
      return res.status(400).json({ message: 'La unidad ya existe' });
    }

    const nuevaUnidad = await prisma.unidades_medida.create({
      data: { nombre }
    });

    res.status(201).json({
      message: 'Unidad creada exitosamente',
      unit: nuevaUnidad
    });
  } catch (error) {
    console.error('Error creando unidad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const unidadExistente = await prisma.unidades_medida.findUnique({
      where: { id: parseInt(id) }
    });

    if (!unidadExistente) {
      return res.status(404).json({ message: 'Unidad no encontrada' });
    }

    // Verificar si el nombre ya existe en otra unidad
    if (nombre && nombre !== unidadExistente.nombre) {
      const existingName = await prisma.unidades_medida.findUnique({
        where: { nombre }
      });

      if (existingName) {
        return res.status(400).json({ message: 'El nombre ya está en uso' });
      }
    }

    const unidadActualizada = await prisma.unidades_medida.update({
      where: { id: parseInt(id) },
      data: { nombre }
    });

    res.json({
      message: 'Unidad actualizada exitosamente',
      unit: unidadActualizada
    });
  } catch (error) {
    console.error('Error actualizando unidad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const unidadExistente = await prisma.unidades_medida.findUnique({
      where: { id: parseInt(id) }
    });

    if (!unidadExistente) {
      return res.status(404).json({ message: 'Unidad no encontrada' });
    }

    // Verificar si hay productos usando esta unidad
    const productosConUnidad = await prisma.productos.findMany({
      where: { unidad_id: parseInt(id) },
      take: 1
    });

    if (productosConUnidad.length > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar la unidad porque hay productos asociados' 
      });
    }

    await prisma.unidades_medida.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Unidad eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando unidad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit
};