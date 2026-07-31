import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_METODO = 'Metodo';

// Encapsula el estado y las operaciones CRUD de Método, igual que useOpciones/useObjetos.
// Soporta dos filtros independientes (subsistema y objeto) además de la búsqueda por texto.
export function useMetodos() {
  const [metodos, setMetodos] = useState([]);
  const [search, setSearch] = useState('');
  const [subSystemFilter, setSubSystemFilter] = useState('');
  const [objectFilter, setObjectFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetodos = useCallback(async (term, subSystemId, objectId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_METODO, 'getAll', {
        search: term,
        subSystemId: subSystemId || null,
        objectId: objectId || null,
      });
      setMetodos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce: espera a que el usuario deje de escribir antes de volver a consultar
  useEffect(() => {
    const timer = setTimeout(() => fetchMetodos(search, subSystemFilter, objectFilter), 350);
    return () => clearTimeout(timer);
  }, [search, subSystemFilter, objectFilter, fetchMetodos]);

  const createMetodo = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_METODO, 'create', payload);
    await fetchMetodos(search, subSystemFilter, objectFilter);
  };

  const updateMetodo = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_METODO, 'update', payload);
    await fetchMetodos(search, subSystemFilter, objectFilter);
  };

  const deleteMetodos = async (methodIds) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_METODO, 'delete', { methodIds });
    await fetchMetodos(search, subSystemFilter, objectFilter);
  };

  return {
    metodos,
    search,
    setSearch,
    subSystemFilter,
    setSubSystemFilter,
    objectFilter,
    setObjectFilter,
    loading,
    error,
    createMetodo,
    updateMetodo,
    deleteMetodos,
  };
}
