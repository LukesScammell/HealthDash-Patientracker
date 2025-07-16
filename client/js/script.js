// --- Provider Patients Page Handler ---
if (window.location.pathname.endsWith('/provider-patients.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    fetch('/me')
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (!user || user.role !== 'provider') {
          alert('Access denied. Providers only.');
          window.location.href = 'login.html';
          return;
        }
        fetch('/patients/provider')
          .then(res => res.json())
          .then(patients => {
            const container = document.getElementById('patients-container');
            if (!container) return;
            if (!patients.length) {
              container.innerHTML = '<p>No patients assigned to you.</p>';
              return;
            }
            container.innerHTML = patients.map(p => `
              <div class="card">
                <h3>${p.first} ${p.last}</h3>
                <p><strong>Disease:</strong> ${p.disease}</p>
                <p><strong>Description:</strong> ${p.description}</p>
              </div>
            `).join('');
          });
      })
      .catch(() => window.location.href = 'login.html');
  });
}
// --- Users Page Handler ---
if (window.location.pathname.endsWith('/users.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    fetch('/me')
      .then(res => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(user => {
        if (user.role !== 'provider') {
          alert('You do not have access to this page.');
          window.location.href = 'index.html';
          return;
        }
        fetch('/users')
          .then(res => res.json())
          .then(users => {
            const tbody = document.getElementById('user-list');
            tbody.innerHTML = '';
            users.forEach(u => {
              const row = document.createElement('tr');
              row.innerHTML = `<td>${u.username}</td><td>${u.role}</td>`;
              tbody.appendChild(row);
            });
          });
      })
      .catch(() => {
        window.location.href = 'login.html';
      });
  });
}
// --- Login Page Handler ---
if (window.location.pathname.endsWith('/login.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const res = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (res.ok) {
          window.location.href = 'index.html';
        } else {
          alert('Invalid login');
        }
      });
    }
  });
}
// --- NAVBAR INJECTION AND LOGIC ---
window.addEventListener("DOMContentLoaded", () => {
  fetch("/nav.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("nav-placeholder").innerHTML = html;

      // ✅ Responsive nav toggle
      const toggleBtn = document.querySelector(".nav-toggle");
      const navExpand = document.getElementById("nav-drawer");
      if (toggleBtn && navExpand) {
        toggleBtn.addEventListener("click", () => {
          navExpand.classList.toggle("show");
        });
      }

      // ✅ SETUP DARK MODE TOGGLE HERE
      const themeToggle = document.getElementById("theme-toggle");
      if (themeToggle) {
        themeToggle.addEventListener("click", toggleDarkMode);

        const saved = localStorage.getItem("darkMode");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = saved === "enabled" || (!saved && prefersDark);
        themeToggle.textContent = isDark ? "☀️" : "🌙";
      }

      // ✅ SETUP LOGOUT BUTTON HERE TOO
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          fetch("/logout", { method: "POST" })
            .then(() => {
              window.location.href = "/pages/login.html";
            });
        });
      }

      // ✅ Now nav is in the page, fetch the user role
      fetch("/me", { cache: "no-store" })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(user => {
          const navUser = document.getElementById("nav-user");
          // If patient, fetch their profile for full name
          if (user && user.role === "patient") {
            fetch("/patients/me", { cache: "no-store" })
              .then(res => res.ok ? res.json() : null)
              .then(profile => {
                if (profile && profile.first && profile.last) {
                  navUser.textContent = `👋 ${profile.first} ${profile.last}`;
                } else if (user.username) {
                  navUser.textContent = "👋 " + user.username;
                } else {
                  navUser.textContent = "👤 Guest";
                }
              });
          } else if (user && user.role === "provider") {
            fetch("/providers/me", { cache: "no-store" })
              .then(res => res.ok ? res.json() : null)
              .then(profile => {
                if (profile && profile.name) {
                  navUser.textContent = `👋 ${profile.name}`;
                } else if (user.username) {
                  navUser.textContent = "👋 " + user.username;
                } else {
                  navUser.textContent = "👤 Guest";
                }
              });
          } else if (user && user.username) {
            navUser.textContent = "� " + user.username;
          } else {
            navUser.textContent = "👤 Guest";
          }

          // Show all authenticated elements
          document.querySelectorAll(".nav-auth").forEach(el => el.style.display = "inline-block");

          // Hide login/register
          const loginBtn = document.getElementById("login-btn");
          const registerBtn = document.getElementById("register-btn");
          if (loginBtn) loginBtn.style.display = "none";
          if (registerBtn) registerBtn.style.display = "none";
          const logoutBtn = document.getElementById("logout-btn");
          if (logoutBtn) logoutBtn.style.display = "inline-block";

          // ✅ Show only if patient
          if (user.role === "patient") {
            // ✅ Show patient-only links
            document.querySelectorAll(".nav-patient").forEach(el => el.style.display = "inline-block");
            // ❌ Remove provider-only links
            document.querySelectorAll(".nav-provider").forEach(el => el.remove());
          }

          if (user.role === "provider") {
            // ✅ Show provider-only links
            document.querySelectorAll(".nav-provider").forEach(el => el.style.display = "inline-block");
            // ❌ Remove patient-only links
            document.querySelectorAll(".nav-patient").forEach(el => el.remove());
          }
          if (user.role === "admin") {
            document.querySelectorAll(".nav-admin").forEach(el => el.style.display = "inline-block");
          }
        })
        .catch(() => {
          // Not logged in – remove protected links
          document.querySelectorAll(".nav-auth").forEach(el => el.remove());
          document.querySelectorAll(".nav-users").forEach(el => el.remove());
          const loginBtn = document.getElementById("login-btn");
          const registerBtn = document.getElementById("register-btn");
          if (loginBtn) loginBtn.style.display = "inline-block";
          if (registerBtn) registerBtn.style.display = "inline-block";
          const logoutBtn = document.getElementById("logout-btn");
          if (logoutBtn) logoutBtn.style.display = "none";
          const navUser = document.getElementById("nav-user");
          if (navUser) navUser.textContent = "👤 Guest";
        });
    });
});
// --- Patient Management & Prescription Modal Logic (for patients.html) ---
if (window.location.pathname.endsWith('/patients.html')) {
  let allPatients = [];
  function getPrescribedNames(patientId) {
    const p = allPatients.find(p => p._id === patientId);
    if (!p || !Array.isArray(p.prescriptions)) return [];
    return p.prescriptions.map(pr => pr.medication);
  }
  function generatePrescriptionOptionsHTML(patientId) {
    const meds = [
      { name: "Amoxicillin", img: "/images/amoxicillin.png" },
      { name: "Antihistamines", img: "/images/antihistamines.jpg" },
      { name: "Antivirals", img: "/images/antivirals.jpg" },
      { name: "Ibuprofen", img: "/images/ibuprofen.png" },
      { name: "Inhaler", img: "/images/inhaler.png" },
      { name: "Insulin", img: "/images/insulin.png" },
      { name: "Paracetamol", img: "/images/paracetamol.png" },
      { name: "SSRI", img: "/images/ssri.jpg" },
      { name: "Triptans", img: "/images/triptans.jpg" }
    ];
    const prescribed = getPrescribedNames(patientId);
    return meds.map(m => `
      <div class="option${prescribed.includes(m.name) ? ' disabled' : ''}" data-name="${m.name}" data-img="${m.img}" ${prescribed.includes(m.name) ? 'style=\"opacity:0.5;pointer-events:none;\"' : ''}>
        <img src="${m.img}" alt="${m.name}" width="24" height="24" />
        ${m.name}
        ${prescribed.includes(m.name) ? '<span style=\"color:#c00;font-size:0.9em;\"> (Already prescribed)</span>' : ''}
      </div>
    `).join("");
  }
  function setupPrescriptionDropdown(patientId) {
    const select = document.querySelector('#prescription-medication-select .select-options');
    if (select) select.innerHTML = generatePrescriptionOptionsHTML(patientId);
    const selected = document.querySelector('#prescription-medication-select .selected-option');
    if (!selected) return;
    document.querySelectorAll('#prescription-medication-select .option:not(.disabled)').forEach(option => {
      option.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent any accidental form submission
        selected.innerHTML = `<img src="${this.dataset.img}" width="24" /> ${this.dataset.name}`;
        selected.dataset.name = this.dataset.name;
        selected.dataset.img = this.dataset.img;
        if (select) select.classList.add('hidden');
      });
    });
  }
  window.toggleDropdown = function(selectElement) {
    document.querySelectorAll('.select-options').forEach(opt => opt.classList.add('hidden'));
    const dropdown = selectElement.querySelector('.select-options');
    dropdown.classList.toggle('hidden');
  }
  window.openPrescriptionModal = function(patientId) {
    document.getElementById('prescription-modal').style.display = 'flex';
    document.getElementById('prescription-patient-id').value = patientId;
    document.getElementById('prescription-form').reset();
    // Reset dropdown
    const selected = document.querySelector('#prescription-medication-select .selected-option');
    if (selected) {
      selected.innerHTML = 'Select medication';
      delete selected.dataset.name;
      delete selected.dataset.img;
    }
    setupPrescriptionDropdown(patientId);
  }
  window.closePrescriptionModal = function() {
    document.getElementById('prescription-modal').style.display = 'none';
  }
  function loadPatients() {
    const tableBody = document.querySelector("#patients-table tbody");
    tableBody.innerHTML = "";
    fetch("/patients")
      .then(res => res.json())
      .then(patients => {
        allPatients = patients;
        patients.forEach((patient, index) => {
          const meds = Array.isArray(patient.medications)
            ? patient.medications.map(m => `
              <div style="display:flex; align-items:center; gap:6px;">
                <img src="${m.image}" width="30" /> ${m.name}
              </div>
            `).join("")
            : "";
          const prescriptions = Array.isArray(patient.prescriptions) && patient.prescriptions.length
            ? patient.prescriptions.map(p => `<div><b>${p.medication}</b> (${p.dosage})<br><small>${p.instructions || ''}</small></div>`).join('<hr>')
            : '<span style="color:#888">None</span>';
          const row = document.createElement("tr");
          // Always use patient._id for MongoDB
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${patient.first}</td>
            <td>${patient.last}</td>
            <td>${patient.disease}</td>
            <td>${meds}</td>
            <td>${patient.description}</td>
            <td>${prescriptions}</td>
            <td><button onclick="openPrescriptionModal('${patient._id}')">Prescribe</button></td>
          `;
          tableBody.appendChild(row);
        });
      });
  }
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('patients-table')) {
      loadPatients();
      // Attach prescription form handler
      const form = document.getElementById('prescription-form');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const patientId = document.getElementById('prescription-patient-id').value;
          const selected = document.querySelector('#prescription-medication-select .selected-option');
          const medication = selected && selected.dataset.name ? selected.dataset.name : '';
          const dosage = document.getElementById('prescription-dosage').value;
          const instructions = document.getElementById('prescription-instructions').value;
          if (!medication) return alert('Please select a medication.');
          // Debug log
          console.log('Submitting prescription:', { patientId, medication, dosage, instructions });
          fetch(`/patients/${patientId}/prescriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ medication, dosage, instructions })
          })
          .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error('Failed to add prescription: ' + text); });
            return res.json();
          })
          .then(() => {
            closePrescriptionModal();
            loadPatients();
          })
          .catch(err => alert(err.message));
        });
      }
    }
  });
}
// 🌓 Apply saved or preferred system theme
(function applySavedOrSystemTheme() {
  const saved = localStorage.getItem("darkMode");

  if (saved === "enabled") {
    document.body.classList.add("dark");
  } else if (saved === "disabled") {
    document.body.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.body.classList.add("dark");
    }
  }
})();
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");

  // Update icon
  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) toggleBtn.textContent = isDark ? "☀️" : "🌙";
}



