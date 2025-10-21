import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout/AdminLayout";
import { jsPDF } from "jspdf";
import logo from "../Images/logo_inicio.png";
import "./SalesPage.css";

const SalesPage = () => {
  const [ventas, setVentas] = useState([
    {
      id: 1,
      cliente: "Carlos López",
      comprobante: "Boleta",
      fecha: "2025-10-07 10:45",
      total: 56.0,
      detalle: [
        { producto: "Alimento Premium", cantidad: 2, precio: 25.5 },
        { producto: "Juguete para Perro", cantidad: 1, precio: 5.0 },
      ],
    },
    {
      id: 2,
      cliente: "María Pérez",
      comprobante: "Factura",
      fecha: "2025-10-06 16:22",
      total: 36.5,
      detalle: [{ producto: "Collar Antipulgas", cantidad: 3, precio: 12.17 }],
    },
  ]);

  const [editingSale, setEditingSale] = useState(null);

  const eliminarVenta = (id) => {
    if (window.confirm("¿Deseas eliminar esta venta?")) {
      setVentas((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleEdit = (venta) => {
    setEditingSale(venta);
  };

  const handleSaveEdit = () => {
    setVentas((prev) =>
      prev.map((v) => (v.id === editingSale.id ? editingSale : v))
    );
    setEditingSale(null);
  };

  const generarComprobante = (venta) => {
    const doc = new jsPDF();
    const yInicio = 20;

    // Logo
    if (logo) {
      doc.addImage(logo, "PNG", 15, 10, 25, 25);
    }

    doc.setFontSize(14);
    doc.text("Veterinaria VetHope", 45, 18);
    doc.setFontSize(10);
    doc.text("RUC: 20457896321", 45, 25);
    doc.text("Av. Siempre Viva 123 - Lima, Perú", 45, 30);
    doc.text("Tel: (01) 567-1234", 45, 35);

    doc.line(10, 42, 200, 42);

    // Cabecera comprobante
    doc.setFontSize(12);
    doc.text(`Comprobante: ${venta.comprobante}`, 140, 20);
    doc.text(`N°: ${venta.id.toString().padStart(6, "0")}`, 140, 26);
    doc.text(`Fecha: ${venta.fecha}`, 140, 32);

    // Datos cliente
    doc.text("Cliente:", 15, yInicio + 35);
    doc.text(venta.cliente, 40, yInicio + 35);

    // Detalle
    doc.text("DETALLE DE VENTA", 15, yInicio + 50);
    let y = yInicio + 55;
    doc.text("Cant.", 15, y);
    doc.text("Producto", 35, y);
    doc.text("P.Unit", 120, y);
    doc.text("Subtotal", 170, y);
    y += 6;

    venta.detalle.forEach((item) => {
      const subtotal = item.precio * item.cantidad;
      doc.text(String(item.cantidad), 15, y);
      doc.text(item.producto, 35, y);
      doc.text(`S/. ${item.precio.toFixed(2)}`, 120, y);
      doc.text(`S/. ${subtotal.toFixed(2)}`, 170, y);
      y += 6;
    });

    doc.line(10, y, 200, y);
    doc.setFontSize(11);
    doc.text(`TOTAL: S/. ${venta.total.toFixed(2)}`, 150, y + 10);

    doc.save(`${venta.comprobante}_${venta.id}.pdf`);
  };

  return (
    <AdminLayout>
      <div className="sales-page">
        <h1>📋 Historial de Ventas</h1>

        <table className="sales-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Comprobante</th>
              <th>Fecha</th>
              <th>Total (S/.)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td colSpan="6">No hay ventas registradas</td>
              </tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.cliente}</td>
                  <td>{v.comprobante}</td>
                  <td>{v.fecha}</td>
                  <td>{v.total.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => generarComprobante(v)}
                    >
                      📄 PDF
                    </button>
                    <button className="btn-edit" onClick={() => handleEdit(v)}>
                      ✏️ Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => eliminarVenta(v.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* MODAL EDICIÓN */}
        {editingSale && (
          <div className="modal">
            <div className="modal-content">
              <h2>✏️ Editar Venta</h2>
              <label>Cliente:</label>
              <input
                type="text"
                value={editingSale.cliente}
                onChange={(e) =>
                  setEditingSale({ ...editingSale, cliente: e.target.value })
                }
              />
              <label>Tipo de Comprobante:</label>
              <select
                value={editingSale.comprobante}
                onChange={(e) =>
                  setEditingSale({ ...editingSale, comprobante: e.target.value })
                }
              >
                <option value="Boleta">Boleta</option>
                <option value="Factura">Factura</option>
              </select>

              <div className="modal-buttons">
                <button className="btn-confirm" onClick={handleSaveEdit}>
                  Guardar Cambios
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setEditingSale(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SalesPage;
