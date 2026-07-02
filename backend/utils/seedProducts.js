const User = require('../models/User');
const Product = require('../models/Product');

const seedProducts = async () => {
  try {
    const adminUser = await User.findOne({ email: 'admin@medishop.local' });
    if (!adminUser) {
      console.warn('Admin user not found. Skipping product seeding.');
      return;
    }

    const adminUserId = adminUser.id;
    const existingProducts = await Product.find(adminUserId);

    if (existingProducts && existingProducts.length > 0) {
      console.log('Products table already has data for admin. Skipping product seeding.');
      return;
    }

    const sampleProducts = [
      {
        name: 'Paracetamol 650mg',
        description: 'Common analgesic and antipyretic for pain and fever relief.',
        price: 32.50,
        stock: 120,
        category: 'Tablet',
        expiryDate: '2027-12-31',
        company: 'Cipla Ltd.',
        batchNumber: 'PARA102',
        purchasePrice: 22.00,
        image: null
      },
      {
        name: 'Amoxicillin 500mg',
        description: 'Penicillin-type antibiotic used to treat bacterial infections.',
        price: 110.00,
        stock: 8,
        category: 'Capsule',
        expiryDate: '2027-09-30',
        company: 'Alkem Laboratories',
        batchNumber: 'AMX998',
        purchasePrice: 85.00,
        image: null
      },
      {
        name: 'Pantoprazole 40mg',
        description: 'Proton pump inhibitor that decreases the amount of acid produced in stomach.',
        price: 75.00,
        stock: 150,
        category: 'Tablet',
        expiryDate: '2026-07-15', // Expiring soon relative to July 1, 2026
        company: 'Sun Pharma Ltd.',
        batchNumber: 'PAN401',
        purchasePrice: 48.00,
        image: null
      },
      {
        name: 'Atorvastatin 10mg',
        description: 'Statin medication used to prevent cardiovascular disease and lower lipids.',
        price: 125.00,
        stock: 45,
        category: 'Tablet',
        expiryDate: '2027-05-31',
        company: 'Lupin Ltd.',
        batchNumber: 'ATO119',
        purchasePrice: 90.00,
        image: null
      },
      {
        name: 'Metformin 500mg',
        description: 'First-line medication for the treatment of type 2 diabetes.',
        price: 45.00,
        stock: 5, // Low stock alert
        category: 'Tablet',
        expiryDate: '2028-02-28',
        company: 'Abbott India',
        batchNumber: 'MET004',
        purchasePrice: 30.00,
        image: null
      },
      {
        name: 'Cough Syrup (Ascoril)',
        description: 'Expectorant mucolytic and bronchodilator for cough relief.',
        price: 98.00,
        stock: 35,
        category: 'Syrup',
        expiryDate: '2026-11-30',
        company: 'Glenmark Pharmaceuticals',
        batchNumber: 'ASC909',
        purchasePrice: 70.00,
        image: null
      },
      {
        name: 'Insulin Glargine 100 U/mL',
        description: 'Long-acting basal insulin analogue for blood sugar control.',
        price: 850.00,
        stock: 2, // Critical stock alert
        category: 'Injection',
        expiryDate: '2026-08-31', // Warn / critical expiry
        company: 'Sanofi India Ltd.',
        batchNumber: 'INS772',
        purchasePrice: 680.00,
        image: null
      },
      {
        name: 'Multivitamin Drops',
        description: 'Daily nutritional supplement drops for infants and kids.',
        price: 165.00,
        stock: 12,
        category: 'Drops',
        expiryDate: '2026-07-22', // Expiring soon relative to July 1, 2026
        company: 'Mankind Pharma',
        batchNumber: 'VIT223',
        purchasePrice: 130.00,
        image: null
      }
    ];

    for (const prod of sampleProducts) {
      await Product.create(adminUserId, prod);
    }

    console.log(`Successfully seeded ${sampleProducts.length} medicines for Admin (User ID: ${adminUserId}).`);
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

module.exports = seedProducts;
