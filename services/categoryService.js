const { readDatabase, writeDatabase, createId } = require('./databaseService');

function getAllCategories() {
  const db = readDatabase();
  return db.categories;
}

function createCategory(name) {
  const db = readDatabase();
  const cleanName = String(name || '').trim();

  if (!cleanName) {
    throw new Error('Nama kategori wajib diisi.');
  }

  const exists = db.categories.some((item) => item.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    throw new Error('Kategori sudah ada.');
  }

  const category = {
    id: createId('cat'),
    name: cleanName
  };

  db.categories.push(category);
  writeDatabase(db);
  return category;
}

function deleteCategory(id) {
  const db = readDatabase();
  const beforeLength = db.categories.length;
  db.categories = db.categories.filter((item) => item.id !== id);
  writeDatabase(db);
  return beforeLength !== db.categories.length;
}

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory
};