function logout() {
  fetch("/logout", { method: "POST" })
    .then(() => {
      window.location.href = "/pages/login.html";
    });
}
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    fetch("/logout", { method: "POST" })
      .then(() => {
        window.location.href = "/pages/login.html";
      });
  });
}





// ✅ Medication Dropdowns UI
function generateMedicationDropdowns() {
  const count = parseInt(document.getElementById("medCount").value);
  const container = document.getElementById("medicationDropdowns");
  const preview = document.getElementById("selected-medication-preview");
  container.innerHTML = "";
  preview.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select-wrapper";

    wrapper.innerHTML = `
      <div class="custom-select" onclick="toggleDropdown(this)">
        <div class="selected-option">Select medication ${i + 1}</div>
        <div class="select-options hidden">
          ${generateOptionsHTML()}
        </div>
      </div>
    `;
    container.appendChild(wrapper);
  }

  document.querySelector("input[name='medications']").value = "";
}

function toggleDropdown(selectElement) {
  document.querySelectorAll(".select-options").forEach(opt => opt.classList.add("hidden"));
  const dropdown = selectElement.querySelector(".select-options");
  dropdown.classList.toggle("hidden");
}

function generateOptionsHTML() {
  const meds = [
    { name: "Amoxicillin", img: "/images/amoxicillin.png" },
    { name: "Antihistamines", img: "/images/antihistamines.jpg" },
    { name: "Antivirals", img: "/images/antivirals.jpg" },
    { name: "Ibuprofen", img: "/images/ibuprofen.png" },
    { name: "Inhaler", img: "/images/inhaler.png" },
    { name: "Insulin", img: "/images/insulin.png" },
    { name: "Paracetamol", img: "/images/paracetamol.png" },
    { name: "SSRI", img: "/images/ssri.jpg" },
    { name: "Triptans", img: "/images/triptans.jpg" }
  ];

  return meds.map(m => `
    <div class="option" data-name="${m.name}" data-img="${m.img}">
      <img src="${m.img}" alt="${m.name}" width="24" height="24" />
      ${m.name}
    </div>
  `).join("");
}
document.addEventListener("click", (e) => {
  const clickedOption = e.target.closest(".option");

  if (clickedOption) {
    const dropdown = clickedOption.closest(".custom-select");
    const selectedDisplay = dropdown.querySelector(".selected-option");

    const name = clickedOption.dataset.name;
    const img = clickedOption.dataset.img;

    const existingNames = Array.from(document.querySelectorAll(".selected-option[data-name]"))
      .map(el => el.dataset.name);

    if (existingNames.includes(name)) {
      alert(`You've already selected "${name}". Choose a different medication.`);
      return;
    }

    selectedDisplay.innerHTML = `<img src="${img}" width="24" /> ${name}`;
    selectedDisplay.dataset.name = name;
    selectedDisplay.dataset.img = img;

    clickedOption.closest(".select-options").classList.add("hidden");

    updateMedicationSelectionPreview();
    updateAvailableOptions();
  } else if (!e.target.closest(".custom-select")) {
    document.querySelectorAll(".select-options").forEach(opt => opt.classList.add("hidden"));
  }
});

