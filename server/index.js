import express from "express"; 
import cors from 'cors'
import bodyParser from 'body-parser' 
import {adminRouter} from './Routes/AdminRoute.js'
import {doctorRouter} from './Routes/DoctorRoute.js'
import {petOwnerRouter} from './Routes/PetOwnerRoute.js'
import path from 'path'
import { __dirname } from './dirname.js';
import cookieParser from 'cookie-parser'
import cron from 'node-cron'
import axios from 'axios'
import dotenv from 'dotenv';




dotenv.config();

setTimeout(() => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
}, 1000);


// Schedule cron job to send vaccination reminders daily at a specific time
cron.schedule('0 8 * * *', async () => {
  try {
    console.log('Sending vaccination reminders...');
    await axios.get('http://localhost:3000/auth/send-vaccination-reminders');
    console.log('Vaccination reminders sent');
  } catch (error) {
    console.error('Error sending vaccination reminders:', error);
  }
});

const app = express() 
app.use(cors({ 
    origin: ["http://localhost:5173"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 

})); 
app.use(express.json());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/auth', adminRouter);
app.use('/doctor', doctorRouter);
app.use('/petowner', petOwnerRouter);




app.listen(3000, () => {
    console.log("Server is running on port 3000");
});