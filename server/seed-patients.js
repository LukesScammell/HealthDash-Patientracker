// Usage: node server/seed-patients.js
const mongoose = require('mongoose');
const Patient = require('./models/patient-mongodb');

mongoose.connect('mongodb://localhost:27017/healthdash', { useNewUrlParser: true, useUnifiedTopology: true });

async function seed() {
  await Patient.deleteMany({});
  await Patient.create([
    {
      first: 'Bob',
      last: 'Lee',
      disease: 'Diabetes',
      medications: [{ name: 'Ibuprofen', image: '/images/ibuprofen.png' }],
      description: 'Type 2 diabetes',
      patientUsername: 'Bob',
      providerUsername: 'provider1',
      prescriptions: []
    },
    {
      first: 'Alice',
      last: 'Nguyen',
      disease: 'Asthma',
      medications: [{ name: 'Inhaler', image: '/images/inhaler.png' }],
      description: 'Chronic asthma',
      patientUsername: 'Alice',
      providerUsername: 'provider1',
      prescriptions: []
    },
    {
      first: 'Luke',
      last: 'Scammell',
      disease: 'Adhd',
      medications: [{ name: 'Antivirals', image: '/images/antivirals.jpg' }],
      description: 'ADHD',
      patientUsername: 'Luke',
      providerUsername: 'provider1',
      prescriptions: []
    }
  ]);
  console.log('✅ Patients seeded');
  mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  mongoose.disconnect();
});
