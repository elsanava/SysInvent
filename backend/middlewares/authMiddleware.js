const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'sysinvent-secret-key';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const usuario = await prisma.usuarios.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true
      }
    });

    if (!usuario || usuario.estado !== 'Activo') {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    req.user = usuario;
    next();
  } catch (error) {
    console.error('Error en auth middleware:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;