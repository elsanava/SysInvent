const prisma = require('../prismaClient');

const getAllWarehouses = async (req, res) => {
  try {
    const almacenes = await prisma.almacenes.findMany({
      orderBy: { nombre: 'asc' }
    });

    res.json(almacenes);
  } catch (error) {
    console.error('Error obteniendo almacenes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const almacen = await prisma.almacenes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!almacen) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }

    res.json(almacen);
  } catch (error) {
    console.error('Error obteniendo almacén:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createWarehouse = async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad, responsable, descripcion } = req.body;

    if (!nombre || !ubicacion || !responsable) {
      return res.status(400).json({ 
        message: 'Nombre, ubicación y responsable son campos obligatorios' 
      });
    }

    const nuevoAlmacen = await prisma.almacenes.create({
      data: {
        nombre,
        ubicacion,
        capacidad: parseInt(capacidad) || 0,
        responsable,
        descripcion
      }
    });

    res.status(201).json({
      message: 'Almacén creado exitosamente',
      warehouse: nuevoAlmacen
    });
  } catch (error) {
    console.error('Error creando almacén:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ubicacion, capacidad, responsable, descripcion } = req.body;

    const almacenExistente = await prisma.almacenes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!almacenExistente) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }

    const almacenActualizado = await prisma.almacenes.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        ubicacion,
        capacidad: parseInt(capacidad) || 0,
        responsable,
        descripcion
      }
    });

    res.json({
      message: 'Almacén actualizado exitosamente',
      warehouse: almacenActualizado
    });
  } catch (error) {
    console.error('Error actualizando almacén:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const almacenExistente = await prisma.almacenes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!almacenExistente) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }

    // Verificar si hay productos en este almacén
    const productosEnAlmacen = await prisma.productos.findMany({
      where: { almacen_id: parseInt(id) },
      take: 1
    });

    if (productosEnAlmacen.length > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el almacén porque hay productos asociados' 
      });
    }

    await prisma.almacenes.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Almacén eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando almacén:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
};