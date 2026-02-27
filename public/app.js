// simple helper to display results
function show(id, data) {
  document.getElementById(id).textContent = JSON.stringify(data, null, 2);
}

// doctors
const doctorForm = document.getElementById("doctor-form");
doctorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(doctorForm);
  const body = Object.fromEntries(form);
  const res = await fetch("/api/doctors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  show("doctors-output", await res.json());
});

document.getElementById("list-doctors").addEventListener("click", async () => {
  const res = await fetch("/api/doctors");
  show("doctors-output", await res.json());
});

// patients
const patientForm = document.getElementById("patient-form");
patientForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(patientForm));
  const res = await fetch("/api/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  show("patients-output", await res.json());
});

document.getElementById("get-history").addEventListener("click", async () => {
  const email = document.getElementById("history-email").value;
  const res = await fetch(`/api/patients/${encodeURIComponent(email)}/history`);
  show("patients-output", await res.json());
});

// reports
document.getElementById("revenue-report").addEventListener("click", async () => {
  const start = document.getElementById("start-date").value;
  const end = document.getElementById("end-date").value;
  const q = new URLSearchParams();
  if (start) q.set("startDate", start);
  if (end) q.set("endDate", end);
  const res = await fetch(`/api/reports/revenue?${q.toString()}`);
  show("reports-output", await res.json());
});

// migration
const migrationForm = document.getElementById("migration-form");
migrationForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(migrationForm);
  const res = await fetch("/api/migration/upload", {
    method: "POST",
    body: formData,
  });
  show("migration-output", await res.json());
});
