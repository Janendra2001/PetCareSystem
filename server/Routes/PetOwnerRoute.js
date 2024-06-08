import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import multer from 'multer';
import path from 'path';
import { __dirname } from '../dirname.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();


const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petcaresystem'
});



// Set up multer for file uploads ----------------------------------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });

//Pet Owner Registration ------------------------------------------------------------------------------------------------------------
router.post('/register', async (req, res) => {
  const { fname, lname, username, email, contact, password, confirmPassword } = req.body;

  if (!fname || !lname || !username || !email || !contact || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const [existingUser] = await db.query('SELECT email FROM petowners WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO petowners (fname, lname, username, email, contact, password) VALUES (?, ?, ?, ?, ?, ?)', [fname, lname, username, email, contact, hashedPassword]);

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
});
//Pet Owner Login ------------------------------------------------------------------------------------------------------------------
router.post('/petownerlogin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [existingUser] = await db.query('SELECT * FROM petowners WHERE email = ?', [email]);
    if (existingUser.length === 0) {
      return res.status(404).json({ loginstatus: false, Error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser[0].password);
    if (!isPasswordValid) {
      return res.json({ loginstatus: false, Error: "Wrong email or password" });
    }

    const petownerId = existingUser[0].id; 
    const token = jwt.sign({ role: "petowner", email: email, petownerId: petownerId }, "pet_owner_secret_key", { expiresIn: '1d' });
    res.cookie('token', token);
    return res.json({ loginstatus: true, petownerId: petownerId });
  } catch (error) {
    res.status(500).json({ loginstatus: false, Error: "Internal server error" });
  }
});

//Pets.jsx routes-------------------------------------------------------------------------------------------------------------------
// Add this to serve static files from the uploads directory
// Middleware
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a new pet
router.post('/addpet', upload.single('photo'), async (req, res) => {
  const { petownerId, petName, birthDate, sex, species, breed } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!petownerId || !petName || !birthDate || !sex || !species || !breed || !photo) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    // Check if the pet already exists
    const [rows] = await db.execute('SELECT * FROM pet WHERE petOwnerid = ? AND petName = ?', [petownerId, petName]);
    if (rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Pet already registered' });
    }

    // Insert the new pet record
    const query = 'INSERT INTO pet (petOwnerid, petName, birthDate, sex, species, breed, photo, registeredDate) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';
    await db.execute(query, [petownerId, petName, birthDate, sex, species, breed, photo]);

    res.json({ success: true });
  } catch (err) {
    console.error('Error inserting pet:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});


router.get('/:petownerId/pets', async (req, res) => {
  const { petownerId } = req.params;

  try {
    const [rows] = await db.execute('SELECT * FROM pet WHERE petOwnerid = ?', [petownerId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching pets:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

router.delete('/:petownerId/pets/:petid', async (req, res) => {
  const { petid } = req.params;

  try {
    await db.execute('DELETE FROM pet WHERE petid = ?', [petid]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting pet:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});



//EditPet.jsx routes ----------------------------------------------------------------------------------------------------------------
// Fetch a specific pet's details
router.get('/:petownerId/pets/:petid', async (req, res) => {
  const { petid } = req.params;

  try {
    const [rows] = await db.execute('SELECT * FROM pet WHERE petid = ?', [petid]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching pet details:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update a pet's details
router.put('/:petownerId/pets/:petid', upload.single('photo'), async (req, res) => {
  const { petid } = req.params;
  const { petName, birthDate, sex, species, breed } = req.body;
  const photo = req.file ? req.file.filename : null;

  try {
    // Construct the SQL query based on whether a new photo is uploaded
    let query;
    let params;
    if (photo) {
      query = 'UPDATE pet SET petName = ?, birthDate = ?, sex = ?, species = ?, breed = ?, photo = ? WHERE petid = ?';
      params = [petName, birthDate, sex, species, breed, photo, petid];
    } else {
      query = 'UPDATE pet SET petName = ?, birthDate = ?, sex = ?, species = ?, breed = ? WHERE petid = ?';
      params = [petName, birthDate, sex, species, breed, petid];
    }

    // Execute the query
    await db.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating pet details:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

//PetOwnerProfile.jsx routes --------------------------------------------------------------------------------------------------------
// Fetch pet owner profile
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM petowners WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Pet owner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// Update pet owner profile details
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fname, lname, email, contact } = req.body;
  try {
    await db.query('UPDATE petowners SET fname = ?, lname = ?, email = ?, contact = ? WHERE id = ?', [fname, lname, email, contact, id]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// Update pet owner profile photo
router.post('/:id/uploadphoto', upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const photo = req.file ? req.file.filename : null;

  if (!photo) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    await db.query('UPDATE petowners SET photo = ? WHERE id = ?', [photo, id]);
    res.json({ photo });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// Route to update pet owner password
router.put('/:id/password', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'New password and confirm new password do not match.' });
  }

  try {
    // Fetch the current password hash from the database
    const [rows] = await db.query('SELECT password FROM petowners WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pet owner not found.' });
    }

    const petOwner = rows[0];

    // Compare the provided current password with the stored hash
    const isMatch = await bcrypt.compare(currentPassword, petOwner.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await db.query('UPDATE petowners SET password = ? WHERE id = ?', [hashedNewPassword, id]);

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'An error occurred while updating password.' });
  }
});

//ViewPetCaseHistories.jsx ------------------------------------------------------------------------------------------------------------
// Route to fetch pet case histories
router.get('/:petownerId/pets/:petId/cases', async (req, res) => {
  const { petownerId, petId } = req.params;
  console.log(`Fetching cases for petownerId: ${petownerId}, petId: ${petId}`);
  try {
    const [rows] = await db.query('SELECT * FROM pet_case_histories WHERE petid = ? ORDER BY caseDate DESC', [petId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No cases found for this pet.' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
});
//PetOwnerAppointment.jsx --------------------------------------------------------------------------------------------------------------


// Get all pets registered by the pet owner
router.get('/:petownerId/pets', async (req, res) => {
  const { petownerId } = req.params;
  try {
    const [results] = await db.query('SELECT petid, petName FROM pet WHERE petOwnerid = ?', [petownerId]);
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get available slots for a specific date
router.get('/appointments/availableslots', async (req, res) => {
  const { appointmentDate } = req.query;
  const allSlots = [
    'Slot1 (4.00pm to 4.30pm)', 'Slot2 (4.30pm to 5.00pm)', 'Slot3 (5.00pm to 5.30pm)', 
    'Slot4 (5.30pm to 6.00pm)', 'Slot5 (6.00pm to 6.30pm)', 'Slot6 (6.30pm to 7.00pm)', 
    'Slot7 (7.00pm to 7.30pm)', 'Slot8 (7.30pm to 8.00pm)', 'Slot9 (8.00pm to 8.30pm)', 
    'Slot10 (8.30pm to 9.00pm)'
  ];

  try {
    const [results] = await db.query('SELECT SlotNo FROM appointment WHERE AppointmentDate = ? AND Status = "Accepted"', [appointmentDate]);
    const occupiedSlots = results.map(row => row.SlotNo);
    const availableSlots = allSlots.filter(SlotNo => !occupiedSlots.includes(SlotNo));
    res.json(availableSlots);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Request an appointment
router.post('/appointments', async (req, res) => {
  const { appointments } = req.body;

  const values = appointments.map(app => [
    app.petid,
    app.appointmentType || '',
    app.otherSurgery || '',
    app.contactNo || '',
    app.appointmentDate || '',
    app.slotNo || '',
    'Requested'
  ]);

  try {
    const [results] = await db.query('INSERT INTO appointment (petid, AppointmentType, OtherSurgery, ContactNo, AppointmentDate, SlotNo, Status) VALUES ?', [values]);
    res.status(201).json(results);
  } catch (err) {
    console.error('Error inserting appointment:', err);
    res.status(500).send(err);
  }
});

// Get all appointments made by the pet owner
router.get('/:petownerId/appointments', async (req, res) => {
  const { petownerId } = req.params;
  try {
    const [results] = await db.query(`
      SELECT 
        AppointmentID, petid, AppointmentType, OtherSurgery, ContactNo, AppointmentDate, SlotNo, Status 
      FROM 
        appointment 
      WHERE 
        petid IN (SELECT petid FROM pet WHERE petOwnerid = ?)
      ORDER BY 
        AppointmentDate DESC
    `, [petownerId]);
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Cancel an appointment
router.put('/appointments/:appointmentId/cancel', async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const [results] = await db.query('UPDATE appointment SET Status = "Canceled" WHERE AppointmentID = ?', [appointmentId]);
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

//logout ------------------------------------------------------------------------------------------------------------------------------
router.get('/logout/:petownerID', (req, res) => {
  res.clearCookie('token');
  return res.json({ Status: true });
});


export { router as petOwnerRouter };