// src/services/toProcess.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Invoca un método de negocio a través de /toProcess, el motor de reflexión que ya usa
 * el resto del sistema (autoriza contra permission_method y ejecuta por reflexión).
 * Cualquier módulo (Miembro, Líder, Admin) puede reutilizar este helper.
 *
 * @param {string} subSystem - Nombre del sub-sistema (ej. 'Hojas de Tiempo')
 * @param {string} object - Nombre del objeto/componente registrado en Security (ej. 'Actividades')
 * @param {string} method - Nombre del método a ejecutar (ej. 'consultarAsignaciones')
 * @param {object} executionParams - Parámetros que recibirá el método en el backend
 * @returns {Promise<any>} El campo `data` de la respuesta exitosa
 * @throws {Error} Si la transacción es denegada o falla (error.status trae el código HTTP)
 */
export async function callMethod(subSystem, object, method, executionParams = {}) {
  const response = await fetch(`${API_URL}/toProcess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ targetType: 'method', subSystem, object, method, executionParams }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.status !== 'Éxito') {
    const error = new Error(payload.message || 'Error al ejecutar la transacción.');
    error.status = response.status;
    throw error;
  }

  return payload.data;
}