function updateMedicationSelectionPreview() {
  const preview = document.getElementById("selected-medication-preview");
  const allDropdowns = document.querySelectorAll(".custom-select");
  const medObjects = [];

  preview.innerHTML = "";

  allDropdowns.forEach((select) => {
    const opt = select.querySelector(".selected-option");
    if (opt.dataset.name && opt.dataset.img) {
      medObjects.push({ name: opt.dataset.name, image: opt.dataset.img });
      preview.innerHTML += `<div><img src="${opt.dataset.img}" width="50" /> ${opt.dataset.name}</div>`;
    }
  });

  document.querySelector("input[name='medications']").value = JSON.stringify(medObjects);
}

function updateAvailableOptions() {
  const selectedNames = Array.from(
    document.querySelectorAll(".selected-option[data-name]")
  ).map(opt => opt.dataset.name);

  document.querySelectorAll(".custom-select").forEach(select => {
    const thisSelected = select.querySelector(".selected-option").dataset.name;
    select.querySelectorAll(".option").forEach(option => {
      const name = option.dataset.name;
      option.style.display = selectedNames.includes(name) && name !== thisSelected ? "none" : "flex";
    });
  });
}

// ✅ Patient CRUD
function addPatientForm(event) {
  event.preventDefault();
  const form = event.target;

  let parsedMeds;
  try {
    parsedMeds = JSON.parse(form.medications.value);
  } catch {
    alert("Please select at least one medication.");
    return;
  }

  if (!parsedMeds.length) {
    alert("Please select at least one medication.");
    return;
  }

  const newPatient = {
    first: form.first.value,
    last: form.last.value,
    disease: form.disease.value,
    medications: parsedMeds,
    description: form.description.value
  };

  fetch("/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPatient)
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to add patient");
      return res.json();
    })
    .then(() => location.reload())
    .catch(err => alert(err.message));
}

