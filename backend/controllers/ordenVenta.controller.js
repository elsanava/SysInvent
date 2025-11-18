const prisma = require('../prismaClient');
const { generateOrderNumber } = require('../utils/generateOrderNumber');

const getAllSalesOrders = async (req, res) => {
  try {
    const ordenes = await prisma.ordenes_venta.findMany({
      include: {
        clientes: {
          select: { nombre: true, email: true }
        },
        usuarios: {
          select: { nombre: true }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    res.json(ordenes);
  } catch (error) {
    console.error('Error obteniendo órdenes de venta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getSalesOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orden = await prisma.ordenes_venta.findUnique({
      where: { id: parseInt(id) },
      include: {
        clientes: {
          select: { id: true, nombre: true, email: true, telefono: true }
        },
        usuarios: {
          select: { nombre: true }
        }
      }
    });

    if (!orden) {
      return res.status(404).json({ message: 'Orden de venta no encontrada' });
    }

    res.json(orden);
  } catch (error) {
    console.error('Error obteniendo orden de venta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createSalesOrder = async (req, res) => {
  try {
    const { cliente_id, fecha, estado, notas, items } = req.body;

    if (!cliente_id || !fecha || !items || items.length === 0) {
      return res.status(400).json({ 
        message: 'Cliente, fecha y items son campos obligatorios' 
      });
    }

    // Verificar stock si la orden se va a completar
    if (estado === 'Completada') {
      for (const item of items) {
        const producto = await prisma.productos.findUnique({
          where: { id: item.producto_id }
        });

        if (!producto || producto.stock_actual < item.cantidad) {
          return res.status(400).json({ 
            message: `Stock insuficiente para el producto: ${producto?.nombre || 'ID ' + item.producto_id}` 
          });
        }
      }
    }

    // Calcular subtotal, impuesto y total
    let subtotal = 0;
    const orderItems = items.map(item => {
      const itemSubtotal = item.cantidad * item.precio_unitario;
      subtotal += itemSubtotal;

      return {
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: itemSubtotal
      };
    });

    const impuesto = subtotal * 0.16; // 16% de IVA
    const total = subtotal + impuesto;

    const nuevaOrden = await prisma.ordenes_venta.create({
      data: {
        numero_orden: generateOrderNumber('OV'),
        cliente_id: parseInt(cliente_id),
        fecha: new Date(fecha),
        subtotal,
        impuesto,
        total,
        estado: estado || 'Pendiente',
        notas,
        usuario_id: req.user.id
      },
      include: {
        clientes: {
          select: { nombre: true }
        },
        usuarios: {
          select: { nombre: true }
        }
      }
    });

    // Crear items de la orden de venta
    for (const item of orderItems) {
      await prisma.orden_venta_items.create({
        data: {
          orden_venta_id: nuevaOrden.id,
          ...item
        }
      });
    }

    // Si la orden se completa, actualizar inventario
    if (estado === 'Completada') {
      for (const item of items) {
        // Crear movimiento de salida
        const producto = await prisma.productos.findUnique({
          where: { id: item.producto_id }
        });

        await prisma.movimientos_inventario.create({
          data: {
            producto_id: item.producto_id,
            tipo: 'exit',
            cantidad: item.cantidad,
            fecha: new Date(fecha),
            motivo: `Venta - Orden #${nuevaOrden.numero_orden}`,
            notas: `Venta realizada a través de orden de venta`,
            usuario_id: req.user.id,
            orden_id: nuevaOrden.id,
            tipo_orden: 'sales',
            stock_anterior: producto.stock_actual,
            stock_actual: producto.stock_actual - item.cantidad,
            costo_unitario: producto.costo,
            costo_total: producto.costo * item.cantidad
          }
        });

        // Actualizar stock
        await prisma.productos.update({
          where: { id: item.producto_id },
          data: {
            stock_actual: producto.stock_actual - item.cantidad
          }
        });
      }
    }

    // Obtener la orden completa con items
    const ordenCompleta = await prisma.ordenes_venta.findUnique({
      where: { id: nuevaOrden.id },
      include: {
        clientes: {
          select: { nombre: true }
        },
        usuarios: {
          select: { nombre: true }
        }
      }
    });

    res.status(201).json({
      message: 'Orden de venta creada exitosamente',
      order: ordenCompleta
    });

  } catch (error) {
    console.error('Error creando orden de venta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente_id, fecha, estado, notas } = req.body;

    const ordenExistente = await prisma.ordenes_venta.findUnique({
      where: { id: parseInt(id) }
    });

    if (!ordenExistente) {
      return res.status(404).json({ message: 'Orden de venta no encontrada' });
    }

    const ordenActualizada = await prisma.ordenes_venta.update({
      where: { id: parseInt(id) },
      data: {
        cliente_id: parseInt(cliente_id),
        fecha: new Date(fecha),
        estado,
        notas
      },
      include: {
        clientes: {
          select: { nombre: true }
        },
        usuarios: {
          select: { nombre: true }
        }
      }
    });

    res.json({
      message: 'Orden de venta actualizada exitosamente',
      order: ordenActualizada
    });

  } catch (error) {
    console.error('Error actualizando orden de venta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const ordenExistente = await prisma.ordenes_venta.findUnique({
      where: { id: parseInt(id) }
    });

    if (!ordenExistente) {
      return res.status(404).json({ message: 'Orden de venta no encontrada' });
    }

    await prisma.ordenes_venta.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Orden de venta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando orden de venta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder
};