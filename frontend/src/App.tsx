import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { VerifyOTPPage } from "./pages/VerifyOTPPage";
import DashboardPage from "./pages/DashBoardPage";
import AdminPage from "./pages/AdminPage";
import CheckerPage from "./features/checker/pages/CheckerPage";
import TablesPage from "./pages/TablesPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["maker", "checker", "admin"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checker"
        element={
          <ProtectedRoute allowedRoles={["checker"]}>
            <CheckerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tables"
        element={
          <ProtectedRoute allowedRoles={["maker", "checker", "admin"]}>
            <TablesPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
