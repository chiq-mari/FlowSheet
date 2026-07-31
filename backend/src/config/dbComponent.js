import pkg from 'pg';

import config from './config.json' with { type: 'json' };
//Diccionario de consultas SQL
import { sentences } from '../database/sentences.js';
import { getCurrentUserId } from '../utils/auditContext.js';

// Extraemos la herramienta "Pool" de la librería 'pg'
const { Pool } = pkg;

// Detecta, a partir del propio texto de la sentencia SQL, si es una mutación
// (INSERT/UPDATE/DELETE) y sobre qué tabla -- nunca sobre un SELECT. Cubre las
// dos formas usadas en sentences.js: con y sin prefijo "public.", y nombres
// entre comillas dobles (ej. "user", palabra reservada). Un SELECT jamás
// matchea, así que jamás se audita.
const MUTATION_PATTERN = /^(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+"?(?:public\.)?"?(\w+)"?/i;

function parseMutation(sql) {
  const match = sql.trim().match(MUTATION_PATTERN);
  if (!match) return null;

  const verb = match[1].toUpperCase();
  const action = verb.startsWith('INSERT') ? 'INSERT' : verb.startsWith('UPDATE') ? 'UPDATE' : 'DELETE';
  return { action, table: match[2] };
}

const GENERIC_DESCRIPTION = {
  INSERT: (table) => `Creación de registro en ${table}`,
  UPDATE: (table) => `Actualización de registro en ${table}`,
  DELETE: (table) => `Eliminación de registro en ${table}`,
};

export class DBComponent {
  constructor() {
    /**
     * Aquí instancia el Pool.
     * Le pasamos un objeto con las llaves que Postgres nos pide obligatoriamente.
     */
    this.pool = new Pool({
      user: config.database.user,
      password: config.database.password,
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      
      
      max: config.poolOptions.max, // Máximo de conexiones abiertas simultáneas
      ssl: config.poolOptions.ssl, // Seguridad SSL (en local se deja en false)
      idleTimeoutMillis: config.poolOptions.idleTimeoutMillis, // Tiempo para cerrar conexiones inactivas
      connectionTimeoutMillis: config.poolOptions.connectionTimeoutMillis, // Tiempo de espera antes de dar error si la BD cayó
      maxUses: config.poolOptions.maxUses // Cuántas veces reutilizar una conexión física antes de renovarla
    });

    // Un log rápido en consola solo para saber que el Pool se configuró bien al arrancar
    console.log('⚡ Pool de conexiones de PostgreSQL inicializado correctamente.');
  }

  /**
   * MÉTODO 1: getSentence
   * Busca en tu archivo sentences.js la query usando el módulo y su identificador.
   * @param {string} schema - El bloque principal (Ej: 'security')
   * @param {string} sentenceId - La query específica (Ej: 'getUser')
   * @return {string} SQL sentence as a string
   */
  getSentence(schema, sentenceId) {
    try {
      // Acceso dinamico
      // El ? devuelve undefined en caso de no existir
      const queryStr = sentences[schema]?.[sentenceId];
      
      if (!queryStr) {
        throw new Error(`La query '${sentenceId}' no existe dentro del esquema '${schema}'.`);
      }
      
      return queryStr;  //entrega el string
    } catch (error) {
      console.error(`Error en getSentence [${schema}][${sentenceId}]:`, error.message);
      throw error;
    }
  }

  /**
   * MÉTODO 2: exe (Ejecutor Universal)
   * Este método va al Pool, pide una conexión limpia, ejecuta el SQL y la devuelve.
   * @param {string} sql - La query cruda 'getSentence'
   * @param {Array} params - Los argumentos en los placeholders
   * @param {{description?: string, proyectId?: string, skip?: boolean}} [auditMeta] -
   *   Metadatos opcionales para la fila de auditoría (ver logMutationIfNeeded). Si se
   *   omite, toda mutación real igual queda auditada con una descripción genérica.
   *   `skip: true` la excluye por completo (ej. la cascada de borrado de un proyecto:
   *   una vez borrado, ese historial ya no es alcanzable desde la pantalla de
   *   Auditoría, que solo busca por proyectos existentes).
   */
  async exeQuery(sql, params = [], auditMeta = null) { //params esta por defecto
    let cnn; // Aquí guardaremos la conexión que nos preste el pool

    try {
      // 1. Le pedimos una conexión activa al Pool
      cnn = await this.pool.connect();

      // 2. Ejecutamos la consulta pasándole los parámetros
      const result = await cnn.query(sql, params);

      // 3. Si esto fue una mutación real (nunca un SELECT), se audita sola.
      await this.logMutationIfNeeded(cnn, sql, auditMeta);

      // result.rows contiene un array con los registros que devolvió la base de datos (los objetos JSON de las filas)
      return result.rows;

    } catch (error) {
      console.error('Error ejecutando consulta en la base de datos:', error.message);
      throw error; // Re-lanzamos el error para que el servicio (session.js) sepa que algo falló

    } finally {
      // Finalmente libera la conexion y la manda directo al pool
      if (cnn) {
        cnn.release();
      }
    }
  }

  /**
   * Inserta la fila de auditoría cuando corresponde. Usa la MISMA conexión ya
   * abierta por exeQuery (no reentra a exeQuery -- evitaría un loop infinito
   * al auditar su propio INSERT). Nunca deja que un fallo de auditoría rompa
   * la operación de negocio real: solo se loguea el error y se sigue.
   */
  async logMutationIfNeeded(cnn, sql, auditMeta) {
    if (auditMeta?.skip) return; // el propio llamador pidió explícitamente no auditar esto

    const mutation = parseMutation(sql);
    if (!mutation) return; // no es INSERT/UPDATE/DELETE (ej. un SELECT) -> nada que auditar

    const userId = getCurrentUserId();
    if (!userId) return; // sin usuario en contexto (ej. arranque del servidor) -> no se puede atribuir

    const { action, table } = mutation;
    const description = auditMeta?.description || GENERIC_DESCRIPTION[action](table);
    const proyectId = auditMeta?.proyectId ?? null;

    try {
      const insertSql = sentences.audit.insertLog;
      await cnn.query(insertSql, [userId, action, table, description, proyectId]);
    } catch (error) {
      console.error('Error registrando auditoría (no afecta la operación original):', error.message);
    }
  }
}