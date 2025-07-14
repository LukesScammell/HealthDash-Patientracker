// 🌓 Dark Mode Setup + Nav Auth Display
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
}

function logout() {
  fetch("/logout", { method: "POST" }).then(() => location.href = "login.html");
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
    { name: "Amoxicillin", img: "images/medications/amoxicillin.png" },
    { name: "Antihistamines", img: "images/medications/antihistamines.jpg" },
    { name: "Antivirals", img: "images/medications/antivirals.png" },
    { name: "Ibuprofen", img: "images/medications/ibuprofen.png" },
    { name: "Inhaler", img: "images/medications/inhaler.png" },
    { name: "Insulin", img: "images/medications/insulin.png" },
    { name: "Paracetamol", img: "images/medications/paracetamol.png" },
    { name: "SSRI", img: "images/medications/ssri.jpg" },
    { name: "Triptans", img: "images/medications/triptans.jpg" }
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

  fetch("/patients")
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
// script.js

// Load the nav HTML dynamically
// Load the nav and set everything up
fetch("nav.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("nav-placeholder").innerHTML = html;

    // ✅ Set up nav toggle
    const toggleBtn = document.querySelector(".nav-toggle");
    const navExpand = document.getElementById("nav-expand");
    if (toggleBtn && navExpand) {
      toggleBtn.addEventListener("click", () => {
        navExpand.classList.toggle("show");
      });
    }

    // ✅ Set up dark mode
    const darkBtn = document.querySelector("button[onclick='toggleDarkMode()']");
    if (darkBtn) {
      darkBtn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark");
        localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
      });
    }

    // ✅ Set up logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        fetch("/logout", { method: "POST" }).then(() => location.href = "login.html");
      });
    }

    // ✅ Load dark mode preference
    if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark");
    }
    

    // ✅ Then handle login state
    fetch("/me", { credentials: "include", cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(user => {
        document.getElementById("nav-user").textContent = "👋 " + user.username;
        document.querySelectorAll(".nav-auth").forEach(el => el.style.display = "inline-block");
        document.getElementById("login-btn").style.display = "none";
        document.getElementById("register-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "inline-block";

        if (user.role === "provider") {
          document.querySelectorAll(".nav-users").forEach(el => el.style.display = "inline-block");
        }
      })
      .catch(() => {
        document.querySelectorAll(".nav-auth").forEach(el => el.remove());
        document.querySelectorAll(".nav-users").forEach(el => el.remove());
        document.getElementById("login-btn").style.display = "inline-block";
        document.getElementById("register-btn").style.display = "inline-block";
        document.getElementById("logout-btn").style.display = "none";
      });
      
  });
  // Inside fetch('nav.html') then block
const toggleBtn = document.querySelector(".nav-toggle");
const navExpand = document.getElementById("nav-expand");
const navbar = document.querySelector(".navbar");

if (toggleBtn && navExpand && navbar) {
  toggleBtn.addEventListener("click", () => {
    navExpand.classList.toggle("show");
    navbar.classList.toggle("expanded");
  });
}


