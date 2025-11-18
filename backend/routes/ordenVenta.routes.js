const express = require('express');
const {
  getAllSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder
} = require('../controllers/ordenVenta.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllSalesOrders);
router.get('/:id', authMiddleware, getSalesOrderById);
router.post('/', authMiddleware, createSalesOrder);
router.put('/:id', authMiddleware, updateSalesOrder);
router.delete('/:id', authMiddleware, deleteSalesOrder);

module.exports = router;