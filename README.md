# SaludPlus Backend

Simple Express/MongoDB/MySQL API for managing doctors, patients and reports.

## Setup

1. Clone repository and go into folder:
   ```bash
   cd /home/coders/Documentos/SaludPLus
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster/yourdb
   PORT=3000
   ```
5. Ensure MySQL database is running and contains the following normalized tables (3NF):
   ```sql
   -- patients table
   CREATE TABLE patients (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(100) NOT NULL UNIQUE,
     phone VARCHAR(20),
     address VARCHAR(200)
   );

   -- doctors table
   CREATE TABLE doctors (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(100) NOT NULL UNIQUE,
     specialty VARCHAR(100)
   );

   -- insurances table
   CREATE TABLE insurances (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL UNIQUE,
     coverage_percentage DECIMAL(5,2)
   );

   -- appointments table (FKs reference other normalized entities)
   CREATE TABLE appointments (
     id INT AUTO_INCREMENT PRIMARY KEY,
     appointment_id VARCHAR(50) NOT NULL,
     appointment_date DATE NOT NULL,
     patient_id INT NOT NULL,
     doctor_id INT NOT NULL,
     insurance_id INT NULL,
     treatment_code VARCHAR(50),
     treatment_description TEXT,
     treatment_cost DECIMAL(10,2),
     amount_paid DECIMAL(10,2),
     FOREIGN KEY (patient_id) REFERENCES patients(id),
     FOREIGN KEY (doctor_id) REFERENCES doctors(id),
     FOREIGN KEY (insurance_id) REFERENCES insurances(id)
   );
   ```

   These four tables satisfy 3NF: each relation represents a single entity with no redundant data, and foreign keys link them rather than duplicating attributes.

5. Run the server:
   ```bash
   npm run dev   # uses nodemon
   ```

The API listens on `http://localhost:3000`.

## Endpoints

### Doctors
- `GET /api/doctors` – list doctors (use `?specialty=` to filter)
- `GET /api/doctors/:id` – get one doctor
- `POST /api/doctors` – create doctor (body: `name,email,specialty`)
- `PUT /api/doctors/:id` – update doctor
- `DELETE /api/doctors/:id` – remove doctor

### Patients
- `POST /api/patients` – create patient (`name,email,phone,address`)
- `PUT /api/patients/:email` – update
- `DELETE /api/patients/:email` – delete
- `GET /api/patients/:email/history` – get history from Mongo

### Reports
- `GET /api/reports/revenue` – revenue report, accepts optional `startDate` and `endDate` query params

### Migration
- `POST /api/migration/upload` – upload an Excel file with sheets named `patients`, `doctors`, `appointments`.  File field name should be `file`.
  The service will insert rows into MySQL and update Mongo patient histories. **It is idempotent**: repeated uploads do not create duplicates because
  the code uses `ON DUPLICATE KEY` for patients/doctors, checks existing
  appointments before insert, and pushes to Mongo with `$addToSet`.

## Frontend

A very small static frontend is served from `/public/index.html` that lets you hit the API end-to-end. Open `http://localhost:3000/` in your browser.

## Development Notes

- Code follows simple controller/service pattern.
- Centralized error handler in `config/errorHandler.js`.
- Add new modules under `modules/`.
- README in root may contain more project‑wide info.

Feel free to extend with authentication, validation, or UI enhancements.
