import React, { createContext, useContext, useState, useMemo } from 'react';

// 1. Creación del Contexto
const CartContext = createContext();

// 2. Hook personalizado para usar el contexto fácilmente
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        // Muestra un error si useCart se llama fuera de CartProvider
        console.error("useCart debe ser usado dentro de un CartProvider");
        return { 
            cart: [], 
            totalItems: 0, 
            totalPrice: 0, 
            addToCart: () => console.error("CartProvider no encontrado"),
            removeFromCart: () => console.error("CartProvider no encontrado"),
            updateQuantity: () => console.error("CartProvider no encontrado"),
            clearCart: () => console.error("CartProvider no encontrado"),
        };
    }
    return context;
};

// 3. Componente Proveedor
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Cálculo del total de artículos y precio total
    const totalItems = useMemo(() => 
        cart.reduce((total, item) => total + item.quantity, 0), 
        [cart]
    );

    const totalPrice = useMemo(() => 
        cart.reduce((total, item) => total + (item.price * item.quantity), 0), 
        [cart]
    );

    // Función para agregar o incrementar cantidad de un producto
    const addToCart = (productToAdd) => {
        setCart(prevCart => {
            // Revisa si el producto ya existe en el carrito
            const existingItemIndex = prevCart.findIndex(item => item.id === productToAdd.id);

            if (existingItemIndex > -1) {
                // Si existe, incrementa la cantidad
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + 1,
                };
                return newCart;
            } else {
                // Si no existe, añade el nuevo producto con cantidad 1
                return [...prevCart, { ...productToAdd, quantity: 1 }];
            }
        });
    };

    // Función para remover completamente un producto del carrito
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    // Función para actualizar la cantidad de un producto
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart => {
            const newCart = [...prevCart];
            const itemIndex = newCart.findIndex(item => item.id === productId);

            if (itemIndex > -1) {
                newCart[itemIndex] = {
                    ...newCart[itemIndex],
                    quantity: newQuantity,
                };
            }
            return newCart;
        });
    };

    // Función para vaciar completamente el carrito
    const clearCart = () => {
        setCart([]);
    };

    // Objeto de valor proporcionado por el contexto
    const contextValue = {
        cart,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

