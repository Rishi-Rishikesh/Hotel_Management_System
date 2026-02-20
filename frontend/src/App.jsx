import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { CookiesProvider } from "react-cookie";
import ProtectedRoute from "./components/ProtectedRoute";
import FoodOrdering from "./pages/FoodOrdering";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import About from "./pages/About";
import Contactus from "./pages/ContactUs";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import OTP from "./pages/OTP";
import NewPassword from "./pages/NewPassword";
import GuestRegistration from "./pages/GuestRegistration";
import GuestDashboard from "./pages/GuestDashboard";
import RoomPage from "./pages/RoomPage";
import RoomBooking from "./pages/RoomBooking";
import RoomBookingForm from "./pages/RoomBookingForm";
import BookHall from "./pages/BookHall";
import BookingHistory from "./pages/BookingHistory";
import EventBooking from "./pages/EventBooking";
import ReviewManagement from "./pages/ReviewManagement";
import FeedbackManagement from "./pages/FeedbackManagement";
import GuestProfile from "./pages/GuestProfile";
import Cart from "./pages/Cart";
import AddReview from "./pages/AddReview";
import ShowReview from "./pages/ShowReview";
import AddFeedback from "./pages/AddFeedback";
import AddProduct from "./pages/AddProduct";
import ShowProduct from "./pages/ShowProduct";
import ViewDetails from "./pages/ViewDetails";
import GuestList from "./pages/GuestList";
import DeleteAccount from "./pages/DeleteAccount";
import BookingRequest from "./pages/BookingRequest";
import AdminNavbar from "./layouts/AdminNavbar";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
import ChatContainer from "./pages/ChatContainer";
import AdminChatDashboard from "./pages/AdminChatDashboard";
import UpdateProfile from "./pages/ProfileUpdate";
import StaffDashboard from "./pages/StaffDashboard";
import TaskList from "./pages/TaskList";
import InventoryManagement from "./pages/InventoryManagement";
import AdminDashboard from "./pages/AdminDashboard";
import RoomManagement from "./pages/RoomManagement";
import AdminBookingsManage from "./pages/AdminBookingsManage";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import TaskManagement from "./pages/TaskManagement.jsx";
import HallManagement from "./pages/HallManagement";
import InventoryHistory from "./pages/InventoryHistory";
import StaffManagement from "./pages/StaffManagement";
import RoomReview from "./pages/RoomReview.jsx";
import DashboardGate from "./components/DashboardGate";
import AdminOrder from "./pages/AdminOrder.jsx";

function NavbarSelector() {
  const { role, token } = useAuth();
  const location = window.location.pathname;

  // Pages where navbar should NEVER show
  const authPages = ["/login", "/signup", "/forgotpassword", "/otp", "/newpassword", "/guestregistration"];

  if (authPages.includes(location)) {
    return null;
  }

  // Define paths that belong to the Management Dashboard
  const managementPaths = [
    "/guestdashboard",
    "/admin-dashboard",
    "/staff-dashboard",
    "/rooms",
    "/hall-management",
    "/tasks",
    "/guest-management",
    "/staff-management",
    "/bookings",
    "/inventory",
    "/history",
    "/settings",
    "/finances",
    "/schedule",
    "/adminorder",
    "/adminchat"
  ];

  const isManagementPath = managementPaths.some(path => location.startsWith(path));

  // If logged in AND on a management path, show Sidebar Navbar (for Admin, Staff, or Guest)
  if (token && isManagementPath) {
    return <AdminNavbar />;
  }

  // Otherwise, show the premium customer Navbar (for Guests, Users, and Admins/Staff on public pages)
  return <Navbar />;
}

function App() {
  const [userRole, setUserRole] = useState(null);

  return (
    <CookiesProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-[#fafafa]">
            <NavbarSelector />

            <ToastContainer position="top-right" autoClose={3000} />

            <div className="">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/login"
                  element={<Login setUserRole={setUserRole} />}
                />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/otp" element={<OTP />} />
                <Route path="/newpassword" element={<NewPassword />} />
                <Route path="/home" element={<Home />} />
                <Route path="/dashboard" element={<DashboardGate />} />
                <Route path="/about" element={<About />} />
                <Route path="/contactus" element={<Contactus />} />
                <Route path="/roompage" element={<RoomPage />} />

                <Route path="/guestregistration" element={<GuestRegistration />} />
                <Route path="/roomreview" element={<RoomReview />} />

                <Route path="/guestdashboard" element={
                  <ProtectedRoute allowedRoles={["User", "Admin"]}>
                    <GuestDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/roombooking" element={<RoomBooking />} />
                <Route path="/roombookingform" element={<RoomBookingForm />} />
                <Route path="/roombooking/:id" element={<RoomBookingForm />} />
                <Route path="/eventbooking" element={<EventBooking />} />
                <Route path="/hallbook" element={
                  <ProtectedRoute allowedRoles={["User", "Admin"]}>
                    <BookHall />
                  </ProtectedRoute>
                } />

                <Route
                  path="/bookinghistory"
                  element={
                    <ProtectedRoute allowedRoles={["User"]}>
                      <BookingHistory />
                    </ProtectedRoute>
                  }
                />

                <Route path="/reviewmanagement" element={<ReviewManagement />} />
                <Route path="/feedbackmanagement" element={<FeedbackManagement />} />
                <Route path="/chat" element={<ChatContainer />} />
                <Route path="/adminchat" element={<AdminChatDashboard />} />
                <Route path="/foodordering" element={<FoodOrdering />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/guestprofile" element={<GuestProfile />} />
                <Route path="/updateprofile" element={<UpdateProfile />} />
                <Route path="/addreview" element={<AddReview />} />
                <Route path="/showreview" element={<ShowReview />} />
                <Route path="/addfeedback" element={<AddFeedback />} />
                <Route path="/addproduct" element={<AddProduct />} />
                <Route path="/showproduct" element={<ShowProduct />} />
                <Route path="/viewdetails/:id" element={<ViewDetails />} />
                <Route path="/guestlist" element={<GuestList />} />
                <Route path="/deleteaccount" element={<DeleteAccount />} />
                <Route path="/history" element={<InventoryHistory />} />
                <Route path="/bookingrequest" element={<BookingRequest />} />

                <Route
                  path="/staff-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["Staff"]}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/schedule"
                  element={
                    <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                      <TaskManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute allowedRoles={["Staff"]}>
                      <TaskList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute allowedRoles={["Staff"]}>
                      <InventoryManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/guest-management"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <GuestList />
                    </ProtectedRoute>
                  }
                />
                <Route path="/adminorder" element={<AdminOrder />} />
                <Route
                  path="/staff-management"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <StaffManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="/bookings" element={
                  <ProtectedRoute allowedRoles={["Admin", "User"]}>
                    <AdminBookingsManage />
                  </ProtectedRoute>
                } />

                <Route
                  path="/hall-management"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <HallManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rooms"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <RoomManagement />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Footer />
            </div>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </CookiesProvider>
  );
}

export default App;