import { useState, useEffect } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_CARGO = 'Cargo';

// Catálogo de cargos para el <select> del formulario de Persona.
// Vive en su propio hook para que ningún modal tenga que saber cómo se obtiene.
export function useCargos() {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    ejecutarMetodo(SUB_SYSTEM, OBJECT_CARGO, 'getAll', {})
      .then((data) => {
        if (active) setCargos(data || []);
      })
      .catch((err) => console.error('Error al cargar cargos:', err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { cargos, loading };
}
