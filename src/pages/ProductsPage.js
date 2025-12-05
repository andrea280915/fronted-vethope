import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { jsPDF } from 'jspdf';
import logo from '../Images/logo_inicio.png';
import stockService from '../services/stockService';
import clientService from '../services/clienteService';
import ventasService from '../services/salesService';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState('Boleta');
  const [cart, setCart] = useState([]);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showDetalleForm, setShowDetalleForm] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // --- Carrito - FUNCIÓN CORREGIDA ---
  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Stock insuficiente');
    
    setCart((prev) => {
      const exist = prev.find((p) => p.id_producto === product.id_producto);
      if (exist) {
        if (exist.cantidad + 1 > product.stock) {
          alert('No hay suficiente stock');
          return prev;
        }
        return prev.map((p) =>
          p.id_producto === product.id_producto
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
    
    // CORRECCIÓN: Solo descuenta 1 del stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id_producto === product.id_producto
          ? { ...p, stock: p.stock - 1 }
          : p
      )
    );
  };

  // --- CORREGIDO: updateQuantity no debe descontar doble ---
  const updateQuantity = (id_producto, delta) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id_producto === id_producto) {
          const product = products.find((p) => p.id_producto === id_producto);
          const newCantidad = item.cantidad + delta;
          
          // Validaciones
          if (newCantidad < 1) return item;
          
          // Validar stock suficiente al incrementar
          if (delta > 0) {
            const stockActual = product?.stock || 0;
            if (stockActual < delta) {
              alert('No hay suficiente stock disponible');
              return item;
            }
          }
          
          return { ...item, cantidad: newCantidad };
        }
        return item;
      });
    });
    
    // Actualizar stock del producto - CORRECCIÓN
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id_producto === id_producto) {
          // Solo actualizar si realmente tenemos el producto
          if (delta > 0) {
            // Disminuir stock al agregar cantidad
            return { ...p, stock: Math.max(0, p.stock - delta) };
          } else if (delta < 0) {
            // Aumentar stock al reducir cantidad
            return { ...p, stock: p.stock + Math.abs(delta) };
          }
        }
        return p;
      })
    );
  };

  const removeItem = (id_producto) => {
    const item = cart.find((c) => c.id_producto === id_producto);
    if (item) {
      // Devolver todo el stock del producto eliminado
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

  // --- Abrir modal de cliente ---
  const handleFinalizarVenta = () => {
    if (cart.length === 0) {
      alert('Agrega productos al carrito antes de continuar.');
      return;
    }
    setSelectedClient(null);
    setShowClienteModal(true);
  };

  // --- Abrir detalle de venta ---
  const handleContinuarDetalle = () => {
    if (!selectedClient) {
      alert('Selecciona un cliente antes de continuar.');
      return;
    }
    console.log('Cliente seleccionado:', selectedClient); // Para debug
    setShowClienteModal(false);
    setShowDetalleForm(true);
  };

  // --- Guardar venta y detalle, generar PDF ---
  const handleGenerarComprobante = async () => {
    try {
      // Validar que haya productos en el carrito
      if (cart.length === 0) {
        alert('No hay productos en el carrito');
        return;
      }

      // Validar cliente seleccionado
      if (!selectedClient) {
        alert('Debe seleccionar un cliente');
        return;
      }

      // Verificar autenticación
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticado. Por favor, inicia sesión nuevamente.");
        window.location.href = "/login";
        return;
      }

      setLoading(true);

      // 1️⃣ Preparar payload para la API
      const ventaPayload = {
        id_tipo_comprobante: tipoComprobante === 'Boleta' ? 1 : 2,
        id_cliente: selectedClient.id_cliente,
        detalle: cart.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad
        }))
      };

      console.log('Enviando venta:', ventaPayload);
      console.log('Cliente DNI:', selectedClient.dni || selectedClient.documento); // Debug

      // 2️⃣ Guardar venta
      const ventaCreada = await ventasService.create(ventaPayload);
      console.log('Venta creada:', ventaCreada);

      // Obtener ID de venta de la respuesta
      const idVenta = ventaCreada.id_venta || ventaCreada.id || ventaCreada.data?.id_venta;

      // 3️⃣ Generar PDF - CORREGIDO para usar el DNI del cliente
      const doc = new jsPDF();
      const fecha = new Date().toLocaleString();
      
      // Logo y encabezado
      if (logo) doc.addImage(logo, 'PNG', 15, 10, 25, 25);
      doc.setFontSize(14);
      doc.text('Veterinaria VetHope', 45, 18);
      doc.setFontSize(10);
      doc.text(`RUC: 20457896321`, 45, 25);
      doc.text(`Av. Siempre Viva 123 - Lima, Perú`, 45, 30);
      doc.text(`Tel: (01) 567-1234 / contacto@vethope.com`, 45, 35);
      doc.line(10, 40, 200, 40);

      // Información del comprobante
      doc.setFontSize(12);
      doc.text(`Comprobante: ${tipoComprobante}`, 140, 20);
      doc.text(`N°: ${String(idVenta || '001').padStart(6, '0')}`, 140, 26);
      doc.text(`Fecha: ${fecha}`, 140, 32);

      // CORRECCIÓN: Usar dni en lugar de documento
      const clienteDNI = selectedClient.dni || selectedClient.documento || 'No especificado';
      
      // Datos del cliente
      doc.setFontSize(11);
      doc.text('DATOS DEL CLIENTE:', 15, 50);
      doc.setFontSize(10);
      doc.text(`Nombre: ${selectedClient.nombre} ${selectedClient.apellido}`, 15, 56);
      doc.text(`DNI: ${clienteDNI}`, 15, 61);
      
      // Determinar tipo de documento
      let tipoDocumento = 'DNI';
      if (clienteDNI.length === 11) tipoDocumento = 'RUC';
      doc.text(`Tipo: ${tipoDocumento}`, 15, 66);

      // Detalle de la venta
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

      // Guardar PDF
      const nombreArchivo = `${tipoComprobante}_${idVenta || 'temp'}.pdf`;
      doc.save(nombreArchivo);

      alert('✅ Venta realizada con éxito y PDF generado.');

      // Limpiar estado
      setCart([]);
      setSelectedClient(null);
      setShowDetalleForm(false);

      // Actualizar lista de productos
      const updatedProducts = await stockService.getAllStock();
      setProducts(updatedProducts);
      
    } catch (error) {
      console.error('Error completo al generar comprobante:', error);
      
      let errorMessage = 'Ocurrió un error al procesar la venta.';
      
      if (error.message.includes('Acceso denegado') || 
          error.message.includes('Token') || 
          error.message.includes('403') ||
          error.message.includes('Forbidden')) {
        errorMessage = 'Acceso denegado. Token inválido o expirado. Por favor, inicie sesión nuevamente.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (error.message.includes('Datos inválidos') || error.message.includes('400')) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener DNI del cliente - CORRECCIÓN
  const getClienteDNI = (cliente) => {
    return cliente.dni || cliente.documento || 'No especificado';
  };

  return (
    <AdminLayout>
      <div className="products-page">
        <h1 className="page-title">🛍️ Registro de Ventas</h1>
        <p className="page-subtitle">Agrega productos al carrito y completa la venta</p>

        {/* Modal de selección de cliente */}
        {showClienteModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>👤 Seleccionar Cliente</h3>
              
              <div className="form-group">
                <label>Cliente:</label>
                <select
                  value={selectedClient?.id_cliente || ''}
                  onChange={(e) => {
                    const clientId = Number(e.target.value);
                    const client = clients.find(c => c.id_cliente === clientId);
                    setSelectedClient(client || null);
                  }}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="">Seleccionar Cliente</option>
                  {clients.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre} {c.apellido} - DNI: {getClienteDNI(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de Comprobante:</label>
                <select
                  value={tipoComprobante}
                  onChange={(e) => setTipoComprobante(e.target.value)}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="Boleta">Boleta</option>
                  <option value="Factura">Factura</option>
                </select>
              </div>

              {/* CORRECCIÓN: Mostrar DNI del cliente seleccionado */}
              {selectedClient && (
                <div className="payment-details">
                  <p><strong>Cliente seleccionado:</strong></p>
                  <p>{selectedClient.nombre} {selectedClient.apellido}</p>
                  <p><strong>DNI:</strong> {getClienteDNI(selectedClient)}</p>
                  <p><strong>Teléfono:</strong> {selectedClient.telefono || 'No especificado'}</p>
                </div>
              )}

              <div className="payment-details">
                <p><strong>Productos en carrito:</strong> {cart.length}</p>
                <p><strong>Total a pagar:</strong> S/. {total.toFixed(2)}</p>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-confirm" 
                  onClick={handleContinuarDetalle}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Continuar a Detalle'}
                </button>
                <button 
                  className="btn-cancel" 
                  onClick={() => {
                    setShowClienteModal(false);
                    setSelectedClient(null);
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalle de venta - CORREGIDO para mostrar DNI */}
        {showDetalleForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>🧾 Detalle de Venta</h3>
              
              {selectedClient && (
                <div className="client-info">
                  <div>
                    <p><strong>Cliente:</strong> {selectedClient.nombre} {selectedClient.apellido}</p>
                    <p><strong>DNI:</strong> {getClienteDNI(selectedClient)}</p>
                    <p><strong>Tipo de Comprobante:</strong> {tipoComprobante}</p>
                    <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Teléfono:</strong> {selectedClient.telefono || 'No especificado'}</p>
                  </div>
                </div>
              )}
              
              <div className="cart-table-container">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id_producto}>
                        <td className="cart-item-name">{item.nombre}</td>
                        <td>S/. {item.precio.toFixed(2)}</td>
                        <td>{item.cantidad}</td>
                        <td>S/. {(item.precio * item.cantidad).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="modal-total">
                Total: <span>S/. {total.toFixed(2)}</span>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-confirm" 
                  onClick={handleGenerarComprobante}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : '✅ Generar Comprobante y Descargar PDF'}
                </button>
                <button 
                  className="btn-cancel" 
                  onClick={() => setShowDetalleForm(false)}
                  disabled={loading}
                >
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
              <h3 className="product-name">{p.nombre}</h3>
              <p className="product-price">S/. {p.precio.toFixed(2)}</p>
              <p>Stock: {p.stock}</p>
              <button 
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className="add-to-cart-btn"
              >
                {p.stock <= 0 ? 'Sin Stock' : 'Agregar'}
              </button>
            </div>
          ))}
        </div>

        {/* Carrito */}
        <div className="cart-section">
          <h2 className="cart-header">🛒 Carrito</h2>
          {cart.length === 0 ? (
            <p>No hay productos agregados.</p>
          ) : (
            <>
              <div className="cart-table-container">
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
                        <td className="cart-item-name">{item.nombre}</td>
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
                          <button className="remove-item-btn" onClick={() => removeItem(item.id_producto)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="cart-summary">
                <div>Total:</div>
                <div>S/. {total.toFixed(2)}</div>
              </div>
              <div className="cart-actions">
                <button 
                  className="checkout-btn" 
                  onClick={handleFinalizarVenta}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Finalizar Venta'}
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
