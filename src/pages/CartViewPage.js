import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useCart } from '../context/CartContext';
import { useClients } from '../context/ClientsContext';
import { jsPDF } from 'jspdf';
import logo from '../Images/logo_inicio.png';
import './CartViewPage.css'; // ✅ archivo con estilos actualizados

const CartViewPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { clients } = useClients();

  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [comprobante, setComprobante] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredClients = clients.filter(c =>
    `${c.nombre} ${c.apellido} ${c.dni} ${c.telefono}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (productId, delta) => {
    const item = cart.find(i => i.id === productId);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      updateQuantity(productId, newQty);
    }
  };

  const handleGeneratePDF = () => {
    if (!selectedClient || !comprobante) {
      alert('Seleccione un cliente y tipo de comprobante.');
      return;
    }

    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // Logo y encabezado
    doc.addImage(logo, 'PNG', 10, 8, 25, 25);
    doc.setFontSize(16);
    doc.text('Veterinaria VetHope', 45, 20);
    doc.setFontSize(10);
    doc.text(`Tipo de Comprobante: ${comprobante}`, 150, 20);
    doc.text(`Fecha: ${date}`, 150, 26);

    // Datos cliente
    doc.line(10, 35, 200, 35);
    doc.setFontSize(12);
    doc.text('Datos del Cliente', 10, 45);
    doc.setFontSize(10);
    doc.text(`Nombre: ${selectedClient.nombre} ${selectedClient.apellido}`, 10, 52);
    doc.text(`DNI: ${selectedClient.dni}`, 10, 58);
    doc.text(`Teléfono: ${selectedClient.telefono}`, 10, 64);
    doc.text(`Dirección: ${selectedClient.direccion}`, 10, 70);

    // Detalle
    doc.line(10, 78, 200, 78);
    doc.text('Producto', 10, 86);
    doc.text('Cant.', 100, 86);
    doc.text('Precio', 130, 86);
    doc.text('Subtotal', 160, 86);

    let y = 96;
    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      doc.text(item.name, 10, y);
      doc.text(String(item.quantity), 100, y);
      doc.text(`S/. ${item.price.toFixed(2)}`, 130, y);
      doc.text(`S/. ${subtotal.toFixed(2)}`, 160, y);
      y += 8;
    });

    doc.line(10, y + 2, 200, y + 2);
    doc.setFontSize(12);
    doc.text(`Total a Pagar: S/. ${totalPrice.toFixed(2)}`, 140, y + 10);
    doc.save(`Comprobante_${selectedClient.nombre}_${Date.now()}.pdf`);

    clearCart();
    setSelectedClient(null);
    setComprobante('');
    setIsModalOpen(false);
  };

  const handleFinalizeSale = () => {
    if (cart.length === 0) return alert('El carrito está vacío.');
    if (!selectedClient) return alert('Seleccione un cliente antes de continuar.');
    setIsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="cart-page">
        <div className="cart-header">
          <h1>🛒 Venta de Productos</h1>
          <button className="btn-secondary" onClick={clearCart}>Vaciar Carrito</button>
        </div>

        {/* Cliente */}
        <section className="client-section">
          <h2>👤 Cliente</h2>
          {selectedClient ? (
            <div className="client-card">
              <div>
                <h3>{selectedClient.nombre} {selectedClient.apellido}</h3>
                <p>DNI: {selectedClient.dni}</p>
                <p>Tel: {selectedClient.telefono}</p>
                <p>{selectedClient.direccion}</p>
              </div>
              <button className="btn-outline" onClick={() => setSelectedClient(null)}>Cambiar Cliente</button>
            </div>
          ) : (
            <div className="client-search">
              <input
                type="text"
                placeholder="Buscar cliente por nombre, DNI o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-search"
              />
              {filteredClients.length > 0 && (
                <ul className="client-list">
                  {filteredClients.map(client => (
                    <li key={client.id} onClick={() => setSelectedClient(client)}>
                      <span>{client.nombre} {client.apellido}</span> - <small>{client.dni}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* Tabla de productos */}
        <section className="cart-table">
          <h2>🧾 Detalle del Carrito</h2>
          <table className="vet-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.length ? cart.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>S/. {item.price.toFixed(2)}</td>
                  <td>
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                      <input type="number" value={item.quantity} readOnly />
                      <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                    </div>
                  </td>
                  <td>S/. {(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button className="btn-action delete" onClick={() => removeFromCart(item.id)}>Eliminar</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center">🪣 No hay productos en el carrito</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Total */}
        <section className="cart-summary">
          <div>
            <p><strong>Productos:</strong> {totalItems}</p>
            <p><strong>Total a pagar:</strong> <span className="highlight">S/. {totalPrice.toFixed(2)}</span></p>
          </div>
          <button
            className="btn-primary"
            disabled={cart.length === 0 || !selectedClient}
            onClick={handleFinalizeSale}
          >
            Finalizar Venta
          </button>
        </section>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2>📄 Seleccionar Comprobante</h2>
              <select
                value={comprobante}
                onChange={(e) => setComprobante(e.target.value)}
                className="select-comprobante"
              >
                <option value="">-- Seleccionar --</option>
                <option value="Boleta">Boleta</option>
                <option value="Factura">Factura</option>
              </select>
              <div className="modal-buttons">
                <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleGeneratePDF}>Generar Comprobante</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CartViewPage;
