import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_USUARIO = 'Usuario';

// Encapsula el estado y las operaciones CRUD de Usuario para que
// MantenimientoUsuarios.jsx no tenga que saber cómo se piden/mutan los datos.
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = useCallback(async (term) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_USUARIO, 'getAll', { search: term });
      setUsuarios(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce: espera a que el usuario deje de escribir antes de volver a consultar
  useEffect(() => {
    const timer = setTimeout(() => fetchUsuarios(search), 350);
    return () => clearTimeout(timer);
  }, [search, fetchUsuarios]);

  const createUsuario = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_USUARIO, 'create', payload);
    await fetchUsuarios(search);
  };

  const updateUsuario = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_USUARIO, 'update', payload);
    await fetchUsuarios(search);
  };

  const deleteUsuarios = async (userIds) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_USUARIO, 'delete', { userIds });
    await fetchUsuarios(search);
  };

  return {
    usuarios,
    search,
    setSearch,
    loading,
    error,
    createUsuario,
    updateUsuario,
    deleteUsuarios,
  };
}
