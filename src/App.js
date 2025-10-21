import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ApiProvider } from './context/ApiContext';
import { ClientsProvider } from './context/ClientsContext'; // ✅ NUEVO CONTEXTO GLOBAL DE CLIENTES
import ProtectedRoute from './components/ProtectedRoute';

// 📄 Páginas principales
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterStock from './pages/RegisterStock';
import ProductsPage from './pages/ProductsPage';
import CartViewPage from './pages/CartViewPage';
import RegisterClientPage from './pages/RegisterClientPage';
import RegisterUserPage from './pages/RegisterUserPage';
import SalesPage from './pages/SalesPage';
import ScheduleAppointmentPage from './pages/ScheduleAppointmentPage';
import RegisterPetPage from './pages/RegisterPetPage';

function App() {
    return (
        <ApiProvider>
            <AuthProvider>
                <ClientsProvider> {/* 👈 Nuevo proveedor de clientes */}
                    <CartProvider>
                        <Router>
                            <Routes>
                                {/* --- Rutas Públicas --- */}
                                <Route path="/" element={<Navigate to="/login" replace />} />
                                <Route path="/login" element={<LoginPage />} />

                                {/* --- Rutas Protegidas --- */}

                                {/* Dashboard */}
                                <Route
                                    path="/admin/dashboard"
                                    element={
                                        <ProtectedRoute
                                            element={<DashboardPage />}
                                            allowedRoles={['Administrador', 'Recepcionista', 'Veterinario']}
                                        />
                                    }
                                />

                                {/* Vender Productos */}
                                <Route
                                    path="/admin/productos/venta"
                                    element={
                                        <ProtectedRoute
                                            element={<ProductsPage />}
                                            allowedRoles={['Administrador', 'Recepcionista']}
                                        />
                                    }
                                />

                                {/* Inventario / Stock */}
                                <Route
                                    path="/admin/stock"
                                    element={
                                        <ProtectedRoute
                                            element={<RegisterStock />}
                                            allowedRoles={['Administrador', 'Recepcionista']}
                                        />
                                    }
                                />

                                {/* Registrar Cliente */}
                                <Route
                                    path="/admin/clientes/registro"
                                    element={
                                        <ProtectedRoute
                                            element={<RegisterClientPage />}
                                            allowedRoles={['Administrador', 'Recepcionista']}
                                        />
                                    }
                                />

                                {/* Registrar Mascota */}
                                <Route
                                    path="/admin/mascotas/registro"
                                    element={
                                        <ProtectedRoute
                                            element={<RegisterPetPage />}
                                            allowedRoles={['Administrador', 'Recepcionista']}
                                        />
                                    }
                                />

                                {/* Agendar Cita */}
                                <Route
                                    path="/admin/citas/agendar"
                                    element={
                                        <ProtectedRoute
                                            element={<ScheduleAppointmentPage />}
                                            allowedRoles={['Administrador', 'Recepcionista', 'Veterinario']}
                                        />
                                    }
                                />

                                {/* Registrar Usuario */}
                                <Route
                                    path="/admin/usuarios/registro"
                                    element={
                                        <ProtectedRoute
                                            element={<RegisterUserPage />}
                                            allowedRoles={['Administrador']}
                                        />
                                    }
                                />

                                {/* Carrito de Venta */}
                                <Route
                                    path="/admin/productos/carrito"
                                    element={
                                        <ProtectedRoute
                                            element={<CartViewPage />}
                                            allowedRoles={['Administrador', 'Recepcionista']}
                                        />
                                    }
                                />

                                {/* Historial de Ventas */}
                                <Route
                                    path="/admin/ventas"
                                    element={
                                        <ProtectedRoute
                                            element={<SalesPage />}
                                            allowedRoles={['Administrador', 'Recepcionista']}
                                        />
                                    }
                                />

                                {/* Fallback */}
                                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                            </Routes>
                        </Router>
                    </CartProvider>
                </ClientsProvider>
            </AuthProvider>
        </ApiProvider>
    );
}

export default App;
