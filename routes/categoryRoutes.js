const express = require('express');
const {
  getAllCategories,
  createCategory,
  deleteCategory
} = require('../services/categoryService');

const router = express.Router();

router.get('/', (req, res) => {
  return res.json({
    success: true,
    categories: getAllCategories()
  });
});

router.post('/', (req, res) => {
  try {
    const category = createCategory(req.body.name);
    return res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan.',
      category
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:id', (req, res) => {
  const deleted = deleteCategory(req.params.id);

  return res.json({
    success: deleted,
    message: deleted ? 'Kategori berhasil dihapus.' : 'Kategori tidak ditemukan.'
  });
});

module.exports = router;
