const prisma = require('../prismaClient');

const getAllSuppliers = async (req, res) => {
  try {
    const proveedores = await prisma.proveedores.findMany({
      orderBy: { creado_en: 'desc' }
    });

    res.json(proveedores);
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const proveedor = await prisma.proveedores.findUnique({
      where: { id: parseInt(id) }
    });

    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.json(proveedor);
  } catch (error) {
    console.error('Error obteniendo proveedor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { nombre, email, telefono, productos_suministra, direccion } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ 
        message: 'Nombre y email son campos obligatorios' 
      });
    }

    // Verificar si el email ya existe
    const existingSupplier = await prisma.proveedores.findUnique({
      where: { email }
    });

    if (existingSupplier) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const nuevoProveedor = await prisma.proveedores.create({
      data: {
        nombre,
        email,
        telefono,
        productos_suministra,
        direccion
      }
    });

    res.status(201).json({
      message: 'Proveedor creado exitosamente',
      supplier: nuevoProveedor
    });
  } catch (error) {
    console.error('Error creando proveedor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, productos_suministra, direccion } = req.body;

    const proveedorExistente = await prisma.proveedores.findUnique({
      where: { id: parseInt(id) }
    });

    if (!proveedorExistente) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Verificar si el email ya existe en otro proveedor
    if (email && email !== proveedorExistente.email) {
      const existingEmail = await prisma.proveedores.findUnique({
        where: { email }
      });

      if (existingEmail) {
        return res.status(400).json({ message: 'El email ya está en uso' });
      }
    }

    const proveedorActualizado = await prisma.proveedores.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        email,
        telefono,
        productos_suministra,
        direccion
      }
    });

    res.json({
      message: 'Proveedor actualizado exitosamente',
      supplier: proveedorActualizado
    });
  } catch (error) {
    console.error('Error actualizando proveedor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const proveedorExistente = await prisma.proveedores.findUnique({
      where: { id: parseInt(id) }
    });

    if (!proveedorExistente) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    await prisma.proveedores.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando proveedor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};