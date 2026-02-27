require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    console.log('Connected. Database name:', db.databaseName);
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name));
    const patientColl = db.collection('patient_histories');
    const count = await patientColl.countDocuments();
    console.log('patient_histories count:', count);
    const sample = await patientColl.findOne();
    console.log('sample doc:', sample);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
