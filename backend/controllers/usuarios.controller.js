const prisma = require('../prismaClient');
const { hashPassword } = require('../utils/passwordHash'); // Añadir esta línea

const getAllUsers = async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        ultimo_acceso: true,
        creado_en: true,
        actualizado_en: true
      },
      orderBy: { creado_en: 'desc' }
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuarios.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        ultimo_acceso: true,
        creado_en: true,
        actualizado_en: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createUser = async (req, res) => {
  try {
    const { nombre, email, password, rol, estado = 'Activo' } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const existingUser = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashedPassword = await hashPassword(password); // Usar la función de hash

    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol,
        estado
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        creado_en: true
      }
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: nuevoUsuario
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol, estado } = req.body;

    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const updateData = { nombre, email, rol, estado };

    if (password) {
      updateData.password = await hashPassword(password); // Usar la función de hash
    }

    const usuarioActualizado = await prisma.usuarios.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        actualizado_en: true
      }
    });

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: usuarioActualizado
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
    }

    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await prisma.usuarios.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};