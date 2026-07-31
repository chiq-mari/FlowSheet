import { useState, useEffect } from 'react';
import { ejecutarMetodo } from '../services/toProcess';

// Catálogo de estados (Activo/Inactivo) para el <select> del formulario de Usuario.
// Vive en su propio hook para que ningún modal tenga que saber cómo se obtiene.
export function useEstadosUsuario() {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    ejecutarMetodo('Seguridad', 'Usuario', 'getEstados', {})
      .then((data) => {
        if (active) setEstados(data || []);
      })
      .catch((err) => console.error('Error al cargar estados de usuario:', err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { estados, loading };
}
