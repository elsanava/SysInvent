const express = require('express');
const {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} = require('../controllers/almacenes.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllWarehouses);
router.get('/:id', authMiddleware, getWarehouseById);
router.post('/', authMiddleware, createWarehouse);
router.put('/:id', authMiddleware, updateWarehouse);
router.delete('/:id', authMiddleware, deleteWarehouse);

module.exports = router;