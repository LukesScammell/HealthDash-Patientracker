async function loadPatientsForAdmin() {
  const res = await fetch("/patients");
  const patients = await res.json();

  const providersRes = await fetch("/providers");
  const providers = await providersRes.json();

  const tbody = document.querySelector("#admin-patient-table tbody");
  tbody.innerHTML = "";

  patients.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.first} ${p.last}</td>
      <td>${p.disease}</td>
      <td>${p.providerUsername || "Unassigned"}</td>
      <td>
        <select id="assign-${p._id}">
          <option value="">Unassigned</option>
          ${providers.map(prov => `
            <option value="${prov.username}" ${prov.username === p.providerUsername ? "selected" : ""}>
              ${prov.name} (${prov.username})
            </option>`).join("")}
        </select>
      </td>
      <td><button onclick="assignProvider('${p._id}')">Update</button></td>
    `;
    tbody.appendChild(row);
  });
}

async function assignProvider(patientId) {
  const select = document.getElementById(`assign-${patientId}`);
  const providerUsername = select.value;

  const res = await fetch(`/patients/${patientId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerUsername })
  });

  if (res.ok) {
    alert("Updated successfully!");
    loadPatientsForAdmin();
  } else {
    alert("Failed to update.");
  }
}

window.addEventListener("DOMContentLoaded", loadPatientsForAdmin);
