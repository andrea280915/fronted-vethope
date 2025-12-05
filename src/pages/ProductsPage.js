import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import stockService from '../services/stockService';
import clientService from '../services/clienteService';
import ventasService from '../services/salesService'; // Verifica que esta importación sea correcta

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState('Boleta');
  const [cart, setCart] = useState([]);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showDetalleForm, setShowDetalleForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ventaRealizada, setVentaRealizada] = useState(false);
  const [ventaInfo, setVentaInfo] = useState(null);

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
    setVentaRealizada(false);
    setVentaInfo(null);
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

  // Función para generar comprobante HTML e imprimir
  const generarComprobante = (ventaCreada) => {
    try {
      const fecha = new Date().toLocaleString();
      const clienteDNI = selectedClient.dni || selectedClient.documento || 'No especificado';
      const idVenta = ventaCreada.id_venta || ventaCreada.id || ventaCreada.data?.id_venta || `TEMP_${Date.now()}`;
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
              <p>✅ VENTA REGISTRADA EXITOSAMENTE</p>
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
              <button class="no-print" onclick="window.close()" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
                margin-left: 10px;
              ">Cerrar Ventana</button>
            </div>
          </div>
          
          <script>
            // Imprimir automáticamente cuando se carga la página
            window.onload = function() {
              // Pequeño retraso para asegurar que todo esté cargado
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `;
      
      // Abrir ventana para imprimir
      const ventana = window.open('', '_blank', 'width=900,height=700');
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      
      // Guardar información de la venta para mostrar en el mensaje
      const ventaInfo = {
        id: idVenta,
        tipo: tipoComprobante,
        cliente: `${selectedClient.nombre} ${selectedClient.apellido}`,
        total: totalVenta,
        fecha: fecha
      };
      setVentaInfo(ventaInfo);
      
      return ventaInfo;
      
    } catch (error) {
      console.error('Error generando comprobante:', error);
      return null;
    }
  };

  // Función alternativa para crear venta directamente (si el servicio falla)
  const crearVentaDirecta = async (ventaData) => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = "https://backend-vethope-production.up.railway.app/api/v1/ventas";
      
      console.log('🔍 Creando venta directamente con URL:', API_URL);
      console.log('🔍 Datos enviados:', ventaData);
      console.log('🔍 Token disponible:', token ? 'Sí' : 'No');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ventaData)
      });
      
      console.log('🔍 Respuesta del servidor:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('🔍 Error del servidor:', errorData);
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      const result = await response.json();
      console.log('✅ Venta creada directamente:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en crearVentaDirecta:', error);
      throw error;
    }
  };

  // --- Guardar venta y generar comprobante ---
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
      console.log('🔍 Verificando servicio ventasService:', ventasService);
      console.log('🔍 Método create existe?', ventasService ? typeof ventasService.create : 'servicio no disponible');

      // 2️⃣ Intentar usar el servicio primero, si falla usar función directa
      let ventaCreada;
      try {
        // Verificar si el servicio está disponible
        if (ventasService && typeof ventasService.create === 'function') {
          console.log('✅ Usando servicio ventasService.create');
          ventaCreada = await ventasService.create(ventaPayload);
        } else {
          console.log('⚠️ Servicio no disponible, usando función directa');
          ventaCreada = await crearVentaDirecta(ventaPayload);
        }
      } catch (serviceError) {
        console.error('❌ Error con el servicio, intentando función directa:', serviceError);
        ventaCreada = await crearVentaDirecta(ventaPayload);
      }

      console.log('✅ Venta creada en backend:', ventaCreada);

      // 3️⃣ Mostrar mensaje de éxito inmediatamente
      setVentaRealizada(true);
      
      // 4️⃣ Generar y mostrar comprobante
      const ventaInfo = generarComprobante(ventaCreada);
      
      if (ventaInfo) {
        // Mostrar alerta de éxito
        alert(`✅ VENTA REGISTRADA EXITOSAMENTE\n\n📋 Detalles:\n• Número: ${ventaInfo.tipo} #${ventaInfo.id}\n• Cliente: ${ventaInfo.cliente}\n• Total: S/. ${ventaInfo.total}\n• Fecha: ${ventaInfo.fecha}\n\nSe ha abierto una ventana con el comprobante para imprimir.`);
      }

      // 5️⃣ Limpiar carrito y resetear estado
      setCart([]);
      setSelectedClient(null);
      setShowDetalleForm(false);

      // 6️⃣ Actualizar lista de productos (stock ya se actualizó localmente)
      // Pero actualizamos desde la API para estar seguros
      const updatedProducts = await stockService.getAllStock();
      setProducts(updatedProducts);
      
      console.log('✅ Stock actualizado después de la venta');
      
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
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener DNI del cliente
  const getClienteDNI = (cliente) => {
    return cliente?.dni || cliente?.documento || 'No especificado';
  };

  // Estilos CSS en variables para usar inline
  const styles = {
    productsPage: {
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      backgroundColor: '#f4f7f6',
      minHeight: '100vh'
    },
    pageTitle: {
      fontSize: '2rem',
      color: '#2C3E50',
      marginBottom: '5px'
    },
    pageSubtitle: {
      fontSize: '1.1rem',
      color: '#555',
      marginBottom: '30px'
    },
    ventaExitosaAlert: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    },
    ventaExitosaContent: {
      background: 'white',
      padding: '30px',
      borderRadius: '12px',
      maxWidth: '500px',
      width: '90%',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      border: '3px solid #4CAF50'
    },
    ventaDetails: {
      background: '#f8fff8',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #c8e6c9',
      textAlign: 'left'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(31, 41, 55, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      width: '90%',
      maxWidth: '480px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#1EAE98',
      marginBottom: '20px',
      borderBottom: '2px solid #F3F4F6',
      paddingBottom: '10px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontWeight: 600,
      color: '#4B5563',
      marginBottom: '5px'
    },
    formSelect: {
      width: '100%',
      padding: '12px 15px',
      border: '1px solid #ccc',
      borderRadius: '6px',
      fontSize: '1rem',
      backgroundColor: '#fcfcfc'
    },
    paymentDetails: {
      marginTop: '20px',
      padding: '15px',
      border: '1px solid #F3F4F6',
      borderRadius: '8px',
      backgroundColor: '#F9FAFB'
    },
    clientInfo: {
      background: '#EFF6FF',
      border: '1px dashed #BFDBFE',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      color: '#1EAE98',
      fontWeight: 600
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '25px',
      gap: '10px'
    },
    buttonConfirm: {
      background: '#1EAE98',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 600,
      border: 'none'
    },
    buttonCancel: {
      background: '#9CA3AF',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 600,
      border: 'none'
    },
    productList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '25px',
      marginBottom: '50px'
    },
    productCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
      border: '1px solid #E5E7EB'
    },
    productName: {
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#2C3E50',
      margin: '5px 0'
    },
    productPrice: {
      fontSize: '1.3rem',
      fontWeight: 700,
      color: '#1EAE98',
      marginBottom: '10px'
    },
    addToCartButton: {
      backgroundColor: '#1EAE98',
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      width: '100%'
    },
    cartSection: {
      background: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    },
    cartHeader: {
      fontSize: '1.8rem',
      fontWeight: 700,
      color: '#2C3E50',
      marginBottom: '20px'
    },
    cartTableContainer: {
      overflowX: 'auto'
    },
    cartTable: {
      width: '100%',
      minWidth: '600px',
      borderCollapse: 'separate',
      borderSpacing: '0 10px'
    },
    cartTableHead: {
      th: {
        padding: '15px 10px',
        textAlign: 'center',
        backgroundColor: '#F3F4F6',
        color: '#2C3E50',
        fontWeight: 600,
        fontSize: '0.9rem',
        textTransform: 'uppercase'
      }
    },
    cartItemName: {
      textAlign: 'left',
      fontWeight: 500,
      color: '#2C3E50'
    },
    quantityControls: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px'
    },
    removeItemButton: {
      background: '#EF4444',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 600
    },
    cartSummary: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0',
      borderTop: '2px solid #eee',
      marginTop: '20px',
      fontSize: '1.2rem',
      fontWeight: 600
    },
    cartActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px',
      marginTop: '30px'
    },
    checkoutButton: {
      background: '#1EAE98',
      color: 'white',
      padding: '14px 30px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '1.1rem',
      width: '100%',
      marginTop: '20px',
      boxShadow: '0 4px 15px rgba(30, 174, 152, 0.3)'
    },
    modalTotal: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: '#2C3E50',
      textAlign: 'right',
      marginTop: '15px'
    }
  };

  return (
    <AdminLayout>
      <div style={styles.productsPage}>
        <h1 style={styles.pageTitle}>🛍️ Registro de Ventas</h1>
        <p style={styles.pageSubtitle}>Agrega productos al carrito y completa la venta</p>

        {/* Mostrar mensaje de venta exitosa si está disponible */}
        {ventaRealizada && ventaInfo && (
          <div style={styles.ventaExitosaAlert}>
            <div style={styles.ventaExitosaContent}>
              <h3>✅ VENTA REGISTRADA EXITOSAMENTE</h3>
              <div style={styles.ventaDetails}>
                <p><strong>Comprobante:</strong> {ventaInfo.tipo} #{ventaInfo.id}</p>
                <p><strong>Cliente:</strong> {ventaInfo.cliente}</p>
                <p><strong>Total:</strong> S/. {ventaInfo.total}</p>
                <p><strong>Fecha:</strong> {ventaInfo.fecha}</p>
                <p style={{color: '#2e7d32', fontWeight: 'bold', marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #c8e6c9'}}>
                  ✅ El stock de productos ha sido actualizado
                </p>
              </div>
              <button 
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
                onClick={() => {
                  setVentaRealizada(false);
                  setVentaInfo(null);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal de selección de cliente */}
        {showClienteModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>👤 Seleccionar Cliente</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Cliente:</label>
                <select
                  value={selectedClient?.id_cliente || ''}
                  onChange={(e) => {
                    const clientId = Number(e.target.value);
                    const client = clients.find(c => c.id_cliente === clientId);
                    setSelectedClient(client || null);
                  }}
                  style={{...styles.formSelect, ...(loading ? {backgroundColor: '#e5e7eb', cursor: 'not-allowed'} : {})}}
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

              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Comprobante:</label>
                <select
                  value={tipoComprobante}
                  onChange={(e) => setTipoComprobante(e.target.value)}
                  style={{...styles.formSelect, ...(loading ? {backgroundColor: '#e5e7eb', cursor: 'not-allowed'} : {})}}
                  disabled={loading}
                >
                  <option value="Boleta">Boleta</option>
                  <option value="Factura">Factura</option>
                </select>
              </div>

              {selectedClient && (
                <div style={styles.paymentDetails}>
                  <p><strong>Cliente seleccionado:</strong></p>
                  <p>{selectedClient.nombre} {selectedClient.apellido}</p>
                  <p><strong>DNI:</strong> {getClienteDNI(selectedClient)}</p>
                  <p><strong>Teléfono:</strong> {selectedClient.telefono || 'No especificado'}</p>
                </div>
              )}

              <div style={styles.paymentDetails}>
                <p><strong>Productos en carrito:</strong> {cart.length}</p>
                <p><strong>Total a pagar:</strong> S/. {total.toFixed(2)}</p>
              </div>

              <div style={styles.modalActions}>
                <button 
                  style={{...styles.buttonConfirm, ...(loading ? {backgroundColor: '#cccccc', cursor: 'not-allowed'} : {})}}
                  onClick={handleContinuarDetalle}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Continuar a Detalle'}
                </button>
                <button 
                  style={{...styles.buttonCancel, ...(loading ? {backgroundColor: '#cccccc', cursor: 'not-allowed'} : {})}}
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
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>🧾 Detalle de Venta</h3>
              
              {selectedClient && (
                <div style={styles.clientInfo}>
                  <div>
                    <p><strong>Cliente:</strong> {selectedClient.nombre} {selectedClient.apellido}</p>
                    <p><strong>DNI:</strong> {getClienteDNI(selectedClient)}</p>
                    <p><strong>Tipo de Comprobante:</strong> {tipoComprobante}</p>
                    <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Teléfono:</strong> {selectedClient.telefono || 'No especificado'}</p>
                  </div>
                </div>
              )}
              
              <div style={styles.cartTableContainer}>
                <table style={styles.cartTable}>
                  <thead style={styles.cartTableHead}>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id_producto} style={{backgroundColor: 'white'}}>
                        <td style={styles.cartItemName}>{item.nombre}</td>
                        <td>S/. {item.precio.toFixed(2)}</td>
                        <td>{item.cantidad}</td>
                        <td>S/. {(item.precio * item.cantidad).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={styles.modalTotal}>
                Total: <span style={{color: '#1EAE98'}}>S/. {total.toFixed(2)}</span>
              </div>
              
              <div style={styles.modalActions}>
                <button 
                  style={{...styles.buttonConfirm, ...(loading ? {backgroundColor: '#cccccc', cursor: 'not-allowed'} : {})}}
                  onClick={handleGenerarComprobante}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : '✅ Finalizar Venta y Generar Comprobante'}
                </button>
                <button 
                  style={{...styles.buttonCancel, ...(loading ? {backgroundColor: '#cccccc', cursor: 'not-allowed'} : {})}}
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
        <div style={styles.productList}>
          {products.map((p) => (
            <div key={p.id_producto} style={styles.productCard}>
              <h3 style={styles.productName}>{p.nombre}</h3>
              <p style={styles.productPrice}>S/. {p.precio.toFixed(2)}</p>
              <p>Stock disponible: {p.stock}</p>
              <button 
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                style={{
                  ...styles.addToCartButton,
                  ...(p.stock <= 0 ? {backgroundColor: '#cccccc', cursor: 'not-allowed'} : {})
                }}
              >
                {p.stock <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
              </button>
            </div>
          ))}
        </div>

        {/* Carrito */}
        <div style={styles.cartSection}>
          <h2 style={styles.cartHeader}>🛒 Carrito de Compras</h2>
          {cart.length === 0 ? (
            <p>No hay productos agregados al carrito.</p>
          ) : (
            <>
              <div style={styles.cartTableContainer}>
                <table style={styles.cartTable}>
                  <thead style={styles.cartTableHead}>
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
                      <tr key={item.id_producto} style={{backgroundColor: 'white'}}>
                        <td style={styles.cartItemName}>{item.nombre}</td>
                        <td>S/. {item.precio.toFixed(2)}</td>
                        <td>
                          <div style={styles.quantityControls}>
                            <button 
                              onClick={() => updateQuantity(item.id_producto, -1)}
                              style={{
                                background: '#1EAE98',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              -
                            </button>
                            <span>{item.cantidad}</span>
                            <button 
                              onClick={() => updateQuantity(item.id_producto, 1)}
                              style={{
                                background: '#1EAE98',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>S/. {(item.precio * item.cantidad).toFixed(2)}</td>
                        <td>
                          <button 
                            style={styles.removeItemButton}
                            onClick={() => removeItem(item.id_producto)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={styles.cartSummary}>
                <div>Total:</div>
                <div style={{color: '#1EAE98', fontSize: '1.5rem'}}>S/. {total.toFixed(2)}</div>
              </div>
              <div style={styles.cartActions}>
                <button 
                  style={{
                    ...styles.checkoutButton,
                    ...(loading ? {backgroundColor: '#cccccc', cursor: 'not-allowed', boxShadow: 'none'} : {})
                  }}
                  onClick={handleFinalizarVenta}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : '💰 Finalizar Venta'}
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
