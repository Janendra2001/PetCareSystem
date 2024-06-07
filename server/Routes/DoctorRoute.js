import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { __dirname } from '../dirname.js';
import { promisify } from 'util';

dotenv.config();

const router = express.Router();

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petcaresystem'
});



// Doctor Login
router.post('/doctorlogin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [existingUser] = await db.query('SELECT * FROM doctor WHERE email = ?', [email]);
    if (existingUser.length === 0) {
      return res.status(404).json({ loginstatus: false, Error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser[0].password);
    if (!isPasswordValid) {
      return res.json({ loginstatus: false, Error: "Wrong email or password" });
    }

    const doctorId = existingUser[0].id; 
    const token = jwt.sign({ role: "doctor", email: email, doctorId: doctorId }, "doctor_secret_key", { expiresIn: '1d' });
    res.cookie('token', token);
    return res.json({ loginstatus: true, doctorId: doctorId });
  } catch (error) {
    res.status(500).json({ loginstatus: false, Error: "Internal server error" });
  }
});

// Add a new doctor
router.post('/adddoctor', async (req, res) => {
  const { username, firstname, lastname, email, password, confirmPassword, contactNo, education, regNo , experience } = req.body;

  // Check if all fields are provided
  if (!username || !firstname || !lastname || !email || !password || !confirmPassword || !contactNo || !education || !regNo || !experience) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if email is already in use
    const [existingDoctor] = await db.query('SELECT email FROM doctor WHERE email = ?', [email]);
    if (existingDoctor.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new doctor into the database
    await db.query('INSERT INTO doctor (userName, firstName, lastName, email, password, contactNo, status, education, regNo, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [username, firstname, lastname, email, hashedPassword, contactNo, 'active', education, regNo, experience]);

    res.status(201).json({ message: "Doctor registration successful" });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
});

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const [doctors] = await db.query('SELECT id, username,firstname, lastname, email, contactNo, status, education, regNo, experience FROM doctor');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
});
// Edit a doctor
router.put('/editdoctor/:id', async (req, res) => {
  const { id } = req.params;
  const { userName, firstName, lastName, email, contactNo, education, regNo, experience, status } = req.body;

  try {
    await db.query('UPDATE doctor SET userName = ?, firstName = ?, lastName = ?, email = ?, contactNo = ?, education = ?, regNo = ?, experience = ?, status = ? WHERE id = ?',
      [userName, firstName, lastName, email, contactNo, education, regNo, experience, status, id]);
    res.json({ message: "Doctor details updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
});

// Delete a doctor
router.delete('/deletedoctor/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM doctor WHERE id = ?', [id]);
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
});

//ManagePets.jsx ---------------------------------------------------------------------------------------------------------------
// Fetch all pets
router.get('/pets', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pet');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// Search pets
router.get('/pets/search', async (req, res) => {
  const { petid, sex, species, breed, petOwnerid } = req.query;
  let query = 'SELECT * FROM pet WHERE 1=1';
  const params = [];

  if (petid) {
    query += ' AND petid = ?';
    params.push(petid);
  }
  if (sex) {
    query += ' AND sex LIKE ?';
    params.push(`%${sex}%`);
  }
  if (species) {
    query += ' AND species LIKE ?';
    params.push(`%${species}%`);
  }
  if (breed) {
    query += ' AND breed LIKE ?';
    params.push(`%${breed}%`);
  }
  if (petOwnerid) {
    query += ' AND petOwnerid = ?';
    params.push(petOwnerid);
  }

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});
//EnterCases.jsx ---------------------------------------------------------------------------------------------------------------

// Fetch pet details by pet ID
router.get('/pet/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM pet WHERE petid = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Pet not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// Fetch pet details by Contact No
router.get('/appointment/:contactNo', async (req, res) => {
  const { contactNo } = req.params;
  try {
    const [appointmentRows] = await db.query('SELECT petid FROM appointment WHERE ContactNo = ? AND Status = "InProgress"', [contactNo]);
    if (appointmentRows.length > 0) {
      const petId = appointmentRows[0].petid;
      const [petRows] = await db.query('SELECT * FROM pet WHERE petid = ?', [petId]);
      if (petRows.length > 0) {
        res.json(petRows[0]);
      } else {
        res.status(404).json({ message: 'Pet not found' });
      }
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// Enter a new case for a pet
router.post('/entercase', async (req, res) => {
  const { petId, diagnosis, caseType, treatment, prescription, remarks, nextVaccinationDate } = req.body;
  try {
    await db.query(
      'INSERT INTO pet_case_histories (petid, diagnosis, caseType, treatment, prescription, remarks, nextVaccinationDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [petId, diagnosis, caseType, treatment, prescription, remarks, nextVaccinationDate || null]
    );
    await db.query('UPDATE appointment SET Status = "Completed" WHERE petid = ? AND Status = "InProgress"', [petId]);
    res.json({ message: 'Case entered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});
//PetCasesRegister.jsx ---------------------------------------------------------------------------------------------------------------
// Fetch pet cases
router.get('/:doctorId/pets/:petId/cases', async (req, res) => {
  const { doctorId, petId } = req.params;
  console.log(`Fetching cases for doctorId: ${doctorId}, petId: ${petId}`);
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
//DoctorHome.jsx ----------------------------------------------------------------------------------------------------------------------
// Fetch metrics for total pets and total pet owners
router.get('/metrics', async (req, res) => {
  try {
    const [totalPetsResult] = await db.query('SELECT COUNT(*) as totalPets FROM pet');
    const [totalPetOwnersResult] = await db.query('SELECT COUNT(*) as totalPetOwners FROM petowners');

    const metrics = {
      totalPets: totalPetsResult[0].totalPets,
      totalPetOwners: totalPetOwnersResult[0].totalPetOwners,
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch recent activities from pet_case_histories table
router.get('/recentactivities', async (req, res) => {
  try {
    const [recentActivities] = await db.query(`
      SELECT petid, caseDate, diagnosis, treatment 
      FROM pet_case_histories 
      ORDER BY caseDate DESC 
      LIMIT 13
    `);

    res.json(recentActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chart data for appointments per month
router.get('/chartdata', async (req, res) => {
  try {
    const [chartData] = await db.query(`
      SELECT DATE_FORMAT(AppointmentDate, '%Y-%m') AS month, COUNT(*) AS count
      FROM appointment
      WHERE Status = 'Completed'
      GROUP BY month
      ORDER BY month
    `);

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get disease distribution data
router.get('/diseasedistribution', async (req, res) => {
  try {
    const [diseaseDistributionData] = await db.query(`
      SELECT diagnosis, COUNT(*) AS count
      FROM pet_case_histories
      GROUP BY diagnosis
    `);

    res.json(diseaseDistributionData);
  } catch (error) {
    console.error('Error fetching disease distribution data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//DoctorAppointments.jsx ---------------------------------------------------------------------------------------------------------------
// Endpoint to get appointments for doctors
router.get('/appointments/pending/doctor', (req, res) => {
  const query = `SELECT * FROM appointment WHERE Status = 'Accepted'`;
  db.query(query, (err, appointments) => {
    if (err) {
      console.error('Error fetching pending appointments:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(appointments);
  });
});





export { router as doctorRouter };