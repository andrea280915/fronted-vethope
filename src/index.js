import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// Importa el Proveedor de Autenticación
import { AuthProvider } from './context/AuthContext'; 
// Importa el NUEVO Proveedor de Carrito
import { CartProvider } from './context/CartContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Envuelve la aplicación con el AuthProvider */}
    <AuthProvider>
        {/* CORRECTO: El CartProvider debe envolver a <App /> para que useCart funcione */}
        <CartProvider>
            <App />
        </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();


