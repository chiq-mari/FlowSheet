import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_PERSONA = 'Persona';

// Encapsula el estado y las operaciones CRUD de Persona para que
// MantenimientoPersonas.jsx no tenga que saber cómo se piden/mutan los datos.
export function usePersonas() {
  const [personas, setPersonas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPersonas = useCallback(async (term) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERSONA, 'getAll', { search: term });
      setPersonas(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce: espera a que el usuario deje de escribir antes de volver a consultar
  useEffect(() => {
    const timer = setTimeout(() => fetchPersonas(search), 350);
    return () => clearTimeout(timer);
  }, [search, fetchPersonas]);

  const createPersona = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERSONA, 'create', payload);
    await fetchPersonas(search);
  };

  const updatePersona = async (payload) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERSONA, 'update', payload);
    await fetchPersonas(search);
  };

  const deletePersonas = async (personIds) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERSONA, 'delete', { personIds });
    await fetchPersonas(search);
  };

  return {
    personas,
    search,
    setSearch,
    loading,
    error,
    createPersona,
    updatePersona,
    deletePersonas,
  };
}
