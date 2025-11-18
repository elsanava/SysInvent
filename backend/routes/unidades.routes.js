const express = require('express');
const {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit
} = require('../controllers/unidades.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllUnits);
router.get('/:id', authMiddleware, getUnitById);
router.post('/', authMiddleware, createUnit);
router.put('/:id', authMiddleware, updateUnit);
router.delete('/:id', authMiddleware, deleteUnit);

module.exports = router;