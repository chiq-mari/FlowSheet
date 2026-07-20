import pkg from 'pg';

import config from './config.json' with { type: 'json' };
//Diccionario de consultas SQL
import { sentences } from '../database/sentences.js';

// Extraemos la herramienta "Pool" de la librería 'pg'
const { Pool } = pkg;

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
   */
  async exeQuery(sql, params = []) { //params esta por defecto
    let cnn; // Aquí guardaremos la conexión que nos preste el pool
    
    try {
      // 1. Le pedimos una conexión activa al Pool 
      cnn = await this.pool.connect();
      
      // 2. Ejecutamos la consulta pasándole los parámetros
      const result = await cnn.query(sql, params);
      
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
}