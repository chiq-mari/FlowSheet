import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_OPCION = 'Opcion';

// Encapsula el estado y las operaciones CRUD de Opción, igual que useCargos/useSubsistemas.
// Además del término de búsqueda, soporta un filtro por subsistema (dropdown del mockup).
export function useOpciones() {
  const [opciones, setOpciones] = useState([]);
  const [search, setSearch] = useState('');
  const [subSystemFilter, setSubSystemFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOpciones = useCallback(async (term, subSystemId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_OPCION, 'getAll', {
        search: term,
        subSystemId: subSystemId || null,
      });
      setOpciones(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce: espera a que el usuario deje de escribir antes de volver a consultar
  useEffect(() => {
    const timer = setTimeout(() => fetchOpciones(search, subSystemFilter), 350);
    return () => clearTimeout(timer);
  }, [search, subSystemFilter, fetchOpciones]);

  const createOpcion = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_OPCION, 'create', payload);
    await fetchOpciones(search, subSystemFilter);
  };

  const updateOpcion = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_OPCION, 'update', payload);
    await fetchOpciones(search, subSystemFilter);
  };

  const deleteOpciones = async (optionIds) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_OPCION, 'delete', { optionIds });
    await fetchOpciones(search, subSystemFilter);
  };

  return {
    opciones,
    search,
    setSearch,
    subSystemFilter,
    setSubSystemFilter,
    loading,
    error,
    createOpcion,
    updateOpcion,
    deleteOpciones,
  };
}
