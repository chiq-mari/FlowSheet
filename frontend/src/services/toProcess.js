// Cliente genérico del endpoint único de transacciones protegidas por permisos (POST /toProcess).
// Cualquier feature nueva que necesite ejecutar un método de negocio en el backend
// debe apoyarse en esta función en vez de hacer fetch directo, para no repetir
// la forma del payload ni el manejo de errores en cada componente.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function ejecutarMetodo(subSystem, object, method, executionParams = {}) {
  const response = await fetch(`${API_URL}/toProcess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ targetType: 'method', subSystem, object, method, executionParams }),
  });

  if (response.status === 401) {
    // La sesión expiró (o nunca existió): no tiene sentido seguir mostrando el dashboard
    // con datos de una sesión muerta. Recarga dura al login, que limpia todo el estado
    // de React de un solo golpe (header, sidebar, lo que sea que haya quedado cargado).
    window.location.href = '/login';
    throw new Error('Sesión expirada. Redirigiendo al login...');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Error al ejecutar la transacción.');
  }

  return data.data;
}
