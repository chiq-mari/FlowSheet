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

  if (response.status === 403) {
    // La "aduana" central (Security, vía /toProcess) negó el permiso. Se avisa aquí,
    // en el único punto por el que pasa toda transacción, para que ninguna pantalla
    // tenga que acordarse de manejar este caso por su cuenta.
    window.alert(data.message || 'Usted no tiene permiso para acceder a este método.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Error al ejecutar la transacción.');
  }

  return data.data;
}

// Valida (sin ejecutar nada de negocio) si el perfil activo puede visualizar una
// opción de menú. Se usa al hacer clic en una opción del sidebar, como defensa
// adicional a la lista ya filtrada por permiso que devuelve /api/dashboard/options.
export async function verificarAccesoMenu(subSystem, menu) {
  const response = await fetch(`${API_URL}/toProcess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ targetType: 'menu', subSystem, menu }),
  });

  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Sesión expirada. Redirigiendo al login...');
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 403) {
    window.alert(data.message || 'Usted no tiene permiso para acceder a esta opción.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Error al validar el acceso al menú.');
  }

  return data;
}
