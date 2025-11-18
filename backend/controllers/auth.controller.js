const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { hashPassword, comparePassword } = require('../utils/passwordHash'); // Añadir esta línea

const JWT_SECRET = process.env.JWT_SECRET || 'sysinvent-secret-key';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (usuario.estado !== 'Activo') {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    const isPasswordValid = await comparePassword(password, usuario.password); // Usar comparePassword

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Actualizar último acceso
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { ultimo_acceso: new Date() }
    });

    const token = jwt.sign(
      { 
        userId: usuario.id, 
        email: usuario.email,
        rol: usuario.rol 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const register = async (req, res) => {
  try {
    const { nombre, email, password, rol = 'Usuario' } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const existingUser = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashedPassword = await hashPassword(password); // Usar hashPassword

    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol,
        estado: 'Activo'
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        creado_en: true
      }
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: nuevoUsuario
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        ultimo_acceso: true,
        creado_en: true
      }
    });

    res.json(usuario);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  login,
  register,
  getProfile
};