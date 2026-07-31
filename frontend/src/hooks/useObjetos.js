import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_OBJETO = 'Objeto';

// Encapsula el estado y las operaciones CRUD de Objeto, igual que useOpciones.
// Además del término de búsqueda, soporta un filtro por subsistema (dropdown del mockup).
export function useObjetos() {
  const [objetos, setObjetos] = useState([]);
  const [search, setSearch] = useState('');
  const [subSystemFilter, setSubSystemFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchObjetos = useCallback(async (term, subSystemId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_OBJETO, 'getAll', {
        search: term,
        subSystemId: subSystemId || null,
      });
      setObjetos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce: espera a que el usuario deje de escribir antes de volver a consultar
  useEffect(() => {
    const timer = setTimeout(() => fetchObjetos(search, subSystemFilter), 350);
    return () => clearTimeout(timer);
  }, [search, subSystemFilter, fetchObjetos]);

  const createObjeto = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_OBJETO, 'create', payload);
    await fetchObjetos(search, subSystemFilter);
  };

  const updateObjeto = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_OBJETO, 'update', payload);
    await fetchObjetos(search, subSystemFilter);
  };

  const deleteObjetos = async (objectIds) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_OBJETO, 'delete', { objectIds });
    await fetchObjetos(search, subSystemFilter);
  };

  return {
    objetos,
    search,
    setSearch,
    subSystemFilter,
    setSubSystemFilter,
    loading,
    error,
    createObjeto,
    updateObjeto,
    deleteObjetos,
  };
}
