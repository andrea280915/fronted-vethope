import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ApiProvider } from "./context/ApiContext";
import { ClientsProvider } from "./context/ClientsContext";
import PrivateRoute from "./components/ProtectedRoute";

// 📄 Páginas
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterStock from "./pages/RegisterStock";
import ProductsPage from "./pages/ProductsPage";
import CartViewPage from "./pages/CartViewPage";
import RegisterClientPage from "./pages/RegisterClientPage";
import RegisterUserPage from "./pages/RegisterUserPage";
import SalesPage from "./pages/SalesPage";
import ScheduleAppointmentPage from "./pages/ScheduleAppointmentPage";
import RegisterPetPage from "./pages/RegisterPetPage";

function App() {
  return (
    <Router>
      <ApiProvider>
        <AuthProvider>
          <ClientsProvider>
            <CartProvider>
              <Routes>
                {/* --- Rutas Públicas --- */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />

                {/* --- Rutas Protegidas --- */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <PrivateRoute roles={["Administrador", "Recepcionista", "Veterinario"]}>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/productos/venta"
                  element={
                    <PrivateRoute roles={["Administrador", "Recepcionista"]}>
                      <ProductsPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/stock"
                  element={
                    <PrivateRoute roles={["Administrador", "Recepcionista"]}>
                      <RegisterStock />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/clientes/registro"
                  element={
                    <PrivateRoute roles={["Administrador", "Recepcionista"]}>
                      <RegisterClientPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/mascotas/registro"
                  element={
                    <PrivateRoute roles={["Administrador", "Recepcionista"]}>
                      <RegisterPetPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/citas/agendar"
                  element={
                    <PrivateRoute roles={["Administrador", "Recepcionista", "Veterinario"]}>
                      <ScheduleAppointmentPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/usuarios/registro"
                  element={
                    <PrivateRoute roles={["Administrador"]}>
                      <RegisterUserPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/productos/carrito"
                  element={
                    <PrivateRoute roles={["Administrador", "Recepcionista"]}>
                      <CartViewPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/ventas"
                  element={
                    <PrivateRoute roles={["Administrador", "Recepcionista"]}>
                      <SalesPage />
                    </PrivateRoute>
                  }
                />

                {/* Ruta no autorizada (opcional) */}
                <Route
                  path="/unauthorized"
                  element={<div style={{ padding: 20 }}>No tienes permiso para acceder a esta página.</div>}
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </CartProvider>
          </ClientsProvider>
        </AuthProvider>
      </ApiProvider>
    </Router>
  );
}

export default App;
