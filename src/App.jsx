import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Sahifalarni import qilish
import Login from "./pages/login/Login";
import Register from "./pages/registrer/Register";
import UserDash from "./pages/user/userDash/UserDash"; // Siz aytgan User sahifasi
import AdminDashboard from "./pages/admin/admindash/AdminDash"; // Siz aytgan Admin sahifasi

// Himoyalangan marshrut komponenti
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";

function App() {
  return (
    <>
      {/* Bildirishnomalar uchun xabarnoma oynasi */}
      <ToastContainer

        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        style={{top: '20px', left:'20px', right: '20px'}}
        
      />

      <Routes>
        {/* Sayt ochilganda to'g'ridan-to'g'ri login sahifasiga yuboradi */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Hamma kira oladigan ochiq sahifalar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔥 USER DASHBOARD: Faqat 'user' (Mijoz) roliga ega bo'lganlar kira oladi */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDash />
            </ProtectedRoute>
          }
        />

       
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="*"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <RoleBasedRedirect />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

// 💡 Yordamchi komponent: Agar adashib boshqa sahifaga o'tsa, roliga qarab avtomat panellariga otib yuboradi
function RoleBasedRedirect() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }
  return <Navigate to="/user-dashboard" replace />;
}

export default App;