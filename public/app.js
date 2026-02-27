const API_URL = "http://localhost:3001/api";

// ============ DOCTORS ============
document.getElementById("doctor-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch(`${API_URL}/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    showOutput("doctors-output", result);
    e.target.reset();
    listDoctors();
  } catch (err) {
    showOutput("doctors-output", { error: err.message });
  }
});

document.getElementById("list-doctors").addEventListener("click", () => listDoctors());
document.getElementById("search-doctors").addEventListener("click", () => {
  const term = document.getElementById("doctor-search").value.trim();
  listDoctors(term);
});

async function listDoctors(search) {
  const params = search ? `?q=${encodeURIComponent(search)}` : "";
  try {
    const res = await fetch(`${API_URL}/doctors${params}`);
    const doctors = await res.json();
    const tbody = document.getElementById("doctors-tbody");
    tbody.innerHTML = "";

    doctors.forEach((doc) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${doc.name}</td>
        <td>${doc.email}</td>
        <td>${doc.specialty}</td>
        <td class="actions">
          <button onclick="editDoctorModal('${doc.id}', '${escapeQuotes(doc.name)}', '${doc.email}', '${doc.specialty}')">Edit</button>
          <button class="danger" onclick="deleteDoctor('${doc.id}', '${escapeQuotes(doc.name)}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById("doctors-table").style.display = "table";
    showOutput("doctors-output", { count: doctors.length, message: "Doctors loaded" });
  } catch (err) {
    showOutput("doctors-output", { error: err.message });
  }
}

function editDoctorModal(id, name, email, specialty) {
  const newName = prompt("Doctor name:", name);
  if (!newName) return;
  const newEmail = prompt("Email:", email);
  if (!newEmail) return;
  const newSpecialty = prompt("Specialty:", specialty);
  if (!newSpecialty) return;

  updateDoctor(id, newName, newEmail, newSpecialty);
}

async function updateDoctor(id, name, email, specialty) {
  try {
    const res = await fetch(`${API_URL}/doctors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, specialty }),
    });
    const result = await res.json();
    showOutput("doctors-output", { message: "Doctor updated", result });
    listDoctors();
  } catch (err) {
    showOutput("doctors-output", { error: err.message });
  }
}

async function deleteDoctor(id, name) {
  if (!confirm(`Delete doctor "${name}"?`)) return;

  try {
    const res = await fetch(`${API_URL}/doctors/${id}`, { method: "DELETE" });
    const result = await res.json();
    showOutput("doctors-output", { message: "Doctor deleted", result });
    listDoctors();
  } catch (err) {
    showOutput("doctors-output", { error: err.message });
  }
}

// ============ PATIENTS ============

document.getElementById("patient-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch(`${API_URL}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    showOutput("patients-output", result);
    e.target.reset();
    listPatients();
  } catch (err) {
    showOutput("patients-output", { error: err.message });
  }
});

document.getElementById("list-patients").addEventListener("click", () => listPatients());
document.getElementById("search-patients").addEventListener("click", () => {
  const term = document.getElementById("patient-search").value.trim();
  listPatients(term);
});

async function listPatients(search) {
  const params = search ? `?q=${encodeURIComponent(search)}` : "";
  try {
    const res = await fetch(`${API_URL}/patients${params}`);
    const patients = await res.json();
    const tbody = document.getElementById("patients-tbody");
    tbody.innerHTML = "";

    patients.forEach((pat) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${pat.name}</td>
        <td>${pat.email}</td>
        <td>${pat.phone}</td>
        <td>${pat.address}</td>
        <td class="actions">
          <button onclick="editPatientModal('${escapeQuotes(pat.name)}', '${pat.email}', '${pat.phone}', '${escapeQuotes(pat.address)}')">Edit</button>
          <button class="secondary" onclick="getPatientHistory('${pat.email}')">History</button>
          <button class="danger" onclick="deletePatient('${pat.email}', '${escapeQuotes(pat.name)}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById("patients-table").style.display = "table";
    showOutput("patients-output", { count: patients.length, message: "Patients loaded" });
  } catch (err) {
    showOutput("patients-output", { error: err.message });
  }
}

function editPatientModal(name, email, phone, address) {
  const newName = prompt("Patient name:", name);
  if (!newName) return;
  const newPhone = prompt("Phone:", phone);
  if (!newPhone) return;
  const newAddress = prompt("Address:", address);
  if (!newAddress) return;

  updatePatient(email, newName, newPhone, newAddress);
}

async function updatePatient(email, name, phone, address) {
  try {
    const res = await fetch(`${API_URL}/patients/${email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, address }),
    });
    const result = await res.json();
    showOutput("patients-output", { message: "Patient updated", result });
    listPatients();
  } catch (err) {
    showOutput("patients-output", { error: err.message });
  }
}

async function deletePatient(email, name) {
  if (!confirm(`Delete patient "${name}"?`)) return;

  try {
    const res = await fetch(`${API_URL}/patients/${email}`, { method: "DELETE" });
    const result = await res.json();
    showOutput("patients-output", { message: "Patient deleted", result });
    listPatients();
  } catch (err) {
    showOutput("patients-output", { error: err.message });
  }
}

async function getPatientHistory(email) {
  try {
    const res = await fetch(`${API_URL}/patients/${email}/history`);
    const history = await res.json();
    showOutput("patients-output", { type: "patient_history", history });
  } catch (err) {
    showOutput("patients-output", { error: err.message });
  }
}

// ============ REPORTS ============

document.getElementById("revenue-report").addEventListener("click", async () => {
  const start = document.getElementById("start-date").value;
  const end = document.getElementById("end-date").value;
  const params = new URLSearchParams();
  if (start) params.append("startDate", start);
  if (end) params.append("endDate", end);

  try {
    const res = await fetch(`${API_URL}/reports/revenue?${params}`);
    const report = await res.json();
    showOutput("reports-output", report);
  } catch (err) {
    showOutput("reports-output", { error: err.message });
  }
});

// ============ MIGRATION ============

document.getElementById("migration-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    const res = await fetch(`${API_URL}/migration/upload`, {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    showOutput("migration-output", result);
    e.target.reset();
  } catch (err) {
    showOutput("migration-output", { error: err.message });
  }
});

// ============ HELPERS ============

function showOutput(elementId, data) {
  const el = document.getElementById(elementId);
  el.textContent = JSON.stringify(data, null, 2);
  el.classList.add("show");
}

function escapeQuotes(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}
