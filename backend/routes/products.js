const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find(req.user.id);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const stats = await Product.getDashboardStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/search', protect, async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.json([]);
    }
    const products = await Product.search(req.user.id, q);
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.user.id, req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, description, price, stock, category, image, expiryDate, company, batchNumber, purchasePrice } = req.body;
    
    // Validations
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Medicine Name is required.' });
    }
    
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: 'Selling price must be a positive number.' });
    }
    
    const parsedStock = (stock !== undefined && stock !== '' && stock !== null) ? parseInt(stock, 10) : 0;
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ message: 'Quantity/Stock must be an integer greater than or equal to 0.' });
    }

    let parsedPurchasePrice = null;
    if (purchasePrice !== undefined && purchasePrice !== '' && purchasePrice !== null) {
      parsedPurchasePrice = parseFloat(purchasePrice);
      if (isNaN(parsedPurchasePrice) || parsedPurchasePrice <= 0) {
        return res.status(400).json({ message: 'Purchase price must be a positive number.' });
      }
      if (parsedPurchasePrice > parsedPrice) {
        return res.status(400).json({ message: 'Purchase price cannot exceed the selling price.' });
      }
    }

    const finalCategory = (category && category.trim()) ? category.trim() : 'Tablet';

    const product = await Product.create(req.user.id, {
      name: name.trim(),
      description: description ? description.trim() : null,
      price: parsedPrice,
      stock: parsedStock,
      category: finalCategory,
      image,
      expiryDate: expiryDate || null,
      company: (company && company.trim()) ? company.trim() : null,
      batchNumber: (batchNumber && batchNumber.trim()) ? batchNumber.trim() : null,
      purchasePrice: parsedPurchasePrice
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, price, stock, category, image, expiryDate, company, batchNumber, purchasePrice } = req.body;
    
    const existing = await Product.findById(req.user.id, req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ message: 'Medicine Name cannot be empty.' });
    }
    
    let parsedPrice = existing.price;
    if (price !== undefined) {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ message: 'Selling price must be a positive number.' });
      }
    }
    
    let parsedPurchasePrice = existing.purchasePrice;
    if (purchasePrice !== undefined) {
      if (purchasePrice === '' || purchasePrice === null) {
        parsedPurchasePrice = null;
      } else {
        parsedPurchasePrice = parseFloat(purchasePrice);
        if (isNaN(parsedPurchasePrice) || parsedPurchasePrice <= 0) {
          return res.status(400).json({ message: 'Purchase price must be a positive number.' });
        }
      }
    }
    
    if (parsedPurchasePrice !== null && parsedPurchasePrice > parsedPrice) {
      return res.status(400).json({ message: 'Purchase price cannot exceed the selling price.' });
    }
    
    let parsedStock = existing.stock;
    if (stock !== undefined) {
      parsedStock = (stock === '' || stock === null) ? 0 : parseInt(stock, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ message: 'Quantity/Stock must be an integer greater than or equal to 0.' });
      }
    }

    const updatedProduct = await Product.update(req.user.id, req.params.id, {
      name: name !== undefined ? name.trim() : undefined,
      description: description !== undefined ? (description ? description.trim() : null) : undefined,
      price: parsedPrice,
      stock: parsedStock,
      category: category !== undefined ? (category ? category.trim() : 'Tablet') : undefined,
      image,
      expiryDate: expiryDate !== undefined ? (expiryDate || null) : undefined,
      company: company !== undefined ? (company && company.trim() ? company.trim() : null) : undefined,
      batchNumber: batchNumber !== undefined ? (batchNumber && batchNumber.trim() ? batchNumber.trim() : null) : undefined,
      purchasePrice: parsedPurchasePrice
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.delete(req.user.id, req.params.id);
    if (product) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
