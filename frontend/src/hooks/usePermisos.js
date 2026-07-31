import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_PERMISO = 'Permiso';

// Encapsula todo el estado de Mantenimiento de Permisos: el resumen (siempre
// visible, cuenta ambos tipos) y la grilla de la pestaña activa ('opciones' |
// 'metodos'), filtrada opcionalmente por perfil. Un solo hook en vez de dos
// separados porque las mutaciones de cualquiera de las dos pestañas cambian
// los conteos del resumen — así el refetch queda centralizado en un solo lugar.
export function usePermisos() {
  const [tab, setTab] = useState('opciones'); // 'opciones' | 'metodos'
  const [profileFilter, setProfileFilter] = useState('');
  const [resumen, setResumen] = useState([]);
  const [grid, setGrid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResumen = useCallback(async () => {
    const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERMISO, 'getResumen');
    setResumen(data || []);
  }, []);

  const fetchGrid = useCallback(async (currentTab, profileId) => {
    setLoading(true);
    setError(null);
    try {
      const method = currentTab === 'opciones' ? 'getOpciones' : 'getMetodos';
      const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERMISO, method, { profileId: profileId || null });
      setGrid(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumen();
  }, [fetchResumen]);

  useEffect(() => {
    fetchGrid(tab, profileFilter);
  }, [tab, profileFilter, fetchGrid]);

  const refetchAll = useCallback(async () => {
    await Promise.all([fetchResumen(), fetchGrid(tab, profileFilter)]);
  }, [fetchResumen, fetchGrid, tab, profileFilter]);

  const asignarOpcion = async (profileId, optionId) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERMISO, 'asignarOpcion', { profileId, optionId });
    await refetchAll();
  };

  const quitarOpciones = async (permissionOptionIds) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERMISO, 'quitarOpciones', { permissionOptionIds });
    await refetchAll();
  };

  const asignarMetodo = async (profileId, methodId) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERMISO, 'asignarMetodo', { profileId, methodId });
    await refetchAll();
  };

  const quitarMetodos = async (permissionMethodIds) => {
    await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERMISO, 'quitarMetodos', { permissionMethodIds });
    await refetchAll();
  };

  return {
    tab,
    setTab,
    profileFilter,
    setProfileFilter,
    resumen,
    grid,
    loading,
    error,
    asignarOpcion,
    quitarOpciones,
    asignarMetodo,
    quitarMetodos,
  };
}
