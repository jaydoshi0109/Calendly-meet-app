import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "@/pages/Dashboard";
// import ScheduleMeeting from "@/pages/ScheduleMeetings";
import Calendar from "@/pages/Calendar";
import Login from "@/pages/Login";
import NavBar from "@/components/Navbar";
import MeetingsCalendar from "@/pages/MeetingsCalendar";
import ConfirmMeeting from "@/pages/ConfirmMeeting";


export default function App() {
  const { user, loading } = useAuth();


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <NavBar />
      <Routes>
  <Route
    path="/"
    element={
      user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
    }
  />
  <Route
    path="/dashboard"
    element={user ? <Dashboard /> : <Navigate to="/login" />}
  />
  <Route path="/login" element={<Login />} />
  <Route
    path="/calendar"
    element={user ? <Calendar /> : <Navigate to="/login" />}
  />
  <Route
    path="/my-calendar"
    element={user ? <MeetingsCalendar /> : <Navigate to="/login" />}
  />
   <Route path="/confirm/:id" element={<ConfirmMeeting />} />
</Routes>
    </Router>
  );
}
