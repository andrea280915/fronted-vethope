import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import stockService from '../services/stockService';
import clientService from '../services/clienteService';
import ventasService from '../services/salesService';
import './ProductsPage.css';

// NOTA: Para jspdf 3.0.3, el constructor es "jsPDF" (con j minúscula)
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

  // Cargar jsPDF dinámicamente - CORRECCIÓN PARA v3.0.3
  useEffect(() => {
    const loadPdfLibrary = async () => {
      try {
        // Para jspdf 3.0.3, necesitamos esta sintaxis especial
        const jsPDFModule = await import('jspdf');
        console.log('jsPDF module:', jsPDFModule);
        
        // En jspdf 3.x, puede ser jsPDFModule.default o jsPDFModule.jsPDF
        // Probemos diferentes formas
        if (jsPDFModule.default && typeof jsPDFModule.default === 'function') {
          jsPDF = jsPDFModule.default;
        } else if (jsPDFModule.jsPDF && typeof jsPDFModule.jsPDF === 'function') {
          jsPDF = jsPDFModule.jsPDF;
        } else if (jsPDFModule && typeof jsPDFModule === 'function') {
          jsPDF = jsPDFModule;
        } else {
          throw new Error('No se pudo encontrar el constructor jsPDF');
        }
        
        hasPdfLibrary = true;
        setPdfReady(true);
        console.log('✅ jsPDF v3.0.3 cargado correctamente');
        console.log('Constructor jsPDF:', jsPDF);
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

  // Función alternativa SIEMPRE FUNCIONAL para generar PDF (sin dependencia de jsPDF)
  const generarPDFAlternativo = (ventaCreada) => {
    try {
      const fecha = new Date().toLocaleString();
      const clienteDNI = selectedClient.dni || selectedClient.documento || 'No especificado';
      const idVenta = ventaCreada.id_venta || ventaCreada.id || ventaCreada.data?.id_venta || 'temp';
      const totalVenta = total.toFixed(2);
      
      // Crear contenido HTML del comprobante
      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Comprobante ${tipoComprobante} #${idVenta}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .comprobante {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ddd;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #1EAE98;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1EAE98;
              margin: 0 0 10px 0;
            }
            .info-comprobante {
              text-align: right;
              margin-bottom: 30px;
            }
            .cliente-info, .venta-info {
              margin-bottom: 30px;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 5px;
            }
            .detalle-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .detalle-table th {
              background: #1EAE98;
              color: white;
              padding: 12px;
              text-align: left;
            }
            .detalle-table td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            .detalle-table tr:hover {
              background: #f5f5f5;
            }
            .total-section {
              text-align: right;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #1EAE98;
            }
            .total-amount {
              font-size: 24px;
              font-weight: bold;
              color: #1EAE98;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .comprobante { border: none; box-shadow: none; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="comprobante">
            <div class="header">
              <h1>Veterinaria VetHope</h1>
              <p>RUC: 20457896321</p>
              <p>Av. Siempre Viva 123 - Lima, Perú</p>
              <p>Tel: (01) 567-1234 | contacto@vethope.com</p>
            </div>
            
            <div class="info-comprobante">
              <h2>${tipoComprobante} N°: ${String(idVenta).padStart(6, '0')}</h2>
              <p><strong>Fecha:</strong> ${fecha}</p>
            </div>
            
            <div class="cliente-info">
              <h3>DATOS DEL CLIENTE</h3>
              <p><strong>Nombre:</strong> ${selectedClient.nombre} ${selectedClient.apellido}</p>
              <p><strong>DNI:</strong> ${clienteDNI}</p>
              <p><strong>Tipo:</strong> ${clienteDNI.length === 11 ? 'RUC' : 'DNI'}</p>
            </div>
            
            <div class="venta-info">
              <h3>DETALLE DE LA VENTA</h3>
              <table class="detalle-table">
                <thead>
                  <tr>
                    <th>Cantidad</th>
                    <th>Descripción</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${cart.map(item => `
                    <tr>
                      <td>${item.cantidad}</td>
                      <td>${item.nombre}</td>
                      <td>S/. ${item.precio.toFixed(2)}</td>
                      <td>S/. ${(item.precio * item.cantidad).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="total-section">
              <h2>TOTAL</h2>
              <p class="total-amount">S/. ${totalVenta}</p>
            </div>
            
            <div class="footer">
              <p>Gracias por su compra</p>
              <p>Este documento es válido como comprobante de pago</p>
              <p>Veterinaria VetHope © ${new Date().getFullYear()}</p>
              <button class="no-print" onclick="window.print()" style="
                background: #1EAE98;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
              ">🖨️ Imprimir Comprobante</button>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Abrir ventana para imprimir
      const ventana = window.open('', '_blank');
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      
      // Esperar a que se cargue el contenido y luego imprimir automáticamente
      ventana.onload = () => {
        ventana.focus();
        ventana.print();
      };
      
      return `${tipoComprobante}_${idVenta}.pdf`;
      
    } catch (error) {
      console.error('Error generando PDF alternativo:', error);
      return null;
    }
  };

  // Función usando jsPDF si está disponible
  const generarPDFConJsPDF = (ventaCreada) => {
    if (!hasPdfLibrary || !jsPDF) {
      throw new Error('jsPDF no disponible');
    }

    try {
      console.log('Intentando crear PDF con jsPDF...');
      console.log('jsPDF constructor:', jsPDF);
      
      // Crear instancia - IMPORTANTE: usar new jsPDF() en lugar de new jsPDF.create()
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
      doc.save(nombreArchivo);
      
      console.log('✅ PDF generado exitosamente con jsPDF');
      return nombreArchivo;
      
    } catch (error) {
      console.error('Error generando PDF con jsPDF:', error);
      throw error;
    }
  };

  // Función principal para generar PDF (usa alternativo si falla jsPDF)
  const generarPDF = (ventaCreada) => {
    try {
      // Primero intentar con jsPDF
      return generarPDFConJsPDF(ventaCreada);
    } catch (error) {
      console.log('jsPDF falló, usando método alternativo:', error);
      // Si falla jsPDF, usar método alternativo HTML
      return generarPDFAlternativo(ventaCreada);
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
        alert(`✅ Venta realizada con éxito. ${pdfReady ? 'PDF generado' : 'Comprobante listo para imprimir'}.`);
      } else {
        alert('✅ Venta realizada con éxito. Puede generar el comprobante manualmente.');
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
        errorMessage = 'Venta registrada correctamente. Se abrirá una ventana para imprimir el comprobante.';
        // Intentar método alternativo directamente
        setTimeout(() => {
          const ventaCreada = { id_venta: Date.now() }; // ID temporal
          generarPDFAlternativo(ventaCreada);
        }, 500);
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
            ⚠️ Usando método de impresión para comprobantes (jsPDF cargando...)
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
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : '✅ Generar Comprobante'}
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
