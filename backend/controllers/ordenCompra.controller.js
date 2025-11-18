const prisma = require('../prismaClient');
const { generateOrderNumber } = require('../utils/generateOrderNumber');

const getAllPurchaseOrders = async (req, res) => {
  try {
    const ordenes = await prisma.ordenes_compra.findMany({
      include: {
        proveedores: {
          select: { nombre: true, email: true }
        },
        usuarios: {
          select: { nombre: true }
        },
        orden_compra_items: {
          include: {
            productos: {
              select: { nombre: true, codigo: true }
            },
            almacenes: {
              select: { nombre: true }
            }
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    res.json(ordenes);
  } catch (error) {
    console.error('Error obteniendo órdenes de compra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orden = await prisma.ordenes_compra.findUnique({
      where: { id: parseInt(id) },
      include: {
        proveedores: {
          select: { id: true, nombre: true, email: true, telefono: true }
        },
        usuarios: {
          select: { nombre: true }
        },
        orden_compra_items: {
          include: {
            productos: {
              select: { id: true, nombre: true, codigo: true, precio: true, costo: true }
            },
            almacenes: {
              select: { id: true, nombre: true }
            }
          }
        }
      }
    });

    if (!orden) {
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }

    res.json(orden);
  } catch (error) {
    console.error('Error obteniendo orden de compra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const { proveedor_id, fecha, estado, notas, items } = req.body;

    if (!proveedor_id || !fecha || !items || items.length === 0) {
      return res.status(400).json({ 
        message: 'Proveedor, fecha y items son campos obligatorios' 
      });
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
        subtotal: itemSubtotal,
        almacen_id: item.almacen_id
      };
    });

    const impuesto = subtotal * 0.16; // 16% de IVA
    const total = subtotal + impuesto;

    const nuevaOrden = await prisma.ordenes_compra.create({
      data: {
        numero_orden: generateOrderNumber('OC'),
        proveedor_id: parseInt(proveedor_id),
        fecha: new Date(fecha),
        subtotal,
        impuesto,
        total,
        estado: estado || 'Pendiente',
        notas,
        usuario_id: req.user.id,
        orden_compra_items: {
          create: orderItems
        }
      },
      include: {
        proveedores: {
          select: { nombre: true }
        },
        usuarios: {
          select: { nombre: true }
        },
        orden_compra_items: {
          include: {
            productos: {
              select: { nombre: true, codigo: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Orden de compra creada exitosamente',
      order: nuevaOrden
    });

  } catch (error) {
    console.error('Error creando orden de compra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { proveedor_id, fecha, estado, notas, items } = req.body;

    const ordenExistente = await prisma.ordenes_compra.findUnique({
      where: { id: parseInt(id) },
      include: { orden_compra_items: true }
    });

    if (!ordenExistente) {
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }

    let updateData = {
      proveedor_id: parseInt(proveedor_id),
      fecha: new Date(fecha),
      estado,
      notas
    };

    // Si se envían items, recalcular totales
    if (items && items.length > 0) {
      let subtotal = 0;
      const orderItems = items.map(item => {
        const itemSubtotal = item.cantidad * item.precio_unitario;
        subtotal += itemSubtotal;

        return {
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: itemSubtotal,
          almacen_id: item.almacen_id
        };
      });

      const impuesto = subtotal * 0.16;
      const total = subtotal + impuesto;

      updateData.subtotal = subtotal;
      updateData.impuesto = impuesto;
      updateData.total = total;

      // Eliminar items existentes y crear nuevos
      await prisma.orden_compra_items.deleteMany({
        where: { orden_compra_id: parseInt(id) }
      });

      updateData.orden_compra_items = {
        create: orderItems
      };
    }

    const ordenActualizada = await prisma.ordenes_compra.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        proveedores: {
          select: { nombre: true }
        },
        usuarios: {
          select: { nombre: true }
        },
        orden_compra_items: {
          include: {
            productos: {
              select: { nombre: true, codigo: true }
            }
          }
        }
      }
    });

    res.json({
      message: 'Orden de compra actualizada exitosamente',
      order: ordenActualizada
    });

  } catch (error) {
    console.error('Error actualizando orden de compra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const ordenExistente = await prisma.ordenes_compra.findUnique({
      where: { id: parseInt(id) }
    });

    if (!ordenExistente) {
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }

    await prisma.ordenes_compra.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Orden de compra eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando orden de compra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder
};