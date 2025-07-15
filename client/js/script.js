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


// Show nav links if logged in
fetch("/me")
  .then(res => res.json())
  .then(user => {
    document.getElementById("nav-user").innerText = "👋 " + user.username;
    document.querySelectorAll(".nav-auth").forEach(el => el.style.display = "inline");
  })
  .catch(() => {
    document.querySelectorAll(".nav-auth").forEach(el => el.remove());
    const logoutBtn = document.querySelector("button[onclick='logout()']");
    if (logoutBtn) logoutBtn.style.display = "none";
  });


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
          // Show username
          document.getElementById("nav-user").textContent = "👋 " + user.username;

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
        });
    });
});
