require('dotenv').config();
const mongoose = require('mongoose');
const Vaccine = require('./models/Vaccine');

const vaccines = [
  {
    name: 'BCG',
    manufacturer: 'Serum Institute of India',
    batchNumber: 'BCG-2024-001',
    expiryDate: new Date('2026-06-15'),
    quantity: 150,
    minStockLevel: 20
  },
  {
    name: 'Hepatitis B',
    manufacturer: 'GlaxoSmithKline',
    batchNumber: 'HEPB-2024-045',
    expiryDate: new Date('2026-07-20'),
    quantity: 200,
    minStockLevel: 25
  },
  {
    name: 'DTP (Diphtheria, Tetanus, Pertussis)',
    manufacturer: 'Sanofi Pasteur',
    batchNumber: 'DTP-2024-089',
    expiryDate: new Date('2026-05-10'),
    quantity: 180,
    minStockLevel: 20
  },
  {
    name: 'OPV (Oral Polio Vaccine)',
    manufacturer: 'Bio-Med',
    batchNumber: 'OPV-2024-123',
    expiryDate: new Date('2026-06-30'),
    quantity: 250,
    minStockLevel: 30
  },
  {
    name: 'MMR (Measles, Mumps, Rubella)',
    manufacturer: 'Merck & Co.',
    batchNumber: 'MMR-2024-067',
    expiryDate: new Date('2026-08-15'),
    quantity: 120,
    minStockLevel: 15
  },
  {
    name: 'Pneumococcal Conjugate (PCV13)',
    manufacturer: 'Pfizer',
    batchNumber: 'PCV-2024-034',
    expiryDate: new Date('2026-07-05'),
    quantity: 140,
    minStockLevel: 18
  },
  {
    name: 'Rotavirus',
    manufacturer: 'GlaxoSmithKline',
    batchNumber: 'ROTA-2024-078',
    expiryDate: new Date('2026-06-25'),
    quantity: 160,
    minStockLevel: 20
  },
  {
    name: 'Varicella (Chickenpox)',
    manufacturer: 'Merck & Co.',
    batchNumber: 'VAR-2024-091',
    expiryDate: new Date('2026-08-30'),
    quantity: 100,
    minStockLevel: 12
  },
  {
    name: 'Hepatitis A',
    manufacturer: 'GlaxoSmithKline',
    batchNumber: 'HEPA-2024-056',
    expiryDate: new Date('2026-07-12'),
    quantity: 110,
    minStockLevel: 15
  },
  {
    name: 'Influenza (Flu)',
    manufacturer: 'Sanofi Pasteur',
    batchNumber: 'FLU-2024-145',
    expiryDate: new Date('2026-05-30'),
    quantity: 300,
    minStockLevel: 40
  },
  {
    name: 'HPV (Human Papillomavirus)',
    manufacturer: 'Merck & Co.',
    batchNumber: 'HPV-2024-023',
    expiryDate: new Date('2026-06-18'),
    quantity: 90,
    minStockLevel: 10
  },
  {
    name: 'Meningococcal ACWY',
    manufacturer: 'Sanofi Pasteur',
    batchNumber: 'MEN-2024-112',
    expiryDate: new Date('2026-08-08'),
    quantity: 85,
    minStockLevel: 10
  },
  {
    name: 'Tdap (Tetanus, Diphtheria, Pertussis)',
    manufacturer: 'GlaxoSmithKline',
    batchNumber: 'TDAP-2024-098',
    expiryDate: new Date('2026-07-28'),
    quantity: 130,
    minStockLevel: 15
  },
  {
    name: 'Japanese Encephalitis',
    manufacturer: 'Valneva',
    batchNumber: 'JE-2024-071',
    expiryDate: new Date('2026-06-10'),
    quantity: 75,
    minStockLevel: 8
  },
  {
    name: 'Typhoid',
    manufacturer: 'Sanofi Pasteur',
    batchNumber: 'TYP-2024-084',
    expiryDate: new Date('2026-05-22'),
    quantity: 95,
    minStockLevel: 10
  }
];

// MongoDB connection and seed function
const seedVaccines = async () => {
  try {
    // Connect to MongoDB using .env configuration
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB successfully!');
    console.log(`Database: ${mongoose.connection.name}`);

    // Optional: Clear existing vaccines (uncomment if you want to start fresh)
     await Vaccine.deleteMany({});
    // console.log('🗑️  Cleared existing vaccines');

    // Insert vaccines
    console.log('\n📦 Inserting vaccines...');
    const result = await Vaccine.insertMany(vaccines);
    console.log(`✅ Successfully inserted ${result.length} vaccines\n`);

    // Display inserted vaccines
    console.log('📋 Vaccine List:');
    console.log('─'.repeat(80));
    result.forEach((vaccine, index) => {
      console.log(`${index + 1}. ${vaccine.name}`);
      console.log(`   Manufacturer: ${vaccine.manufacturer}`);
      console.log(`   Batch: ${vaccine.batchNumber}`);
      console.log(`   Stock: ${vaccine.quantity} units`);
      console.log(`   Expires: ${vaccine.expiryDate.toDateString()}`);
      console.log('─'.repeat(80));
    });

    console.log('\n✨ Seeding completed successfully!');
    mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  } catch (error) {
    console.error('❌ Error seeding vaccines:', error.message);
    if (error.code === 11000) {
      console.error('💡 Tip: Some vaccines may already exist. Uncomment the deleteMany line to clear existing data.');
    }
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedVaccines();
