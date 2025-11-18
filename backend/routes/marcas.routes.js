const express = require('express');
const {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/marcas.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllBrands);
router.get('/:id', authMiddleware, getBrandById);
router.post('/', authMiddleware, createBrand);
router.put('/:id', authMiddleware, updateBrand);
router.delete('/:id', authMiddleware, deleteBrand);

module.exports = router;