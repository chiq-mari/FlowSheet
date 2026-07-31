-- ============================================================================
-- Permisos del Perfil Líder — Proyecto, Actividades (extensión), Roles, Equipos
-- ------------------------------------------------------------------------
-- Basado en el documento del equipo (ProyectoWeb2-queries_definitivo.pdf).
-- Corrección aplicada: se reemplazó ON CONFLICT DO NOTHING por WHERE NOT EXISTS
-- en TODAS las inserciones a `method` (no solo a `permission_method`), porque
-- ni `method` ni `permission_method` tienen una constraint UNIQUE real — ya lo
-- confirmamos antes: sin esa constraint, ON CONFLICT no evita duplicados.
--
-- ⚠️ Todavía NO existe código real (services/*.js) para:
--    - object "Proyecto"   (faltaría backend/src/services/proyecto.js)
--    - object "Roles"      (faltaría backend/src/services/roles.js)
--    - object "Equipos"    (faltaría backend/src/services/equipos.js)
--    - los 7 métodos nuevos de "Actividades" para Líder (faltaría agregarlos
--      DENTRO de backend/src/services/actividades.js, el mismo archivo del
--      Miembro — un object_de = un solo archivo, no se puede duplicar)
-- Este script solo da de alta el ESQUEMA DE PERMISOS. Sin el código, cualquier
-- intento de ejecutar estos métodos va a fallar con "no existe físicamente
-- en el componente [...]" — eso es esperado hasta que se escriba ese código.
--
-- Idempotente: se puede correr las veces que sea sin duplicar filas.
-- ============================================================================

DO $$
DECLARE
    v_sub_system_id      uuid;
    v_proyecto_obj_id    uuid;
    v_actividades_obj_id uuid;
    v_roles_obj_id       uuid;
    v_equipos_obj_id     uuid;
    v_leader_profile_id  uuid;
BEGIN
    SELECT sub_system_id INTO v_sub_system_id
    FROM sub_system WHERE sub_system_de = 'Hojas de Tiempo';

    IF v_sub_system_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el sub_system "Hojas de Tiempo".';
    END IF;

    SELECT profile_id INTO v_leader_profile_id
    FROM profile WHERE profile_de ILIKE '%lider%' OR profile_de ILIKE '%líder%'
    LIMIT 1;

    IF v_leader_profile_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró ningún perfil de Líder.';
    END IF;

    -- ============================================================
    -- 1. Objeto "Proyecto" (pestaña "Mis Proyectos" del Líder)
    -- ============================================================
    SELECT object_id INTO v_proyecto_obj_id
    FROM object WHERE object_de = 'Proyecto' AND sub_system_id = v_sub_system_id;

    IF v_proyecto_obj_id IS NULL THEN
        INSERT INTO object (object_de, sub_system_id)
        VALUES ('Proyecto', v_sub_system_id)
        RETURNING object_id INTO v_proyecto_obj_id;
    END IF;

    INSERT INTO method (method_de, object_id)
    SELECT v.method_de, v_proyecto_obj_id
    FROM (VALUES ('getAllForLeader'), ('insertProyect'), ('updateProyect'), ('deleteProyect')) AS v(method_de)
    WHERE NOT EXISTS (
        SELECT 1 FROM method m WHERE m.method_de = v.method_de AND m.object_id = v_proyecto_obj_id
    );

    INSERT INTO permission_method (profile_id, method_id)
    SELECT v_leader_profile_id, m.method_id
    FROM method m
    WHERE m.object_id = v_proyecto_obj_id
      AND NOT EXISTS (
          SELECT 1 FROM permission_method pm
          WHERE pm.profile_id = v_leader_profile_id AND pm.method_id = m.method_id
      );

    -- ============================================================
    -- 2. Objeto "Actividades" — EXTENSIÓN con métodos de Líder
    --    (el object ya existe, lo dio de alta el módulo Miembro)
    -- ============================================================
    SELECT object_id INTO v_actividades_obj_id
    FROM object WHERE object_de = 'Actividades' AND sub_system_id = v_sub_system_id;

    IF v_actividades_obj_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el object "Actividades" — se esperaba que ya existiera (módulo Miembro).';
    END IF;

    INSERT INTO method (method_de, object_id)
    SELECT v.method_de, v_actividades_obj_id
    FROM (VALUES
        ('getAllForProject'), ('insertActivity'), ('updateActivity'), ('deleteActivities'),
        ('getTeamMembers'), ('assignMember'), ('unassignMember')
    ) AS v(method_de)
    WHERE NOT EXISTS (
        SELECT 1 FROM method m WHERE m.method_de = v.method_de AND m.object_id = v_actividades_obj_id
    );

    INSERT INTO permission_method (profile_id, method_id)
    SELECT v_leader_profile_id, m.method_id
    FROM method m
    WHERE m.object_id = v_actividades_obj_id
      AND m.method_de IN (
          'getAllForProject', 'insertActivity', 'updateActivity', 'deleteActivities',
          'getTeamMembers', 'assignMember', 'unassignMember'
      )
      AND NOT EXISTS (
          SELECT 1 FROM permission_method pm
          WHERE pm.profile_id = v_leader_profile_id AND pm.method_id = m.method_id
      );

    -- ============================================================
    -- 3. Objeto "Roles"
    -- ============================================================
    SELECT object_id INTO v_roles_obj_id
    FROM object WHERE object_de = 'Roles' AND sub_system_id = v_sub_system_id;

    IF v_roles_obj_id IS NULL THEN
        INSERT INTO object (object_de, sub_system_id)
        VALUES ('Roles', v_sub_system_id)
        RETURNING object_id INTO v_roles_obj_id;
    END IF;

    INSERT INTO method (method_de, object_id)
    SELECT v.method_de, v_roles_obj_id
    FROM (VALUES ('getAllForProject'), ('insertRole'), ('updateRole'), ('deleteRoles')) AS v(method_de)
    WHERE NOT EXISTS (
        SELECT 1 FROM method m WHERE m.method_de = v.method_de AND m.object_id = v_roles_obj_id
    );

    INSERT INTO permission_method (profile_id, method_id)
    SELECT v_leader_profile_id, m.method_id
    FROM method m
    WHERE m.object_id = v_roles_obj_id
      AND NOT EXISTS (
          SELECT 1 FROM permission_method pm
          WHERE pm.profile_id = v_leader_profile_id AND pm.method_id = m.method_id
      );

    -- ============================================================
    -- 4. Objeto "Equipos"
    -- ============================================================
    SELECT object_id INTO v_equipos_obj_id
    FROM object WHERE object_de = 'Equipos' AND sub_system_id = v_sub_system_id;

    IF v_equipos_obj_id IS NULL THEN
        INSERT INTO object (object_de, sub_system_id)
        VALUES ('Equipos', v_sub_system_id)
        RETURNING object_id INTO v_equipos_obj_id;
    END IF;

    INSERT INTO method (method_de, object_id)
    SELECT v.method_de, v_equipos_obj_id
    FROM (VALUES ('getAllForProject'), ('getAvailableUsers'), ('insertMember'), ('updateMember'), ('deleteMembers')) AS v(method_de)
    WHERE NOT EXISTS (
        SELECT 1 FROM method m WHERE m.method_de = v.method_de AND m.object_id = v_equipos_obj_id
    );

    INSERT INTO permission_method (profile_id, method_id)
    SELECT v_leader_profile_id, m.method_id
    FROM method m
    WHERE m.object_id = v_equipos_obj_id
      AND NOT EXISTS (
          SELECT 1 FROM permission_method pm
          WHERE pm.profile_id = v_leader_profile_id AND pm.method_id = m.method_id
      );

    RAISE NOTICE 'Permisos de Líder (Proyecto, Actividades ext., Roles, Equipos) aplicados correctamente.';
END $$;