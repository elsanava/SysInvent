const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Cargar variables de entorno
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const productosRoutes = require('./routes/productos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const marcasRoutes = require('./routes/marcas.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const unidadesRoutes = require('./routes/unidades.routes');
const almacenesRoutes = require('./routes/almacenes.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const ordenCompraRoutes = require('./routes/ordenCompra.routes');
const ordenVentaRoutes = require('./routes/ordenVenta.routes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/unidades', unidadesRoutes);
app.use('/api/almacen', almacenesRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ordenes-compra', ordenCompraRoutes);
app.use('/api/ordenes-venta', ordenVentaRoutes);

// Ruta de salud/health check
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      message: 'SysInvent API funcionando correctamente',
      database: 'Conectado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'API funcionando pero error en base de datos',
      database: 'Desconectado',
      error: error.message
    });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a SysInvent API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      productos: '/api/productos',
      clientes: '/api/clientes',
      proveedores: '/api/proveedores',
      marcas: '/api/marcas',
      categorias: '/api/categorias',
      unidades: '/api/unidades',
      almacenes: '/api/almacen',
      inventario: '/api/inventario',
      ordenes_compra: '/api/ordenes-compra',
      ordenes_venta: '/api/ordenes-venta'
    }
  });
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);

  // Error de validación de Prisma
  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({ 
      message: 'Datos de entrada inválidos'
    });
  }

  // Error de constraint de Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(400).json({ 
        message: 'El registro ya existe'
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        message: 'Registro no encontrado'
      });
    }
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Token inválido' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expirado' 
    });
  }

  // Error por defecto
  res.status(500).json({
    message: 'Error interno del servidor'
  });
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('Recibido SIGINT. Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Recibido SIGTERM. Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log('SysInvent API Server');
  console.log('=================================');
  console.log(`Puerto: ${PORT}`);
  console.log(` Base de datos: ${process.env.DB_NAME}`);
  console.log(`Iniciado: ${new Date().toLocaleString()}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log('=================================');
});

module.exports = { app, server, prisma };