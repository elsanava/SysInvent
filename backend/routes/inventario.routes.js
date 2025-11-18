const express = require('express');
const {
  getAllInventoryMovements,
  getMovementsByProduct,
  createInventoryMovement,
  adjustInventory
} = require('../controllers/inventario.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/movimientos', authMiddleware, getAllInventoryMovements);
router.get('/movimientos/producto/:producto_id', authMiddleware, getMovementsByProduct);
router.post('/movimiento', authMiddleware, createInventoryMovement);
router.post('/ajuste', authMiddleware, adjustInventory);

module.exports = router;