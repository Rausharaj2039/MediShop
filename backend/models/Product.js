const { getDbForUser } = require('../config/db');

const mapProduct = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    stock: row.stock,
    category: row.category,
    image: row.image,
    expiryDate: row.expiry_date,
    company: row.company,
    batchNumber: row.batch_number,
    purchasePrice: row.purchase_price,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const Product = {
  find: async (userId) => {
    const db = getDbForUser(userId);
    const rows = db
      .prepare('SELECT * FROM products ORDER BY name COLLATE NOCASE ASC')
      .all();
    return rows.map(mapProduct);
  },

  findById: async (userId, id) => {
    const db = getDbForUser(userId);
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return mapProduct(row);
  },

  create: async (userId, { name, description, price, stock, category, image, expiryDate, company, batchNumber, purchasePrice }) => {
    const db = getDbForUser(userId);
    const now = new Date().toISOString();
    const result = db
      .prepare(
        `INSERT INTO products (name, description, price, stock, category, image, expiry_date, company, batch_number, purchase_price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name.toUpperCase(),
        description || 'No description provided.',
        price,
        stock,
        category,
        image || null,
        expiryDate || null,
        company || null,
        batchNumber || null,
        purchasePrice ?? null,
        now,
        now
      );

    return Product.findById(userId, result.lastInsertRowid);
  },

  update: async (userId, id, updates) => {
    const db = getDbForUser(userId);
    const existing = await Product.findById(userId, id);
    if (!existing) return null;

    const now = new Date().toISOString();
    db
      .prepare(
        `UPDATE products
         SET name = ?, description = ?, price = ?, stock = ?, category = ?, image = ?, expiry_date = ?, company = ?, batch_number = ?, purchase_price = ?, updated_at = ?
         WHERE id = ?`
      )
      .run(
        updates.name === undefined ? existing.name : updates.name.toUpperCase(),
        updates.description === undefined ? existing.description : updates.description,
        updates.price === undefined ? existing.price : updates.price,
        updates.stock === undefined ? existing.stock : updates.stock,
        updates.category === undefined ? existing.category : updates.category,
        updates.image === undefined ? existing.image : updates.image,
        updates.expiryDate === undefined ? existing.expiryDate : updates.expiryDate,
        updates.company === undefined ? existing.company : updates.company,
        updates.batchNumber === undefined ? existing.batchNumber : updates.batchNumber,
        updates.purchasePrice === undefined ? existing.purchasePrice : updates.purchasePrice,
        now,
        id
      );

    return Product.findById(userId, id);
  },

  delete: async (userId, id) => {
    const db = getDbForUser(userId);
    const existing = await Product.findById(userId, id);
    if (!existing) return null;

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return existing;
  },

  getDashboardStats: async (userId) => {
    const db = getDbForUser(userId);
    
    // 1. Total Medicines
    const totalMedicinesRow = db.prepare('SELECT COUNT(*) as count FROM products').get();
    const totalMedicines = totalMedicinesRow.count;
    
    // 2. Total Stock Quantity
    const totalStockRow = db.prepare('SELECT SUM(stock) as sum FROM products').get();
    const totalStock = totalStockRow.sum || 0;
    
    // 3. Low Stock Medicines (Quantity less than 10)
    const lowStockRows = db.prepare('SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC').all();
    const lowStockMedicines = lowStockRows.map(mapProduct);
    
    // 4. Medicines Expiring Soon (Within 30 days, or already expired)
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    
    const expiringSoonRows = db.prepare(
      `SELECT * FROM products 
       WHERE expiry_date IS NOT NULL 
         AND expiry_date != '' 
         AND expiry_date <= ? 
       ORDER BY expiry_date ASC`
    ).all(thirtyDaysStr);
    const expiringSoon = expiringSoonRows.map(mapProduct);
    
    // 5. Recently Added Medicines (Last 5)
    const recentlyAddedRows = db.prepare('SELECT * FROM products ORDER BY created_at DESC LIMIT 5').all();
    const recentlyAdded = recentlyAddedRows.map(mapProduct);
    
    return {
      totalMedicines,
      totalStock,
      lowStockCount: lowStockMedicines.length,
      expiringSoonCount: expiringSoon.length,
      lowStockMedicines,
      expiringSoon,
      recentlyAdded
    };
  },

  search: async (userId, q) => {
    const db = getDbForUser(userId);
    const rows = db.prepare(
      `SELECT * FROM products 
       WHERE name LIKE ? 
          OR company LIKE ? 
          OR batch_number LIKE ? 
       LIMIT 8`
    ).all(`%${q}%`, `%${q}%`, `%${q}%`);
    return rows.map(mapProduct);
  },
};

module.exports = Product;
