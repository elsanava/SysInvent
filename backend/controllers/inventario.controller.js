const prisma = require('../prismaClient');

// Obtener todos los movimientos de inventario
const getAllInventoryMovements = async (req, res) => {
  try {
    const movimientos = await prisma.movimientos_inventario.findMany({
      include: {
        productos: {
          select: { nombre: true, codigo: true }
        },
        usuarios: {
          select: { nombre: true }
      }
      },
      orderBy: { fecha: 'desc' }
    });

    res.json(movimientos);
  } catch (error) {
    console.error('Error obteniendo movimientos de inventario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener movimientos por producto
const getMovementsByProduct = async (req, res) => {
  try {
    const { producto_id } = req.params;

    const movimientos = await prisma.movimientos_inventario.findMany({
      where: { producto_id: parseInt(producto_id) },
      include: {
        productos: {
          select: { nombre: true, codigo: true }
        },
        usuarios: {
          select: { nombre: true }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    res.json(movimientos);
  } catch (error) {
    console.error('Error obteniendo movimientos por producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear un movimiento de inventario
const createInventoryMovement = async (req, res) => {
  try {
    const {
      producto_id,
      tipo,
      cantidad,
      fecha,
      motivo,
      notas,
      orden_id,
      tipo_orden,
      costo_unitario
    } = req.body;

    // Validaciones
    if (!producto_id || !tipo || !cantidad || !fecha || !motivo) {
      return res.status(400).json({ 
        message: 'Producto, tipo, cantidad, fecha y motivo son campos obligatorios' 
      });
    }

    if (!['entry', 'exit'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo debe ser "entry" o "exit"' });
    }

    const producto = await prisma.productos.findUnique({
      where: { id: parseInt(producto_id) }
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const stock_anterior = producto.stock_actual;
    let stock_actual = stock_anterior;

    if (tipo === 'entry') {
      stock_actual += parseInt(cantidad);
    } else if (tipo === 'exit') {
      if (stock_anterior < cantidad) {
        return res.status(400).json({ 
          message: 'Stock insuficiente para realizar la salida' 
        });
      }
      stock_actual -= parseInt(cantidad);
    }

    const costo_total = parseFloat(costo_unitario || producto.costo) * parseInt(cantidad);

    // Crear el movimiento
    const movimiento = await prisma.movimientos_inventario.create({
      data: {
        producto_id: parseInt(producto_id),
        tipo,
        cantidad: parseInt(cantidad),
        fecha: new Date(fecha),
        motivo,
        notas,
        usuario_id: req.user.id,
        orden_id: orden_id ? parseInt(orden_id) : null,
        tipo_orden,
        stock_anterior,
        stock_actual,
        costo_unitario: parseFloat(costo_unitario || producto.costo),
        costo_total
      },
      include: {
        productos: {
          select: { nombre: true, codigo: true }
        },
        usuarios: {
          select: { nombre: true }
        }
      }
    });

    // Actualizar el stock del producto
    await prisma.productos.update({
      where: { id: parseInt(producto_id) },
      data: { stock_actual }
    });

    res.status(201).json({
      message: 'Movimiento de inventario creado exitosamente',
      movement: movimiento
    });

  } catch (error) {
    console.error('Error creando movimiento de inventario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Ajuste de inventario
const adjustInventory = async (req, res) => {
  try {
    const { producto_id, tipo, cantidad, fecha, motivo, notas } = req.body;

    if (!producto_id || !tipo || !cantidad || !fecha || !motivo) {
      return res.status(400).json({ 
        message: 'Producto, tipo, cantidad, fecha y motivo son campos obligatorios' 
      });
    }

    const producto = await prisma.productos.findUnique({
      where: { id: parseInt(producto_id) }
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const stock_anterior = producto.stock_actual;
    let stock_actual = stock_anterior;

    if (tipo === 'entry') {
      stock_actual += parseInt(cantidad);
    } else if (tipo === 'exit') {
      stock_actual -= parseInt(cantidad);
      if (stock_actual < 0) {
        return res.status(400).json({ message: 'El stock no puede ser negativo' });
      }
    } else {
      return res.status(400).json({ message: 'Tipo debe ser "entry" o "exit"' });
    }

    // Crear ajuste de inventario
    const ajuste = await prisma.ajustes_inventario.create({
      data: {
        producto_id: parseInt(producto_id),
        tipo,
        cantidad: parseInt(cantidad),
        fecha: new Date(fecha),
        motivo,
        notas,
        usuario_id: req.user.id,
        stock_anterior,
        stock_actual
      }
    });

    // Actualizar stock del producto
    await prisma.productos.update({
      where: { id: parseInt(producto_id) },
      data: { stock_actual }
    });

    // También crear un movimiento de inventario
    await prisma.movimientos_inventario.create({
      data: {
        producto_id: parseInt(producto_id),
        tipo,
        cantidad: parseInt(cantidad),
        fecha: new Date(fecha),
        motivo: `Ajuste: ${motivo}`,
        notas,
        usuario_id: req.user.id,
        stock_anterior,
        stock_actual,
        costo_unitario: producto.costo,
        costo_total: producto.costo * parseInt(cantidad)
      }
    });

    res.status(201).json({
      message: 'Ajuste de inventario realizado exitosamente',
      adjustment: ajuste
    });

  } catch (error) {
    console.error('Error realizando ajuste de inventario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllInventoryMovements,
  getMovementsByProduct,
  createInventoryMovement,
  adjustInventory
};