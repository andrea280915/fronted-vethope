import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import stockService from '../services/stockService';
import clientService from '../services/clienteService';
import ventasService from '../services/salesService';
import './ProductsPage.css';

// Import correcto para jspdf 2.5.1+
let jsPDF;
let hasPdfLibrary = false;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState('Boleta');
  const [cart, setCart] = useState([]);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showDetalleForm, setShowDetalleForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  // Cargar jsPDF dinámicamente - CORRECCIÓN PARA v2.5.1+
  useEffect(() => {
    const loadPdfLibrary = async () => {
      try {
        // Para jspdf 2.5.1+, necesitamos importar de esta manera
        const jsPDFModule = await import('jspdf');
        
        // En jspdf 2.5.1+, el default export es jsPDF
        // También puede estar disponible como jsPDFModule.jsPDF
        if (jsPDFModule.default) {
          jsPDF = jsPDFModule.default;
        } else if (jsPDFModule.jsPDF) {
          jsPDF = jsPDFModule.jsPDF;
        } else {
          jsPDF = jsPDFModule;
        }
        
        hasPdfLibrary = true;
        setPdfReady(true);
        console.log('✅ jsPDF cargado correctamente:', jsPDF);
      } catch (error) {
        console.error('❌ Error cargando jsPDF:', error);
        alert('Error cargando la librería de PDF. La funcionalidad de PDF estará deshabilitada.');
      }
    };
    
    loadPdfLibrary();
  }, []);

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
    
    setProducts((prev) =>
      prev.map((p) =>
        p.id_producto === product.id_producto
          ? { ...p, stock: p.stock - 1 }
          : p
      )
    );
  };

  const updateQuantity = (id_producto, delta) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id_producto === id_producto) {
          const product = products.find((p) => p.id_producto === id_producto);
          const newCantidad = item.cantidad + delta;
          
          if (newCantidad < 1) return item;
          
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
    
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id_producto === id_producto) {
          if (delta > 0) {
            return { ...p, stock: Math.max(0, p.stock - delta) };
          } else if (delta < 0) {
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
    console.log('Cliente seleccionado:', selectedClient);
    setShowClienteModal(false);
    setShowDetalleForm(true);
  };

  // Función para generar PDF - CORREGIDA para jspdf 2.5.1+
  const generarPDF = (ventaCreada) => {
    if (!hasPdfLibrary || !jsPDF) {
      alert('La librería de PDF no está disponible. No se generará el PDF.');
      return null;
    }

    try {
      // Crear instancia correctamente para jspdf 2.5.1+
      const doc = new jsPDF();
      const fecha = new Date().toLocaleString();
      const clienteDNI = selectedClient.dni || selectedClient.documento || 'No especificado';
      const idVenta = ventaCreada.id_venta || ventaCreada.id || ventaCreada.data?.id_venta || 'temp';
      
      // Configurar documento
      doc.setFont("helvetica", "normal");
      
      // Logo y encabezado
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
      doc.text(`N°: ${String(idVenta).padStart(6, '0')}`, 140, 26);
      doc.text(`Fecha: ${fecha}`, 140, 32);

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
      const nombreArchivo = `${tipoComprobante}_${idVenta}.pdf`;
      
      // Guardar el documento
      doc.save(nombreArchivo);
      
      return nombreArchivo;
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      console.error('jsPDF disponible:', hasPdfLibrary);
      console.error('jsPDF constructor:', jsPDF);
      return null;
    }
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

      // Verificar que el PDF esté listo
      if (!pdfReady) {
        alert('La librería de PDF está cargando. Por favor, espere un momento.');
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
      console.log('Cliente DNI:', selectedClient.dni || selectedClient.documento);

      // 2️⃣ Guardar venta
      const ventaCreada = await ventasService.create(ventaPayload);
      console.log('Venta creada:', ventaCreada);

      // 3️⃣ Generar PDF
      const pdfGenerado = generarPDF(ventaCreada);
      
      if (pdfGenerado) {
        alert(`✅ Venta realizada con éxito. PDF (${pdfGenerado}) generado.`);
      } else {
        alert('✅ Venta realizada con éxito (PDF no generado por problemas técnicos).');
      }

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
      } else if (error.message.includes('create is not a function') || error.message.includes('is not a constructor')) {
        errorMessage = 'Error técnico con la generación de PDF. La venta se registró correctamente.';
        console.error('Error de jsPDF - Versión instalada:', require('jspdf/package.json').version);
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener DNI del cliente
  const getClienteDNI = (cliente) => {
    return cliente?.dni || cliente?.documento || 'No especificado';
  };

  return (
    <AdminLayout>
      <div className="products-page">
        <h1 className="page-title">🛍️ Registro de Ventas</h1>
        <p className="page-subtitle">Agrega productos al carrito y completa la venta</p>

        {!pdfReady && (
          <div className="pdf-warning">
            ⚠️ Cargando librería de PDF... La funcionalidad estará disponible pronto.
          </div>
        )}

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

        {/* Modal de detalle de venta */}
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
                  disabled={loading || !pdfReady}
                >
                  {loading ? 'Procesando...' : `✅ ${pdfReady ? 'Generar Comprobante y Descargar PDF' : 'Cargando PDF...'}`}
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
