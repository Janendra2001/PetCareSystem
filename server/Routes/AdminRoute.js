import express from 'express';
import jwt from 'jsonwebtoken';
import mysql from 'mysql';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { promisify } from 'util';
import nodemailer from 'nodemailer';
import { verifyUser } from '../verifyUser.js';

dotenv.config();

const router = express.Router();
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





setTimeout(() => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
}, 1000);

// Function to send email using nodemailer
const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Route to check vaccination dates and send reminders
router.get('/send-vaccination-reminders', async (req, res) => {
  try {
    const today = new Date();
    const eightAgo = new Date();
    eightAgo.setDate(today.getDate() + 8);
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() + 7);
    const sixAgo = new Date();
    sixAgo.setDate(today.getDate() + 6);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() + 3);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(today.getDate() + 1);

    const queryStr = `
      SELECT pc.*, p.petOwnerid, po.email, p.petName
      FROM pet_case_histories pc
      INNER JOIN pet p ON pc.petid = p.petid
      INNER JOIN petowners po ON p.petOwnerid = po.id
      WHERE pc.nextVaccinationDate IN (?, ?, ?, ?, ?)
    `;

    const rows = await query(queryStr, [
      eightAgo.toISOString().slice(0, 10),
      weekAgo.toISOString().slice(0, 10),
      sixAgo.toISOString().slice(0, 10),
      threeDaysAgo.toISOString().slice(0, 10),
      oneDayAgo.toISOString().slice(0, 10)
    ]);

    if (rows.length > 0) {
      console.log(`Found ${rows.length} records for sending reminders.`);
      rows.forEach(async (row) => {
        const { petid, petName, caseDate, remarks, nextVaccinationDate, email } = row;
        const subject = 'Vaccination Reminder';
        const html = `
          <p>Dear Pet Owner,</p>
          <p>This is a reminder for the vaccination of your pet:</p>
          <ul>
            <li>Pet ID: ${petid}</li>
            <li>Pet Name: ${petName}</li>
            <li>Last Vaccination Date: ${caseDate}</li>
            <li>Remarks: ${remarks}</li>
            <li>Next Vaccination Date: ${nextVaccinationDate}</li>
          </ul>
          <p>Please ensure your pet's vaccinations are up-to-date.</p>
          <p>Regards,<br>Your Pet Care Team</p>
        `;

        await sendEmail(email, subject, html);
      });
    } else {
      console.log('No records found for sending reminders.');
    }

    res.status(200).json({ message: 'Vaccination reminders sent successfully' });
    console.log('Vaccination reminders sent successfully');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
  } catch (error) {
    console.error('Error sending vaccination reminders:', error);
    res.status(500).json({ error: 'Failed to send vaccination reminders' });
  }
});


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
    const { type, name, expDate , receivedIssuedStatus, quantity, minquantity } = req.body;
  
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
      } 
  
      // Insert the new medication item with the updated balance
      const insertQuery = 'INSERT INTO medicationitems (type, name, expDate, receivedIssuedStatus, quantity, balance, minquantity) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(insertQuery, [type, name, expDate , receivedIssuedStatus, quantityInt, newBalance, minquantity], (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.status(200).send({ message: 'Medication item added successfully', id: result.insertId });
      });
    });
  });

  // API endpoint to fetch "NotFinished" pet cases
router.get('/petcases/notfinished', (req, res) => {
  const query = 'SELECT * FROM pet_case_histories WHERE Status = "NotFinished"';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results);
  });
});

// API endpoint to update a pet case status to "Finished"
router.put('/petcases/finish/:caseid', (req, res) => {
  const caseId = req.params.caseid;
  const query = 'UPDATE pet_case_histories SET Status = "Finished" WHERE caseid = ?';
  db.query(query, [caseId], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send({ message: 'Case marked as Finished' });
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
  const { type, name, expDate, receivedIssuedStatus, quantity} = req.body;

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
      if (parseInt(quantity, 10) > existingBalance) {
        return res.status(400).send({ error: 'The existing quantity is not enough for the issued.' });
      }
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
// API endpoint to update the min quantity of a medication item by ID
router.put('/medicationitems/minquantity/:id', (req, res) => {
  const { id } = req.params;
  const { minquantity } = req.body;

  const updateQuery = 'UPDATE medicationitems SET minquantity = ? WHERE medicationItemid = ?';
  db.query(updateQuery, [minquantity, id], (err, result) => {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }
    res.status(200).send({ message: 'Min quantity updated successfully' });
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

//Profile.jsx -----------------------------------------------------------------------------------------------------------------
// Fetch admin profile
router.get('/getprofile', (req, res) => {
  db.query('SELECT * FROM admin WHERE ID = 1',  (err, result) => {
    if (err) throw err;
    res.send(result[0]);
  });
});

// Update admin profile
router.put('/updateprofile', (req, res) => {
  const { UserName, FirstName, LastName, email, ContactNo } = req.body;
  db.query(
    'UPDATE admin SET UserName = ?, FirstName = ?, LastName = ?, email = ?, ContactNo = ? WHERE ID = 1',
    [UserName, FirstName, LastName, email, ContactNo],
    (err, result) => {
      if (err) throw err;
      res.send({ message: 'Profile updated successfully!' });
    }
  );
});

// Update admin password
router.put('/password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  db.query('SELECT password FROM admin WHERE ID = 1', (err, result) => {
    if (err) throw err;
    if (result[0].password !== currentPassword) {
      return res.status(400).send({ message: 'Current password is incorrect.' });
    }
    db.query('UPDATE admin SET password = ? WHERE ID = 1', [newPassword], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Password updated successfully!' });
    });
  });
});
export {router as adminRouter}