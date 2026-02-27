const xlsx = require('xlsx');
const fs = require('fs');

const patients = [
  { name: 'Ana Torres', email: 'ana.torres@mail.com', phone: '3001234', address: 'Calle 1' },
  { name: 'Luis Perez', email: 'luis.perez@mail.com', phone: '3005678', address: 'Calle 2' }
];

const doctors = [
  { name: 'Dr Natalia Perez', email: 'natalia.perez@mail.com', specialty: 'Pediatrics' },
  { name: 'Dr Test', email: 'dr.test@example.com', specialty: 'Cardiology' }
];

const appointments = [
  { appointmentId: 'APT-1001', patientEmail: 'ana.torres@mail.com', doctorName: 'Dr Natalia Perez', appointment_date: '2024-01-14', amount_paid: 60000 },
  { appointmentId: 'APT-1002', patientEmail: 'ana.torres@mail.com', doctorName: 'Dr Test', appointment_date: '2024-02-20', amount_paid: 45000 }
];

const wb = xlsx.utils.book_new();
const wsPatients = xlsx.utils.json_to_sheet(patients);
const wsDoctors = xlsx.utils.json_to_sheet(doctors);
const wsAppointments = xlsx.utils.json_to_sheet(appointments);

xlsx.utils.book_append_sheet(wb, wsPatients, 'patients');
xlsx.utils.book_append_sheet(wb, wsDoctors, 'doctors');
xlsx.utils.book_append_sheet(wb, wsAppointments, 'appointments');

if (!fs.existsSync(__dirname)) fs.mkdirSync(__dirname, { recursive: true });
const outPath = __dirname + '/sample_migration.xlsx';
xlsx.writeFile(wb, outPath);
console.log('Wrote', outPath);
