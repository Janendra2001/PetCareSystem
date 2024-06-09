import express from "express"; 
import cors from 'cors'
import bodyParser from 'body-parser' 
import {adminRouter} from './Routes/AdminRoute.js'
import {doctorRouter} from './Routes/DoctorRoute.js'
import {petOwnerRouter} from './Routes/PetOwnerRoute.js'
import path from 'path'
import { __dirname } from './dirname.js';
import cookieParser from 'cookie-parser'

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