function loadPatients() {
  const tableBody = document.querySelector("#patients-table tbody");
  tableBody.innerHTML = "";

  fetch("/patients/provider")
    .then(res => res.json())
    .then(patients => {
      patients.forEach((patient, index) => {
        const meds = Array.isArray(patient.medications)
          ? patient.medications.map(m => `
            <div style="display:flex; align-items:center; gap:6px;">
              <img src="${m.image}" width="30" /> ${m.name}
            </div>
          `).join("")
          : "";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${patient.first}</td>
          <td>${patient.last}</td>
          <td>${patient.disease}</td>
          <td>${meds}</td>
          <td>${patient.description}</td>
          <td><button onclick="deletePatient('${patient._id}')">Delete</button></td>
        `;
        tableBody.appendChild(row);
      });
    });
}

function deletePatient(id) {
  fetch(`/patients/${id}`, { method: "DELETE" })
    .then(res => {
      if (!res.ok) throw new Error("Failed to delete patient");
      loadPatients();
    })
    .catch(err => alert(err.message));
}

// ✅ Provider Management
let allProviders = [];

function loadProviders() {
  fetch("/providers")
    .then(res => res.json())
    .then(providers => {
      allProviders = providers;
      renderProviderTable(providers);
      populateSpecialtyFilter(providers);
    });
}

function renderProviderTable(providers) {
  const table = document.querySelector("#providers-table tbody");
  table.innerHTML = "";

  providers.forEach((provider, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><a href="#" onclick="viewProvider(${provider.id})">${provider.name}</a></td>
      <td>${provider.specialty}</td>
      <td>${provider.contact}</td>
      <td>
        <button onclick="editProvider(${provider.id})">✏️ Edit</button>
        <button onclick="deleteProvider(${provider.id})">🗑️ Delete</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function addProviderForm(event) {
  event.preventDefault();
  const form = event.target;

  const provider = {
    id: Date.now(),
    name: form.name.value.trim(),
    specialty: form.specialty.value.trim(),
    contact: form.contact.value.trim()
  };

  fetch("/providers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(provider)
  }).then(() => {
    form.reset();
    loadProviders();
  });
}

function deleteProvider(id) {
  if (!confirm("Are you sure you want to delete this provider?")) return;

  fetch(`/providers/${id}`, { method: "DELETE" })
    .then(res => {
      if (!res.ok) throw new Error("Delete failed");
      loadProviders();
    })
    .catch(err => alert(err.message));
}

function editProvider(id) {
  const provider = allProviders.find(p => p.id === id);
  if (!provider) return;

  const name = prompt("Edit name:", provider.name);
  const specialty = prompt("Edit specialty:", provider.specialty);
  const contact = prompt("Edit contact:", provider.contact);

  if (name && specialty && contact) {
    fetch(`/providers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, specialty, contact })
    }).then(() => loadProviders());
  }
}

