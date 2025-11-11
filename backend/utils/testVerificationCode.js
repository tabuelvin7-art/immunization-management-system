// Test utility for verification code system
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const VerificationCode = require('../models/VerificationCode');
const User = require('../models/User');

const testVerificationCodeSystem = async () => {
  try {
    console.log('🧪 Testing Verification Code System...\n');

    // 1. Find or create a test patient
    let testPatient = await Patient.findOne({ name: 'Test Child' });
    if (!testPatient) {
      testPatient = await Patient.create({
        name: 'Test Child',
        dateOfBirth: new Date('2020-01-01'),
        gender: 'Male',
        contactNumber: '+1234567890',
        guardianName: 'Test Parent',
        guardianContact: '+1234567891'
      });
      console.log('✅ Created test patient:', testPatient._id);
    } else {
      console.log('✅ Found existing test patient:', testPatient._id);
    }

    // 2. Find or create a test healthcare user
    let testStaff = await User.findOne({ email: 'staff@test.com' });
    if (!testStaff) {
      testStaff = await User.create({
        name: 'Test Staff',
        email: 'staff@test.com',
        password: 'password123',
        role: 'Nurse'
      });
      console.log('✅ Created test staff user');
    } else {
      console.log('✅ Found existing test staff user');
    }

    // 3. Generate a verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const parentEmail = 'parent@test.com';

    // Delete any existing codes for this patient
    await VerificationCode.deleteMany({ patientId: testPatient._id });

    const verificationCode = await VerificationCode.create({
      patientId: testPatient._id,
      code: code,
      generatedBy: testStaff._id,
      parentEmail: parentEmail.toLowerCase(),
      parentName: 'Test Parent'
    });

    console.log('✅ Generated verification code:', {
      patientId: testPatient._id,
      code: code,
      parentEmail: parentEmail,
      expiresAt: verificationCode.expiresAt
    });

    // 4. Test code lookup
    const foundCode = await VerificationCode.findOne({
      patientId: testPatient._id,
      code: code,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).populate('patientId');

    if (foundCode) {
      console.log('✅ Code lookup successful');
      console.log('   - Patient:', foundCode.patientId.name);
      console.log('   - Parent Email:', foundCode.parentEmail);
      console.log('   - Expires:', foundCode.expiresAt);
    } else {
      console.log('❌ Code lookup failed');
    }

    // 5. Test email matching
    const emailMatch = foundCode.parentEmail.toLowerCase() === parentEmail.toLowerCase();
    console.log('✅ Email matching:', emailMatch ? 'PASS' : 'FAIL');

    console.log('\n🎯 Test Results:');
    console.log('   Patient ID:', testPatient._id);
    console.log('   Verification Code:', code);
    console.log('   Parent Email:', parentEmail);
    console.log('   Code Valid Until:', verificationCode.expiresAt);

    console.log('\n📋 To test linking:');
    console.log('   1. Create parent account with email:', parentEmail);
    console.log('   2. Use Patient ID:', testPatient._id);
    console.log('   3. Use Verification Code:', code);

    return {
      patientId: testPatient._id,
      verificationCode: code,
      parentEmail: parentEmail
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
};

module.exports = { testVerificationCodeSystem };

// Run test if called directly
if (require.main === module) {
  const connectDB = require('../config/db');
  require('dotenv').config();
  
  connectDB().then(() => {
    testVerificationCodeSystem()
      .then(() => {
        console.log('\n✅ All tests completed successfully!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Tests failed:', error);
        process.exit(1);
      });
  });
}