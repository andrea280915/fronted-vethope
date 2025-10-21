import React, { useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { jsPDF } from 'jspdf';
import logo from '../Images/logo_inicio.png';
import { useClients } from '../context/ClientsContext';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products] = useState([
    { id: 1, nombre: 'Alimento Premium', precio: 25.5, stock: 10 },
    { id: 2, nombre: 'Collar Antipulgas', precio: 12.0, stock: 8 },
    { id: 3, nombre: 'Juguete para Perro', precio: 18.5, stock: 5 },
  ]);

  const { clients } = useClients();
  const [selectedClient, setSelectedClient] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState('Boleta');
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [cart]
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((p) => p.id === product.id);
      if (exist) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleVenta = () => {
    if (cart.length === 0) {
      alert('Agrega productos al carrito antes de continuar.');
      return;
    }
    setShowModal(true);
  };

  const generarPDF = () => {
    if (!selectedClient) {
      alert('Seleccione un cliente antes de continuar.');
      return;
    }

    const doc = new jsPDF();
    const fecha = new Date().toLocaleString();
    const comprobanteNro = Math.floor(100000 + Math.random() * 900000);

    // Logo
    if (logo) {
      doc.addImage(logo, 'PNG', 15, 10, 25, 25);
    }

    // Encabezado Veterinaria
    doc.setFontSize(14);
    doc.text('Veterinaria VetHope', 45, 18);
    doc.setFontSize(10);
    doc.text('RUC: 20457896321', 45, 25);
    doc.text('Av. Siempre Viva 123 - Lima, Perú', 45, 30);
    doc.text('Tel: (01) 567-1234 / contacto@vethope.com', 45, 35);

    // Línea separadora
    doc.line(10, 40, 200, 40);

    // Datos del comprobante
    doc.setFontSize(12);
    doc.text(`Comprobante: ${tipoComprobante}`, 140, 20);
    doc.text(`N°: ${comprobanteNro}`, 140, 26);
    doc.text(`Fecha: ${fecha}`, 140, 32);

    // Datos del cliente
    doc.setFontSize(11);
    doc.text('DATOS DEL CLIENTE:', 15, 50);
    doc.setFontSize(10);
    doc.text(`Nombre: ${selectedClient.nombre}`, 15, 56);
    doc.text(`Documento: ${selectedClient.documento}`, 15, 61);
    doc.text(`Dirección: ${selectedClient.direccion}`, 15, 66);

    // Detalle de venta
    doc.setFontSize(11);
    doc.text('DETALLE DE LA VENTA:', 15, 78);
    let y = 85;
    doc.setFontSize(10);
    doc.text('Cant.', 15, y);
    doc.text('Descripción', 35, y);
    doc.text('P.Unit', 120, y);
    doc.text('Subtotal', 170, y);
    y += 5;

    cart.forEach((item) => {
      doc.text(String(item.cantidad), 15, y);
      doc.text(item.nombre, 35, y);
      doc.text(`S/. ${item.precio.toFixed(2)}`, 120, y);
      doc.text(`S/. ${(item.precio * item.cantidad).toFixed(2)}`, 170, y);
      y += 6;
    });

    // Total
    doc.line(10, y + 2, 200, y + 2);
    doc.setFontSize(11);
    doc.text(`TOTAL: S/. ${total.toFixed(2)}`, 150, y + 10);

    doc.save(`${tipoComprobante}_${comprobanteNro}.pdf`);
    setCart([]);
    setShowModal(false);
  };

  return (
    <AdminLayout>
      <div className="products-page">
        <h1>🛍️ Registro de Ventas</h1>

        {/* Modal */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>🧾 Finalizar Venta</h2>

              <label>Cliente:</label>
              <select
                value={selectedClient?.id || ''}
                onChange={(e) =>
                  setSelectedClient(
                    clients.find((c) => c.id === Number(e.target.value))
                  )
                }
              >
                <option value="">Seleccionar Cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              {selectedClient && (
                <div className="client-info">
                  <p><strong>Documento:</strong> {selectedClient.documento}</p>
                  <p><strong>Dirección:</strong> {selectedClient.direccion}</p>
                </div>
              )}

              <label>Tipo de Comprobante:</label>
              <select
                value={tipoComprobante}
                onChange={(e) => setTipoComprobante(e.target.value)}
              >
                <option value="Boleta">Boleta</option>
                <option value="Factura">Factura</option>
              </select>

              <p className="total">Total: S/. {total.toFixed(2)}</p>

              <div className="modal-buttons">
                <button className="btn-confirm" onClick={generarPDF}>
                  Generar Comprobante
                </button>
                <button className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Productos */}
        <div className="product-list">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <h3>{p.nombre}</h3>
              <p>Precio: S/. {p.precio.toFixed(2)}</p>
              <p>Stock: {p.stock}</p>
              <button onClick={() => addToCart(p)}>Agregar</button>
            </div>
          ))}
        </div>

        {/* Carrito */}
        <div className="cart-section">
          <h2>🛒 Carrito</h2>
          {cart.length === 0 ? (
            <p>No hay productos agregados.</p>
          ) : (
            <>
              <table className="cart-table">
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
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nombre}</td>
                      <td>S/. {item.precio.toFixed(2)}</td>
                      <td>
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                          <span>{item.cantidad}</span>
                          <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                        </div>
                      </td>
                      <td>S/. {(item.precio * item.cantidad).toFixed(2)}</td>
                      <td>
                        <button className="btn-delete" onClick={() => removeItem(item.id)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="cart-footer">
                <h3>Total: S/. {total.toFixed(2)}</h3>
                <button className="btn-finalizar" onClick={handleVenta}>
                  Finalizar Venta
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductsPage;
