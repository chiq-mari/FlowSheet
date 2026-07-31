// Contexto de auditoría: guarda el user_id de la sesión activa durante toda la
// vida de una petición /toProcess, sin tener que reenviarlo manualmente a través
// de cada clase de servicio. AsyncLocalStorage es el equivalente Node.js de un
// "thread-local": cada request tiene su propio store aislado, seguro bajo
// concurrencia (a diferencia de guardar el user_id en una variable global simple).
import { AsyncLocalStorage } from 'node:async_hooks';

const storage = new AsyncLocalStorage();

export function runWithUser(userId, callback) {
  return storage.run({ userId }, callback);
}

export function getCurrentUserId() {
  return storage.getStore()?.userId || null;
}
