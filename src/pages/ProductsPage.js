import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { jsPDF } from 'jspdf';
import logo from '../Images/logo_inicio.png';
import stockService from '../services/stockService';
import clientService from '../services/clienteService';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState('Boleta');
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [cart]
  );

  // --- Traer productos y clientes desde API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, clientsData] = await Promise.all([
          stockService.getAllStock(),
          clientService.getAll()
        ]);
        setProducts(productsData);
        setClients(clientsData);
      } catch (error) {
        console.error('Error cargando productos o clientes:', error);
        alert('Error cargando productos o clientes. Verifica servidor.');
      }
    };
    fetchData();
  }, []);

  // --- Carrito ---
  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Stock insuficiente');
    setCart((prev) => {
      const exist = prev.find((p) => p.id_producto === product.id_producto);
      if (exist) {
        if (exist.cantidad + 1 > product.stock) return alert('No hay suficiente stock');
        return prev.map((p) =>
          p.id_producto === product.id_producto
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
    setProducts((prev) =>
      prev.map((p) =>
        p.id_producto === product.id_producto
          ? { ...p, stock: p.stock - 1 }
          : p
      )
    );
  };

  const updateQuantity = (id_producto, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id_producto === id_producto) {
          const product = products.find((p) => p.id_producto === id_producto);
          const newCantidad = Math.max(1, item.cantidad + delta);
          if (newCantidad > item.cantidad + product.stock) return item;
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id_producto === id_producto
                ? { ...p, stock: p.stock - delta }
                : p
            )
          );
          return { ...item, cantidad: newCantidad };
        }
        return item;
      })
    );
  };

  const removeItem = (id_producto) => {
    const item = cart.find((c) => c.id_producto === id_producto);
    if (item) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id_producto === id_producto
            ? { ...p, stock: p.stock + item.cantidad }
            : p
        )
      );
    }
    setCart((prev) => prev.filter((item) => item.id_producto !== id_producto));
  };

  const handleVenta = () => {
    if (cart.length === 0) return alert('Agrega productos al carrito antes de continuar.');
    if (!selectedClient) return alert('Selecciona un cliente antes de continuar.');
    setShowModal(true);
  };

  // --- Generar PDF y actualizar stock en backend ---
  const generarPDF = async () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleString();
    const comprobanteNro = Math.floor(100000 + Math.random() * 900000);

    if (logo) doc.addImage(logo, 'PNG', 15, 10, 25, 25);
    doc.setFontSize(14);
    doc.text('Veterinaria VetHope', 45, 18);
    doc.setFontSize(10);
    doc.text('RUC: 20457896321', 45, 25);
    doc.text('Av. Siempre Viva 123 - Lima, Perú', 45, 30);
    doc.text('Tel: (01) 567-1234 / contacto@vethope.com', 45, 35);
    doc.line(10, 40, 200, 40);

    doc.setFontSize(12);
    doc.text(`Comprobante: ${tipoComprobante}`, 140, 20);
    doc.text(`N°: ${comprobanteNro}`, 140, 26);
    doc.text(`Fecha: ${fecha}`, 140, 32);

    doc.setFontSize(11);
    doc.text('DATOS DEL CLIENTE:', 15, 50);
    doc.setFontSize(10);
    doc.text(`Nombre: ${selectedClient.nombre} ${selectedClient.apellido || ''}`, 15, 56);
    doc.text(`Documento: ${selectedClient.documento}`, 15, 61);
    

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

    doc.line(10, y + 2, 200, y + 2);
    doc.setFontSize(11);
    doc.text(`TOTAL: S/. ${total.toFixed(2)}`, 150, y + 10);

    doc.save(`${tipoComprobante}_${comprobanteNro}.pdf`);

    // Actualizar stock en backend
    try {
      await Promise.all(
        cart.map((item) =>
          stockService.updateStock(item.id_producto, {
            nombre: item.nombre,
            descripcion: item.descripcion,
            precio: item.precio,
            stock: item.stock // stock actualizado tras venta
          })
        )
      );
      alert('Venta realizada con éxito.');
    } catch (error) {
      console.error('Error actualizando stock:', error);
      alert('Error al actualizar stock en backend.');
    }

    setCart([]);
    setShowModal(false);
    const updatedProducts = await stockService.getAllStock();
    setProducts(updatedProducts);
  };

  return (
    <AdminLayout>
      <div className="products-page">
        <h1>🛍️ Registro de Ventas</h1>

        {/* Modal de venta */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>🧾 Finalizar Venta</h2>

              <label>Cliente:</label>
              <select
                value={selectedClient?.id_cliente || ''}
                onChange={(e) =>
                  setSelectedClient(
                    clients.find(c => c.id_cliente === Number(e.target.value))
                  )
                }
              >
                <option value="">Seleccionar Cliente</option>
                {clients.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} {c.apellido || ''}
                  </option>
                ))}
              </select>

              {selectedClient && (
                <div className="client-info">
                  <p><strong>Documento:</strong> {selectedClient.documento}</p>
                  {selectedClient.direccion && <p><strong>Dirección:</strong> {selectedClient.direccion}</p>}
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
            <div key={p.id_producto} className="product-card">
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
                    <tr key={item.id_producto}>
                      <td>{item.nombre}</td>
                      <td>S/. {item.precio.toFixed(2)}</td>
                      <td>
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id_producto, -1)}>-</button>
                          <span>{item.cantidad}</span>
                          <button onClick={() => updateQuantity(item.id_producto, 1)}>+</button>
                        </div>
                      </td>
                      <td>S/. {(item.precio * item.cantidad).toFixed(2)}</td>
                      <td>
                        <button className="btn-delete" onClick={() => removeItem(item.id_producto)}>
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
