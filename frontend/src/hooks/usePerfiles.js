import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_PERFIL = 'Perfil';

// Datos de solo lectura para la pestaña "Ver Perfiles": el resumen (tarjetas con
// conteo por perfil) y la grilla de usuarios con sus perfiles asignados. Ambos se
// piden juntos porque siempre se muestran juntos en esa pestaña.
export function usePerfiles() {
  const [resumen, setResumen] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resumenData, usuariosData] = await Promise.all([
        ejecutarMetodo(SUB_SYSTEM, OBJECT_PERFIL, 'getResumen'),
        ejecutarMetodo(SUB_SYSTEM, OBJECT_PERFIL, 'getUsuarios'),
      ]);
      setResumen(resumenData || []);
      setUsuarios(usuariosData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodo();
  }, [fetchTodo]);

  return { resumen, usuarios, loading, error, refetch: fetchTodo };
}
