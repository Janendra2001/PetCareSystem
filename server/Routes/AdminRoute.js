import express from 'express';
import jwt from 'jsonwebtoken';
import mysql from 'mysql';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { promisify } from 'util';
import { verifyUser } from '../verifyUser.js';

dotenv.config();

const router = express.Router() 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'petcaresystem' 
  });
  
  db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log('MySQL connected...');
  });
  const query = promisify(db.query).bind(db);

router.post('/adminlogin', (req, res) => {
    const sql = "SELECT * FROM admin WHERE email = ? AND password = ?" 
    db.query(sql, [req.body.email, req.body.password], (err, result) => { 
        if(err) return res.json({loginstatus: false, Error: "Query error"}) 
            if(result.length > 0) { 
                const email = result[0].email; 
                const token = jwt.sign({role: "admin", email: email, id: result[0].id}, "jwt_secret_key", {expiresIn: '1d'}); 
                res.cookie('token', token) 
                return res.json({loginstatus: true}) 
            } else { 
                return res.json({loginstatus: false, Error: "wrong email or password"}) 
            }
}) ; 
});


//Medication Items---------------------------------------------------------------------------------------------------------------------


// API endpoint to check if medicine already exists by name
router.post('/check-medicine', (req, res) => {
    const { name } = req.body;
  
    const query = 'SELECT COUNT(*) AS count FROM medicationitems WHERE name = ?';
    db.query(query, [name], (err, result) => {
      if (err) {
        return res.status(500).send({ error: 'Database error' });
      }
  
      if (result[0].count > 0) {
        // Medicine already exists
        res.status(200).send({ exists: true });
      } else {
        // Medicine does not exist
        res.status(200).send({ exists: false });
      }
    });
  });
// API endpoint to add medication item
router.post('/medicationitems', (req, res) => {
    const { type, name, expDate, receivedIssuedStatus, quantity } = req.body;
  
    // Fetch the existing balance for the medication item
    const fetchQuery = 'SELECT balance FROM medicationitems WHERE name = ? LIMIT 1';
    db.query(fetchQuery, [name], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
  
      let existingBalance = 0;
      if (result.length > 0) {
        existingBalance = result[0].balance;
      }
  
      // Calculate the new balance
      let newBalance = existingBalance;
      const quantityInt = parseInt(quantity, 10);
  
      if (receivedIssuedStatus === 'Received' && !isNaN(quantityInt)) {
        newBalance = existingBalance + quantityInt;
      } else if (receivedIssuedStatus === 'Issued' && !isNaN(quantityInt)) {
        newBalance = existingBalance - quantityInt;
      }
  
      // Insert the new medication item with the updated balance
      const insertQuery = 'INSERT INTO medicationitems (type, name, expDate, receivedIssuedStatus, quantity, balance) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(insertQuery, [type, name, expDate, receivedIssuedStatus, quantityInt, newBalance], (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.status(200).send({ message: 'Medication item added successfully', id: result.insertId });
      });
    });
  });
 // API endpoint to get all medication items
router.get('/medicationitems', (req, res) => {
  const query = 'SELECT * FROM medicationitems';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }
    res.status(200).send(results);
  });
});


 // API endpoint to get medicationItemid type name and balance medication items
 router.get('/medication', (req, res) => {
  const query = 'SELECT medicationItemid, type, name, balance FROM medicationitems WHERE type="drug" OR type="vaccine"';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }
    res.status(200).send(results);
  });
});
// API endpoint to delete a medication item by ID
router.delete('/medicationitems/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM medicationitems WHERE medicationItemid = ?';
  db.query(query, [id], (err, result) => {
      if (err) {
          return res.status(500).send({ error: 'Database error' });
      }
      res.status(200).send({ message: 'Medication item deleted successfully' });
  });
});

// API endpoint to update a medication item by ID
router.put('/medicationitems/:id', (req, res) => {
  const { id } = req.params;
  const { type, name, expDate, receivedIssuedStatus, quantity } = req.body;

  const selectQuery = 'SELECT balance FROM medicationitems WHERE medicationItemid = ?';
  db.query(selectQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }

    let existingBalance = results[0].balance;
    let newBalance;

    if (receivedIssuedStatus === 'Received') {
      newBalance = existingBalance + parseInt(quantity, 10);
    } else if (receivedIssuedStatus === 'Issued') {
      newBalance = existingBalance - parseInt(quantity, 10);
    }

    let updateQuery = `
      UPDATE medicationitems 
      SET type = ?, name = ?, receivedIssuedStatus = ?, quantity = ?, balance = ? 
    `;
    const queryParams = [type, name, receivedIssuedStatus, quantity, newBalance];

    if (expDate) {
      updateQuery += `, expDate = ? WHERE medicationItemid = ?`;
      queryParams.push(expDate, id);
    } else {
      updateQuery += ` WHERE medicationItemid = ?`;
      queryParams.push(id);
    }

    db.query(updateQuery, queryParams, (err, result) => {
      if (err) {
        return res.status(500).send({ error: 'Database error' });
      }
      res.status(200).send({ message: 'Medication item updated successfully' });
    });
  });
});

