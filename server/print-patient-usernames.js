// Print all patient usernames in MongoDB
const mongoose = require('mongoose');
const Patient = require('./models/patient-mongodb');

async function printPatientUsernames() {
  await mongoose.connect('mongodb://localhost:27017/healthdash');
  const patients = await Patient.find({}, { patientUsername: 1, email: 1, first: 1, last: 1 });
  console.log('Patient usernames and emails:');
  patients.forEach(p => {
    console.log(`Username: ${p.patientUsername}, Email: ${p.email || ''}, Name: ${p.first || ''} ${p.last || ''}`);
  });
  mongoose.disconnect();
}

printPatientUsernames();
