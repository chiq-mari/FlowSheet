import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_CARGO = 'Cargo';

// Encapsula el estado y las operaciones CRUD de Cargo. Lo usa tanto
// MantenimientoCargos.jsx (lista completa + crear/editar/eliminar) como
// PersonaFormFields.jsx (que solo lee `cargos`/`loading` para su <select>,
// igual que SeleccionarPersonaModal reusa usePersonas solo para su lista).
export function useCargos() {
  const [cargos, setCargos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCargos = useCallback(async (term) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_CARGO, 'getAll', { search: term });
      setCargos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce: espera a que el usuario deje de escribir antes de volver a consultar
  useEffect(() => {
    const timer = setTimeout(() => fetchCargos(search), 350);
    return () => clearTimeout(timer);
  }, [search, fetchCargos]);

  const createCargo = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_CARGO, 'create', payload);
    await fetchCargos(search);
  };

  const updateCargo = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_CARGO, 'update', payload);
    await fetchCargos(search);
  };

  const deleteCargos = async (chargeIds) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_CARGO, 'delete', { chargeIds });
    await fetchCargos(search);
  };

  return {
    cargos,
    search,
    setSearch,
    loading,
    error,
    createCargo,
    updateCargo,
    deleteCargos,
  };
}