//Pet Owners---------------------------------------------------------------------------------------------------------------------  

  router.get('/petowners', async (req, res) => {
    try {
        const rows = await query('SELECT id, fname, lname, username, email, contact FROM petowners');
        res.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error });
    }
});

router.get('/petowner/:petOwnerId/pets', async (req, res) => {
    const { petOwnerId } = req.params;
    try {
        const rows = await query('SELECT * FROM pet WHERE petOwnerid = ?', [petOwnerId]);
        res.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error });
    }
});


//Home.jsx ---------------------------------------------------------------------------------------------------------------------
// Fetch metrics for total pets and total pet owners
router.get('/metrics', (req, res) => {
  const totalPetsQuery = 'SELECT COUNT(*) as totalPets FROM pet';
  const totalPetOwnersQuery = 'SELECT COUNT(*) as totalPetOwners FROM petowners';

  db.query(totalPetsQuery, (err, totalPetsResult) => {
    if (err) {
      console.error('Error fetching total pets:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    db.query(totalPetOwnersQuery, (err, totalPetOwnersResult) => {
      if (err) {
        console.error('Error fetching total pet owners:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      const metrics = {
        totalPets: totalPetsResult[0].totalPets,
        totalPetOwners: totalPetOwnersResult[0].totalPetOwners,
      };

      res.json(metrics);
    });
  });
});

// Fetch recent activities from pet_case_histories table
router.get('/recentactivities', (req, res) => {
  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  const recentActivitiesQuery = `
    SELECT caseid, petid, caseDate, diagnosis, treatment
    FROM pet_case_histories 
    WHERE DATE(caseDate) = ?
    ORDER BY caseDate DESC
  `;

  db.query(recentActivitiesQuery, [currentDate], (err, recentActivities) => {
    if (err) {
      console.error('Error fetching recent activities:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json(recentActivities);
  });
});

// Get chart data (example: appointments per month)
router.get('/chartdata', (req, res) => {
  db.query(`
      SELECT DATE_FORMAT(AppointmentDate, '%Y-%m') AS month, COUNT(*) AS count
      FROM appointment
      WHERE Status = 'Completed'
      GROUP BY month
      ORDER BY month

    `, (err, chartData) => {
    if (err) {
      console.error('Error fetching chart data:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    console.log('Chart Data:', chartData);

    if (!Array.isArray(chartData)) {
      res.status(500).json({ error: 'Unexpected result format' });
      return;
    }

    res.json(chartData);
  });
});
//Appointment.jsx ---------------------------------------------------------------------------------------------------------------------

// Fetch all requested appointments
router.get('/appointments', (req, res) => {
  db.query('SELECT * FROM appointment WHERE Status = "Requested" ORDER BY SlotNo ASC', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send(results);
  });
});

// Fetch all pending (accepted) appointments for today
router.get('/pending-appointments', (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().split(' ')[0];

  db.query(
    'SELECT * FROM appointment WHERE Status = "Accepted" AND AppointmentDate = ? AND SlotNo > ? ORDER BY SlotNo DESC',
    [currentDate, currentTime],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.send(results);
    }
  );
});

// Accept an appointment
router.post('/appointments/:id/accept', (req, res) => {
  const appointmentId = req.params.id;

  db.query('SELECT * FROM appointment WHERE AppointmentID = ?', [appointmentId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }

    const appointment = results[0];
    if (!appointment) {
      return res.status(404).send({ message: 'Appointment not found' });
    }

    const { AppointmentDate, SlotNo } = appointment;

    db.beginTransaction((err) => {
      if (err) {
        return res.status(500).send(err);
      }

      db.query(
        'UPDATE appointment SET Status = "Accepted" WHERE AppointmentID = ?',
        [appointmentId],
        (err, results) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send(err);
            });
          }

          db.query(
            'UPDATE appointment SET Status = "Declined" WHERE AppointmentDate = ? AND SlotNo = ? AND AppointmentID != ? AND Status = "Requested"',
            [AppointmentDate, SlotNo, appointmentId],
            (err, results) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).send(err);
                });
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).send(err);
                  });
                }
                res.send(results);
              });
            }
          );
        }
      );
    });
  });
});

// Decline an appointment
router.post('/appointments/:id/decline', (req, res) => {
  const appointmentId = req.params.id;
  db.query(
    'UPDATE appointment SET Status = "Declined" WHERE AppointmentID = ?',
    [appointmentId],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.send(results);
    }
  );
});

// Complete an appointment
router.post('/appointments/:id/inprogress', (req, res) => {
  const appointmentId = req.params.id;
  db.query(
    'UPDATE appointment SET Status = "InProgress" WHERE AppointmentID = ?',
    [appointmentId],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.send(results);
    }
  );
});

//logout ---------------------------------------------------------------------------------------------------------------------
router.get('/verify', verifyUser, (req, res) => {
  return res.json({ Status: true, role: req.role, id: req.id, petownerId: req.petownerId, doctorId: req.doctorId });
});
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: true });
  });
export {router as adminRouter} 