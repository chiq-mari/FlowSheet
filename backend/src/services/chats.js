// backend/src/services/chats.js

/**
 * Componente de negocio del Módulo Miembro: Chat por Proyecto ("Mis Chats").
 * Se invoca exclusivamente por reflexión desde POST /toProcess (resolución
 * dinámica por convención de nombre: object_de "Chats" -> import('./chats.js')),
 * después de que la aduana central (Security.getPermissionMethod) valida
 * permission_method.
 *
 * sub_system: "Hojas de Tiempo"
 * object:     "Chats"
 * methods:    consultarChats | consultarMensajes | enviarMensaje
 *
 * La membresía de cada chat se deriva de proyect_role_user: cualquier persona
 * con un rol en ese proyecto puede leer y escribir en su chat.
 */
class Chats {
    /**
     * Lista de chats (uno por proyecto) del usuario autenticado, con último mensaje.
     */
    async consultarChats(executionParams, userData) {
        const sql = global.global_db.getSentence('business', 'getMemberChats');
        const rows = await global.global_db.exeQuery(sql, [userData.user_id]);
        return { chats: rows };
    }

    /**
     * Historial de mensajes + miembros de un proyecto (verifica membresía primero).
     */
    async consultarMensajes(executionParams, userData) {
        const { proyect_id } = executionParams;

        if (!proyect_id) {
            throw new Error('Falta el proyecto para consultar el chat.');
        }

        await this.#verificarMembresia(proyect_id, userData.user_id);

        const messagesSql = global.global_db.getSentence('business', 'getChatMessages');
        const membersSql = global.global_db.getSentence('business', 'getProyectMembers');

        const [messages, members] = await Promise.all([
            global.global_db.exeQuery(messagesSql, [proyect_id]),
            global.global_db.exeQuery(membersSql, [proyect_id]),
        ]);

        return { messages, members };
    }

    /**
     * Envía un mensaje nuevo al chat de un proyecto (verifica membresía primero).
     */
    async enviarMensaje(executionParams, userData) {
        const { proyect_id, message_text } = executionParams;

        if (!proyect_id || !message_text || !message_text.trim()) {
            throw new Error('Falta el proyecto o el texto del mensaje.');
        }

        await this.#verificarMembresia(proyect_id, userData.user_id);

        const insertSql = global.global_db.getSentence('business', 'insertChatMessage');
        const inserted = await global.global_db.exeQuery(insertSql, [
            proyect_id,
            userData.user_id,
            message_text.trim(),
        ]);

        return { message: inserted[0] };
    }

    /**
     * Verifica que el usuario pertenezca al proyecto (cualquier rol) antes de leer/escribir.
     * Protege contra IDOR: un miembro no puede leer/escribir chats de proyectos ajenos.
     */
    async #verificarMembresia(proyectId, userId) {
        const sql = global.global_db.getSentence('business', 'checkProyectMembership');
        const rows = await global.global_db.exeQuery(sql, [proyectId, userId]);

        if (rows.length === 0) {
            throw new Error('No perteneces a este proyecto.');
        }
    }
}

export default Chats;
