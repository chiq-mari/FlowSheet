import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_PERFIL = 'Perfil';

// Estado de la pestaña "Asignar" para el usuario actualmente elegido en el buscador:
// qué perfiles tiene, y las acciones para agregarle/quitarle uno. userId puede ser
// null (ningún usuario elegido todavía), en cuyo caso queda inactivo.
export function useAsignacionPerfil(userId) {
  const [perfilesAsignados, setPerfilesAsignados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPerfiles = useCallback(async () => {
    if (!userId) {
      setPerfilesAsignados([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERFIL, 'getPerfilesPorUsuario', { userId });
      setPerfilesAsignados(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPerfiles();
  }, [fetchPerfiles]);

  const asignarPerfil = async (profileId) => {
    setError(null);
    try {
      await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERFIL, 'asignarPerfil', { userId, profileId });
      await fetchPerfiles();
    } catch (err) {
      setError(err.message);
    }
  };

  const quitarPerfil = async (profileId) => {
    setError(null);
    try {
      await ejecutarMetodo(SUB_SYSTEM, OBJECT_PERFIL, 'quitarPerfil', { userId, profileId });
      await fetchPerfiles();
    } catch (err) {
      setError(err.message);
    }
  };

  return { perfilesAsignados, loading, error, asignarPerfil, quitarPerfil };
}
