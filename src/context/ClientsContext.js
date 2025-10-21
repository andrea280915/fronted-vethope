import React, { createContext, useContext, useState } from "react";

// Datos iniciales (podrían venir luego del backend o de RegisterClientPage)
const initialClients = [
  { id: 1, nombre: "Andrea", apellido: "García", dni: "12345678", telefono: "987654321", direccion: "Av. Los Olivos 101", email: "andrea.g@mail.com" },
  { id: 2, nombre: "Carlos", apellido: "Mendoza", dni: "87654321", telefono: "998877665", direccion: "Calle El Sol 45", email: "carlos.m@mail.com" },
  { id: 3, nombre: "Luisa", apellido: "Paredes", dni: "11223344", telefono: "945612378", direccion: "Jr. La Luna 203", email: "luisa.p@mail.com" },
];

const ClientsContext = createContext();

export const useClients = () => useContext(ClientsContext);

export const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState(initialClients);

  const addClient = (nuevo) => setClients((prev) => [...prev, nuevo]);
  const updateClient = (actualizado) =>
    setClients((prev) =>
      prev.map((c) => (c.id === actualizado.id ? actualizado : c))
    );
  const deleteClient = (id) =>
    setClients((prev) => prev.filter((c) => c.id !== id));

  return (
    <ClientsContext.Provider
      value={{ clients, addClient, updateClient, deleteClient }}
    >
      {children}
    </ClientsContext.Provider>
  );
};
