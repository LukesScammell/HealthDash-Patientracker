// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Handle medication selection
  const images = document.querySelectorAll('.medication-options img');
  const medInput = document.querySelector('input[name="medication"]');
  const medImgInput = document.querySelector('input[name="medicationImage"]');
  const preview = document.getElementById('selected-medication-preview');

  images.forEach(img => {
    img.addEventListener('click', () => {
      images.forEach(i => i.classList.remove('selected'));
      img.classList.add('selected');

      medInput.value = img.dataset.name;
      medImgInput.value = img.src;

      preview.innerHTML = `
        <p>Selected: ${img.dataset.name}</p>
        <img src="${img.src}" alt="${img.dataset.name}" width="80">
      `;
    });
  });
});

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }
});

// 🧠 Load and manage patients
async function loadPatients() {
  const res = await fetch('/api/patients');
  const patients = await res.json();
  const tbody = document.querySelector('#patients-table tbody');
  tbody.innerHTML = '';

  patients.forEach((p, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${p.first}</td>
      <td>${p.last}</td>
      <td>${p.disease}</td>
      <td>
        <img src="${p.medicationImage}" alt="${p.medication}" width="50"><br>
        ${p.medication}
      </td>
      <td>${p.description}</td>
      <td><button onclick="deletePatient(${i})">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Add new patient
async function addPatientForm(event) {
  event.preventDefault();

  const form = event.target;

  const patient = {
    first: form.first.value,
    last: form.last.value,
    disease: form.disease.value,
    medication: form.medication.value,
    medicationImage: form.medicationImage.value,
    description: form.description.value
  };

  // Send to server
  await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient)
  });

  form.reset();
  document.getElementById('selected-medication-preview').innerHTML = '';
  loadPatients(); // reload the table
}

// Delete patient
async function deletePatient(index) {
  await fetch(`/api/patients/${index}`, { method: 'DELETE' });
  loadPatients();
}

// Providers: similar logic
async function loadProviders() {
  const res = await fetch('/api/providers');
  const providers = await res.json();
  const tbody = document.querySelector('#providers-table tbody');
  tbody.innerHTML = '';

  providers.forEach((p, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.specialty}</td>
      <td>${p.contact}</td>
      <td><button onclick="deleteProvider(${i})">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

async function addProviderForm(e) {
  e.preventDefault();
  const form = e.target;
  const provider = {
    name: form.name.value,
    specialty: form.specialty.value,
    contact: form.contact.value
  };

  await fetch('/api/providers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(provider)
  });
  form.reset();
  loadProviders();
}

async function deleteProvider(index) {
  await fetch(`/api/providers/${index}`, { method: 'DELETE' });
  loadProviders();
}
