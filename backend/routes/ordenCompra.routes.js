const express = require('express');
const {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder
} = require('../controllers/ordenCompra.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllPurchaseOrders);
router.get('/:id', authMiddleware, getPurchaseOrderById);
router.post('/', authMiddleware, createPurchaseOrder);
router.put('/:id', authMiddleware, updatePurchaseOrder);
router.delete('/:id', authMiddleware, deletePurchaseOrder);

module.exports = router;