function populateSpecialtyFilter(providers) {
  const filter = document.getElementById("specialtyFilter");
  if (!filter) return;

  const specialties = [...new Set(providers.map(p => p.specialty))];
  filter.innerHTML = `<option value="all">All Specialties</option>` +
    specialties.map(s => `<option value="${s}">${s}</option>`).join("");
}

function filterBySpecialty() {
  const selected = document.getElementById("specialtyFilter").value;
  if (selected === "all") {
    renderProviderTable(allProviders);
  } else {
    const filtered = allProviders.filter(p => p.specialty === selected);
    renderProviderTable(filtered);
  }
}

function viewProvider(id) {
  const p = allProviders.find(p => p.id === id);
  if (!p) return;

  alert(`👨‍⚕️ ${p.name}\nSpecialty: ${p.specialty}\nContact: ${p.contact}`);
}



window.addEventListener("DOMContentLoaded", () => {
  fetch("/nav.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("nav-placeholder").innerHTML = html;

      
      // ✅ Responsive nav toggle
      const toggleBtn = document.querySelector(".nav-toggle");
      const navExpand = document.getElementById("nav-drawer");
      if (toggleBtn && navExpand) {
        toggleBtn.addEventListener("click", () => {
          navExpand.classList.toggle("show");
        });
      }

       // ✅ SETUP DARK MODE TOGGLE HERE
      const themeToggle = document.getElementById("theme-toggle");
      if (themeToggle) {
        themeToggle.addEventListener("click", toggleDarkMode);

        const saved = localStorage.getItem("darkMode");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = saved === "enabled" || (!saved && prefersDark);
        themeToggle.textContent = isDark ? "☀️" : "🌙";
      }

      // ✅ SETUP LOGOUT BUTTON HERE TOO
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          fetch("/logout", { method: "POST" })
            .then(() => {
              window.location.href = "/pages/login.html";
            });
        });
      }

      // ✅ Now nav is in the page, fetch the user role
      fetch("/me", { cache: "no-store" })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(user => {
          const navUser = document.getElementById("nav-user");
          // If patient, fetch their profile for full name
          if (user && user.role === "patient") {
            fetch("/patients/me", { cache: "no-store" })
              .then(res => res.ok ? res.json() : null)
              .then(profile => {
                if (profile && profile.first && profile.last) {
                  navUser.textContent = `👋 ${profile.first} ${profile.last}`;
                } else if (user.username) {
                  navUser.textContent = "👋 " + user.username;
                } else {
                  navUser.textContent = "👤 Guest";
                }
              });
          } else if (user && user.role === "provider") {
            fetch("/providers/me", { cache: "no-store" })
              .then(res => res.ok ? res.json() : null)
              .then(profile => {
                if (profile && profile.name) {
                  navUser.textContent = `👋 ${profile.name}`;
                } else if (user.username) {
                  navUser.textContent = "👋 " + user.username;
                } else {
                  navUser.textContent = "👤 Guest";
                }
              });
          } else if (user && user.username) {
            navUser.textContent = "👋 " + user.username;
          } else {
            navUser.textContent = "👤 Guest";
          }

          // Show all authenticated elements
          document.querySelectorAll(".nav-auth").forEach(el => el.style.display = "inline-block");

          // Hide login/register
          document.getElementById("login-btn").style.display = "none";
          document.getElementById("register-btn").style.display = "none";
          document.getElementById("logout-btn").style.display = "inline-block";

          // ✅ Show only if patient
          if (user.role === "patient") {
            // ✅ Show patient-only links
            document.querySelectorAll(".nav-patient").forEach(el => el.style.display = "inline-block");
            // ❌ Remove provider-only links
            document.querySelectorAll(".nav-provider").forEach(el => el.remove());
          }

          if (user.role === "provider") {
            // ✅ Show provider-only links
            document.querySelectorAll(".nav-provider").forEach(el => el.style.display = "inline-block");
            // ❌ Remove patient-only links
            document.querySelectorAll(".nav-patient").forEach(el => el.remove());
          }
          if (user.role === "admin") {
            document.querySelectorAll(".nav-admin").forEach(el => el.style.display = "inline-block");
          }
        })
        .catch(() => {
          // Not logged in – remove protected links
          document.querySelectorAll(".nav-auth").forEach(el => el.remove());
          document.querySelectorAll(".nav-users").forEach(el => el.remove());
          document.getElementById("login-btn").style.display = "inline-block";
          document.getElementById("register-btn").style.display = "inline-block";
          document.getElementById("logout-btn").style.display = "none";
          const navUser = document.getElementById("nav-user");
          if (navUser) navUser.textContent = "👤 Guest";
        });
    });
});
