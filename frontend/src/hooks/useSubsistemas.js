import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_SUBSISTEMA = 'Subsistema';

// Encapsula el estado y las operaciones CRUD de Subsistema, igual que useCargos.
export function useSubsistemas() {
  const [subsistemas, setSubsistemas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubsistemas = useCallback(async (term) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_SUBSISTEMA, 'getAll', { search: term });
      setSubsistemas(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce: espera a que el usuario deje de escribir antes de volver a consultar
  useEffect(() => {
    const timer = setTimeout(() => fetchSubsistemas(search), 350);
    return () => clearTimeout(timer);
  }, [search, fetchSubsistemas]);

  const createSubsistema = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_SUBSISTEMA, 'create', payload);
    await fetchSubsistemas(search);
  };

  const updateSubsistema = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_SUBSISTEMA, 'update', payload);
    await fetchSubsistemas(search);
  };

  const deleteSubsistemas = async (subSystemIds) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_SUBSISTEMA, 'delete', { subSystemIds });
    await fetchSubsistemas(search);
  };

  return {
    subsistemas,
    search,
    setSearch,
    loading,
    error,
    createSubsistema,
    updateSubsistema,
    deleteSubsistemas,
  };
}
