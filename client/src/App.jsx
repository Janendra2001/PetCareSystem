import './App.css' 
import 'bootstrap/dist/css/bootstrap.min.css' 
import Login from './Components/Login' 
import { BrowserRouter, Routes, Route} from 'react-router-dom' 
import Dashboard from './Components/Dashboard' 
import Home from './Components/Home' 
import Appointments from './Components/Appointments'  
import Doctors from './Components/Doctors' 
import PetOwners from './Components/PetOwners' 
import Pets from './Components/Pets' 
import MedicationItems from './Components/MedicationItems' 
import Profile from './Components/Profile' 
import LoginStart from './Components/LoginStart' 
import DoctorLogin from './Components/DoctorLogin'
import PetOwnerLogin from './Components/PetOwnerLogin'
import DoctorDashboard from './Components/DoctorDashboard'
import PetOwnerDashboard from './Components/PetOwnerDashboard'
import PetOwnerHome from './Components/PetOwnerHome'
import PetOwnerAppointments from './Components/PetOwnerAppointments'
import ViewDoctors from './Components/ViewDoctors'
import CheckMedicationItems from './Components/CheckMedicationItems'
import PetOwnerProfile from './Components/PetOwnerProfile'
import ManagePets from './Components/ManagePets'
import DoctorProfile from './Components/DoctorProfile'
import DoctorHome from './Components/DoctorHome'
import HomePage from './Pages/HomePage'
import Blog from './Pages/Blog'
import MeetYourDoctor from './Pages/MeetYourDoctor'
import Register from './Pages/Register'
import AddDoctor from './Components/AddDoctor'
import AddMedicationItems from './Components/AddMedicationItems'
import AddPet from './Components/AddPet'
import EditPet from './Components/EditPet'
import ViewPetCaseHistories from './Components/ViewPetCaseHistories'
import PetCasesRegister from './Components/PetCasesRegister'
import EnterCases from './Components/EnterCases'
import ViewPets from './Components/ViewPets'
import SingleDog from './Pages/SingleDog'
import DoctorAppointments from './Components/DoctorAppointments'
import PrivateRoute from './Components/PrivateRoute'
import PetCorner from './Pages/PetCorner'




function App() {
  

  

  return (
    <BrowserRouter>
      <Routes> 
        <Route path='/' element={<LoginStart />} ></Route>
        <Route path='/adminlogin' element={<Login />} ></Route> 
        <Route path='/doctorlogin' element={<DoctorLogin />} ></Route>
        <Route path='/petownerlogin' element={<PetOwnerLogin />} ></Route>
        <Route path='/petownerdashboard/:petownerId' element={
          <PrivateRoute>
            <PetOwnerDashboard />
          </PrivateRoute>
          } >
          <Route path='' element={<PetOwnerHome />}></Route> 
          <Route path='/petownerdashboard/:petownerId/petownerappointments' element={<PetOwnerAppointments />}></Route> 
          <Route path='/petownerdashboard/:petownerId/viewdoctors' element={<ViewDoctors />}></Route> 
          <Route path='/petownerdashboard/:petownerId/pets' element={<Pets />}></Route> 
          <Route path='/petownerdashboard/:petownerId/checkmediactionitems' element={<CheckMedicationItems />}></Route> 
          <Route path='/petownerdashboard/:petownerId/petownerprofile' element={<PetOwnerProfile />}></Route>
          <Route path='/petownerdashboard/:petownerId/pets/addpet' element={<AddPet />}></Route>
          <Route path='/petownerdashboard/:petownerId/pets/:petid' element={<Pets />}></Route>
          <Route path='/petownerdashboard/:petownerId/pets/:petid/edit' element={<EditPet />}></Route>
          <Route path='/petownerdashboard/:petownerId/pets/:petid/delete' element={<Pets />}></Route>
          <Route path='/petownerdashboard/:petownerId/pets/:petId/view' element={<ViewPetCaseHistories />}></Route> 
        </Route>
        <Route path='/doctordashboard/:doctorId' element={
          <PrivateRoute>
            <DoctorDashboard />
          </PrivateRoute>
          } >
          <Route path='' element={<DoctorHome />}></Route> 
          <Route path='/doctordashboard/:doctorId/doctorappointments' element={<DoctorAppointments />}></Route> 
          <Route path='/doctordashboard/:doctorId/doctors' element={<ViewDoctors />}></Route> 
          <Route path='/doctordashboard/:doctorId/petowners' element={<PetOwners />}></Route> 
          <Route path='/doctordashboard/:doctorId/managepets' element={<ManagePets />}></Route> 
          <Route path='/doctordashboard/:doctorId/medicationitems' element={<MedicationItems />}></Route>
          <Route path='/doctordashboard/:doctorId/doctorprofile' element={<DoctorProfile />}></Route>
          <Route path='/doctordashboard/:doctorId/addmedicationitems' element={<AddMedicationItems />}></Route>
          <Route path='/doctordashboard/:doctorId/managepet/:petId/cases' element={<PetCasesRegister />}></Route>
          <Route path='/doctordashboard/:doctorId/entercases' element={<EnterCases />}></Route>
        </Route> 
        <Route path='/dashboard' element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
          } >
          <Route path='' element={<Home />}></Route> 
          <Route path='/dashboard/appointments' element={<Appointments />}></Route> 
          <Route path='/dashboard/doctors' element={<Doctors />}></Route> 
          <Route path='/dashboard/petowners' element={<PetOwners />}></Route> 
          <Route path='/dashboard/viewpets' element={<ViewPets />}></Route> 
          <Route path='/dashboard/medicationitems' element={<MedicationItems />}></Route> 
          <Route path='/dashboard/profile' element={<Profile />}></Route>
          <Route path='/dashboard/adddoctor' element={<AddDoctor />}></Route>
          <Route path='/dashboard/addmedicationitems' element={<AddMedicationItems />}></Route>
        </Route>
      <Route path='/home' element={<HomePage />} ></Route>
      <Route path='/blog' element={<Blog />} ></Route>
      <Route path="/:name" element={<SingleDog/>}></Route>
      <Route path='/meetyourdoctor' element={<MeetYourDoctor />} ></Route>
      <Route path='/petcorner' element={<PetCorner/>}></Route>
      <Route path='/register' element={<Register />} ></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

