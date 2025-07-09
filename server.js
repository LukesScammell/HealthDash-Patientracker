const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const PATIENT_FILE = 'patients.json';
const PROVIDER_FILE = 'providers.json';

app.use(express.static('public'));
app.use(express.json()); // Parse JSON bodies

// Utility functions
function loadData(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
}

function saveData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// === PATIENTS API ===
app.get('/api/patients', (req, res) => {
  const patients = loadData(PATIENT_FILE);
  res.json(patients);
});

app.post('/api/patients', (req, res) => {
  const patients = loadData(PATIENT_FILE);
  console.log('New patient:', req.body); // optional
  patients.push(req.body);
  saveData(PATIENT_FILE, patients);
  res.json({ success: true });
});

app.delete('/api/patients/:id', (req, res) => {
  const patients = loadData(PATIENT_FILE);
  const id = parseInt(req.params.id);
  if (id >= 0 && id < patients.length) {
    patients.splice(id, 1);
    saveData(PATIENT_FILE, patients);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Patient not found' });
  }
});

// === PROVIDERS API ===
app.get('/api/providers', (req, res) => {
  const providers = loadData(PROVIDER_FILE);
  res.json(providers);
});

app.post('/api/providers', (req, res) => {
  const providers = loadData(PROVIDER_FILE);
  providers.push(req.body);
  saveData(PROVIDER_FILE, providers);
  res.json({ success: true });
});

app.delete('/api/providers/:id', (req, res) => {
  const providers = loadData(PROVIDER_FILE);
  const id = parseInt(req.params.id);
  if (id >= 0 && id < providers.length) {
    providers.splice(id, 1);
    saveData(PROVIDER_FILE, providers);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Provider not found' });
  }
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
