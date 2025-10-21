// src/pages/StockPage.js
import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import './StockPage.css';

// Datos de ejemplo iniciales
const initialStockData = [
    { id: 1, nombre: 'Alimento Premium Adulto', descripcion: 'Saco de 15kg para perros mayores de 1 año.', precio: 35.50, stock: 150 },
    { id: 2, nombre: 'Vacuna Puppyguard', descripcion: 'Vacuna polivalente para cachorros. Uso veterinario.', precio: 120.00, stock: 45 },
    { id: 3, nombre: 'Collar Antipulgas L', descripcion: 'Collar de larga duración (8 meses) para perros grandes.', precio: 65.90, stock: 80 },
];

const StockPage = () => {
    const [stock, setStock] = useState(initialStockData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Estado para manejar los datos del formulario (Crear o Editar)
    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
    });

    // --- MANEJO DEL FORMULARIO Y MODAL ---
    
    const openCreateModal = () => {
        setIsEditing(false);
        setFormData({ id: null, nombre: '', descripcion: '', precio: '', stock: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setIsEditing(true);
        // Carga los datos del item seleccionado en el formulario
        setFormData(item); 
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'precio' || name === 'stock' ? Number(value) : value 
        }));
    };
    
    // --- FUNCIONES CRUD ---

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            // Lógica de ACTUALIZAR
            setStock(stock.map(item => 
                item.id === formData.id ? formData : item
            ));
        } else {
            // Lógica de CREAR
            const newId = stock.length > 0 ? Math.max(...stock.map(p => p.id)) + 1 : 1;
            const nuevoProducto = { ...formData, id: newId };
            setStock([...stock, nuevoProducto]);
        }
        closeModal();
    };

    const eliminarProducto = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            setStock(stock.filter(item => item.id !== id));
        }
    };
    
    // --- COMPONENTE MODAL ---

    const Modal = ({ isOpen, title, onClose, children }) => {
        if (!isOpen) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                    {children}
                </div>
            </div>
        );
    };


    return (
        <AdminLayout>
            <div className="page-header">
                <h1>ADMINISTRACIÓN DE <span>STOCK</span></h1>
                <p className="subtitle">Inventario de Productos y Medicamentos</p>
            </div>

            <div className="stock-controls">
                <input 
                    type="text" 
                    placeholder="Buscar producto..." 
                    className="search-input"
                />
                <button className="btn-add-stock" onClick={openCreateModal}>
                    + Agregar Nuevo Producto
                </button>
            </div>

            <div className="stock-table-container">
                <table className="vet-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th className="stock-count">Stock</th>
                            <th>Precio (S/)</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stock.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.nombre}</td>
                                <td>{item.descripcion}</td>
                                <td className={`stock-count ${item.stock < 50 ? 'low-stock' : ''}`}>{item.stock}</td>
                                <td>S/ {item.precio.toFixed(2)}</td>
                                <td>
                                    <button 
                                        className="btn-action edit" 
                                        onClick={() => openEditModal(item)}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        className="btn-action delete" 
                                        onClick={() => eliminarProducto(item.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL DE CREACIÓN/EDICIÓN --- */}
            <Modal 
                isOpen={isModalOpen} 
                title={isEditing ? "Editar Producto" : "Registrar Nuevo Producto"} 
                onClose={closeModal}
            >
                <form className="stock-form" onSubmit={handleSubmit}>
                    <label>Nombre:</label>
                    <input 
                        type="text" 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        required 
                    />
                    
                    <label>Descripción:</label>
                    <textarea 
                        name="descripcion" 
                        value={formData.descripcion} 
                        onChange={handleChange} 
                        required 
                    />

                    <div className="form-row">
                        <div>
                            <label>Precio (S/):</label>
                            <input 
                                type="number" 
                                name="precio" 
                                value={formData.precio} 
                                onChange={handleChange} 
                                min="0.01"
                                step="0.01"
                                required 
                            />
                        </div>
                        <div>
                            <label>Stock:</label>
                            <input 
                                type="number" 
                                name="stock" 
                                value={formData.stock} 
                                onChange={handleChange} 
                                min="0"
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-submit-modal">
                        {isEditing ? "Guardar Cambios" : "Registrar Producto"}
                    </button>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default StockPage;