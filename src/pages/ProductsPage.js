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

  // Traer productos y clientes
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
        console.error('Error al obtener productos o clientes:', error);
      }
    };
    fetchData();
  }, []);

  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Stock insuficiente');
    setCart((prev) => {
      const exist = prev.find((p) => p.id === product.id);
      if (exist) {
        if (exist.cantidad + 1 > product.stock) return alert('No hay suficiente stock');
        return prev.map((p) =>
          p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const product = products.find((p) => p.id === id);
          const newCantidad = Math.max(1, item.cantidad + delta);
          if (newCantidad > item.cantidad + product.stock) return item;
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id === id ? { ...p, stock: p.stock - delta } : p
            )
          );
          return { ...item, cantidad: newCantidad };
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    const item = cart.find((c) => c.id === id);
    if (item) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, stock: p.stock + item.cantidad } : p
        )
      );
    }
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleVenta = () => {
    if (cart.length === 0) return alert('Agrega productos al carrito antes de continuar.');
    setShowModal(true);
  };

  const generarPDF = async () => {
    if (!selectedClient) return alert('Seleccione un cliente antes de continuar.');

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
    doc.text(`Nombre: ${selectedClient.nombre}`, 15, 56);
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

    // Actualizar stock backend
    try {
      await Promise.all(
        cart.map((item) => stockService.updateStock(item.id, item.cantidad))
      );
      alert('Venta realizada con éxito');
    } catch (error) {
      console.error('Error actualizando stock:', error);
      alert('Hubo un error al actualizar stock');
    }

    setCart([]);
    setShowModal(false);
    const updatedProducts = await stockService.getAllStock();
    setProducts(updatedProducts);
  };

  return (
    <AdminLayout>
      {/* TODO: Mantener exactamente tu UI original */}
    </AdminLayout>
  );
};

export default ProductsPage;
