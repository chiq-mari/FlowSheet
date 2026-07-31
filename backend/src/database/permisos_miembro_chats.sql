-- ============================================================================
-- Permisos del Módulo de Negocio (Hojas de Tiempo) - Chat por Proyecto
-- ------------------------------------------------------------------------
-- Objeto:   Chats
-- Métodos:  consultarChats | consultarMensajes | enviarMensaje
-- Perfil autorizado: Miembro
--
-- ⚠️ REQUISITO PREVIO: correr primero migracion_chat_message.sql (crea la
-- tabla chat_message). Este script solo da de alta objeto/método/permiso,
-- no toca esquema.
--
-- Idempotente (WHERE NOT EXISTS, no ON CONFLICT): se puede correr varias
-- veces sin duplicar filas.
-- ============================================================================

DO $$
DECLARE
    v_sub_system_id      uuid;
    v_object_id          uuid;
    v_profile_miembro_id uuid;
BEGIN
    SELECT sub_system_id INTO v_sub_system_id
    FROM sub_system
    WHERE sub_system_de = 'Hojas de Tiempo';

    IF v_sub_system_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el sub_system "Hojas de Tiempo". Verifica el seed base.';
    END IF;

    -- Objeto "Chats" (se crea solo si no existe)
    SELECT object_id INTO v_object_id
    FROM object
    WHERE object_de = 'Chats' AND sub_system_id = v_sub_system_id;

    IF v_object_id IS NULL THEN
        INSERT INTO object (object_de, sub_system_id)
        VALUES ('Chats', v_sub_system_id)
        RETURNING object_id INTO v_object_id;
    END IF;

    -- Métodos del objeto "Chats"
    INSERT INTO method (method_de, object_id)
    SELECT v.method_de, v_object_id
    FROM (VALUES ('consultarChats'), ('consultarMensajes'), ('enviarMensaje')) AS v(method_de)
    WHERE NOT EXISTS (
        SELECT 1 FROM method m WHERE m.method_de = v.method_de AND m.object_id = v_object_id
    );

    SELECT profile_id INTO v_profile_miembro_id
    FROM profile
    WHERE profile_de = 'Miembro';

    IF v_profile_miembro_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el profile "Miembro". Verifica el seed base.';
    END IF;

    INSERT INTO permission_method (profile_id, method_id)
    SELECT v_profile_miembro_id, m.method_id
    FROM method m
    WHERE m.object_id = v_object_id
      AND NOT EXISTS (
          SELECT 1 FROM permission_method pm
          WHERE pm.profile_id = v_profile_miembro_id AND pm.method_id = m.method_id
      );

    RAISE NOTICE 'Permisos del módulo Chats (Miembro) aplicados correctamente.';
END $$;
