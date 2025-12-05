import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout/AdminLayout";
import { jsPDF } from "jspdf";
import logo from "../Images/logo_inicio.png";
import ventasService from "../services/salesService";
import detalleVentaService from "../services/detalleVentaService";
import clientesService from "../services/clienteService";
import "./SalesPage.css";

const SalesPage = () => {
  const [ventas, setVentas] = useState([]);
  const [editingSale, setEditingSale] = useState(null);
  const [clientes, setClientes] = useState([]);

  // Cargar ventas y clientes al iniciar
  useEffect(() => {
    const fetchData = async () => {
      const ventasData = await ventasService.getAll();
      setVentas(ventasData);

      const clientesData = await clientesService.getAll();
      setClientes(clientesData);
    };
    fetchData();
  }, []);

  const eliminarVenta = async (id) => {
    if (window.confirm("¿Deseas eliminar esta venta?")) {
      const success = await ventasService.delete(id);
      if (success) {
        setVentas((prev) => prev.filter((v) => v.id_venta !== id));
      }
    }
  };

  const handleEdit = (venta) => setEditingSale(venta);

  const handleSaveEdit = async () => {
    if (!editingSale) return;
    const updated = await ventasService.update(editingSale.id_venta, {
      id_cliente: editingSale.id_cliente,
      id_tipo_comprobante: editingSale.id_tipo_comprobante,
      detalle: editingSale.detalle.map((d) => ({
        id_producto: d.id_producto,
        cantidad: d.cantidad,
      })),
    });
    if (updated) {
      setVentas((prev) =>
        prev.map((v) =>
          v.id_venta === editingSale.id_venta ? updated : v
        )
      );
      setEditingSale(null);
    }
  };

  const generarComprobante = async (venta) => {
    // Obtener detalle de venta desde API
    const detalle = await detalleVentaService.getAll();
    const detalleVenta = detalle.filter((d) => d.id_venta === venta.id_venta);

    // Obtener nombre del cliente
    const cliente = clientes.find((c) => c.id === venta.id_cliente);

    const doc = new jsPDF();
    const yInicio = 20;

    if (logo) doc.addImage(logo, "PNG", 15, 10, 25, 25);

    doc.setFontSize(14);
    doc.text("Veterinaria VetHope", 45, 18);
    doc.setFontSize(10);
    doc.text("RUC: 20457896321", 45, 25);
    doc.text("Av. Siempre Viva 123 - Lima, Perú", 45, 30);
    doc.text("Tel: (01) 567-1234", 45, 35);

    doc.line(10, 42, 200, 42);

    doc.setFontSize(12);
    doc.text(`Comprobante: ${venta.tipo_comprobante}`, 140, 20);
    doc.text(`N°: ${String(venta.id_venta).padStart(6, "0")}`, 140, 26);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString()}`, 140, 32);

    doc.text("Cliente:", 15, yInicio + 35);
    doc.text(cliente ? cliente.nombre : venta.cliente, 40, yInicio + 35);

    doc.text("DETALLE DE VENTA", 15, yInicio + 50);
    let y = yInicio + 55;
    doc.text("Cant.", 15, y);
    doc.text("Producto", 35, y);
    doc.text("P.Unit", 120, y);
    doc.text("Subtotal", 170, y);
    y += 6;

    detalleVenta.forEach((item) => {
      doc.text(String(item.cantidad), 15, y);
      doc.text(item.producto, 35, y);
      doc.text(`S/. ${item.subtotal / item.cantidad}`, 120, y);
      doc.text(`S/. ${item.subtotal}`, 170, y);
      y += 6;
    });

    doc.line(10, y, 200, y);
    doc.setFontSize(11);
    doc.text(`TOTAL: S/. ${venta.total.toFixed(2)}`, 150, y + 10);

    doc.save(`${venta.tipo_comprobante}_${venta.id_venta}.pdf`);
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
                <tr key={v.id_venta}>
                  <td>{v.id_venta}</td>
                  <td>
                    {clientes.find((c) => c.id === v.id_cliente)?.nombre ||
                      v.cliente}
                  </td>
                  <td>{v.tipo_comprobante}</td>
                  <td>{new Date(v.fecha).toLocaleString()}</td>
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
                      onClick={() => eliminarVenta(v.id_venta)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {editingSale && (
          <div className="modal">
            <div className="modal-content">
              <h2>✏️ Editar Venta</h2>
              <label>Cliente:</label>
              <select
                value={editingSale.id_cliente}
                onChange={(e) =>
                  setEditingSale({
                    ...editingSale,
                    id_cliente: Number(e.target.value),
                  })
                }
              >
                <option value="">Seleccionar Cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <label>Tipo de Comprobante:</label>
              <select
                value={editingSale.id_tipo_comprobante}
                onChange={(e) =>
                  setEditingSale({
                    ...editingSale,
                    id_tipo_comprobante: Number(e.target.value),
                  })
                }
              >
                <option value={1}>Boleta</option>
                <option value={2}>Factura</option>
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
