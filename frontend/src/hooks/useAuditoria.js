import { useState, useEffect, useCallback } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_AUDITORIA = 'Auditoria';
const MAX_RANGE_DAYS = 31;

// Encapsula el estado de Mantenimiento de Auditoría. Hay dos formas de elegir
// qué ver: un proyecto puntual (buscador dinámico) o "Acciones Generales"
// (las del Administrador -- Permisos, Personas, Cargos... -- que no
// pertenecen a ningún proyecto). Ninguna de las dos está seleccionada al
// entrar, igual que el estado vacío del mockup.
export function useAuditoria() {
  const [proyecto, setProyectoState] = useState(null);
  const [modoGlobal, setModoGlobalState] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Elegir un proyecto y ver acciones generales son mutuamente excluyentes.
  const setProyecto = (nuevoProyecto) => {
    setModoGlobalState(false);
    setProyectoState(nuevoProyecto);
  };

  const verAccionesGenerales = () => {
    setProyectoState(null);
    setModoGlobalState(true);
  };

  const rangoInvalido = Boolean(
    fechaInicio && fechaFin &&
    (new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24) > MAX_RANGE_DAYS
  );

  const fetchRegistros = useCallback(async (proyectoActual, global_, inicio, fin) => {
    if (!proyectoActual && !global_) {
      setRegistros([]);
      return;
    }
    if (inicio && fin && (new Date(fin) - new Date(inicio)) / (1000 * 60 * 60 * 24) > MAX_RANGE_DAYS) {
      setError('El rango de fechas no puede superar un mes.');
      setRegistros([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await ejecutarMetodo(SUB_SYSTEM, OBJECT_AUDITORIA, 'getAll', {
        scope: global_ ? 'global' : 'proyecto',
        proyectId: proyectoActual?.id || null,
        fechaInicio: inicio || null,
        fechaFin: fin || null,
      });
      setRegistros(data || []);
    } catch (err) {
      setError(err.message);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistros(proyecto, modoGlobal, fechaInicio, fechaFin);
  }, [proyecto, modoGlobal, fechaInicio, fechaFin, fetchRegistros]);

  return {
    proyecto,
    setProyecto,
    modoGlobal,
    verAccionesGenerales,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    rangoInvalido,
    registros,
    loading,
    error,
  };
}
