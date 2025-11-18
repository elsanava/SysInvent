const prisma = require('../prismaClient');

const getAllClients = async (req, res) => {
  try {
    const clientes = await prisma.clientes.findMany({
      orderBy: { creado_en: 'desc' }
    });

    res.json(clientes);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.clientes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createClient = async (req, res) => {
  try {
    const { nombre, email, telefono, tipo, direccion } = req.body;

    if (!nombre || !email || !tipo) {
      return res.status(400).json({ 
        message: 'Nombre, email y tipo son campos obligatorios' 
      });
    }

    // Verificar si el email ya existe
    const existingClient = await prisma.clientes.findUnique({
      where: { email }
    });

    if (existingClient) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const nuevoCliente = await prisma.clientes.create({
      data: {
        nombre,
        email,
        telefono,
        tipo,
        direccion
      }
    });

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      client: nuevoCliente
    });
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, tipo, direccion } = req.body;

    const clienteExistente = await prisma.clientes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!clienteExistente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar si el email ya existe en otro cliente
    if (email && email !== clienteExistente.email) {
      const existingEmail = await prisma.clientes.findUnique({
        where: { email }
      });

      if (existingEmail) {
        return res.status(400).json({ message: 'El email ya está en uso' });
      }
    }

    const clienteActualizado = await prisma.clientes.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        email,
        telefono,
        tipo,
        direccion
      }
    });

    res.json({
      message: 'Cliente actualizado exitosamente',
      client: clienteActualizado
    });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const clienteExistente = await prisma.clientes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!clienteExistente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    await prisma.clientes.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};