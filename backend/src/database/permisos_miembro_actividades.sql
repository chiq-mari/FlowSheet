-- ============================================================================
-- Permisos del Módulo de Negocio (Hojas de Tiempo) - Perfil Miembro
-- ------------------------------------------------------------------------
-- Objeto:   Actividades
-- Métodos:  consultarAsignaciones | consultarNotificaciones | registrarAvance
-- Perfil autorizado: Miembro
--
-- Este script es IDEMPOTENTE: se puede correr varias veces (o en cualquier
-- rama/branch tras el git merge) sin duplicar filas ni romper nada.
--
-- Requisito: el sub_system "Hojas de Tiempo" y el profile "Miembro" ya deben
-- existir en la BD (vienen en el seed original de flowsheet_db2.sql).
-- ============================================================================

DO $$
DECLARE
    v_sub_system_id      uuid;
    v_object_id          uuid;
    v_profile_miembro_id uuid;
BEGIN
    -- 1. Sub-sistema "Hojas de Tiempo"
    SELECT sub_system_id INTO v_sub_system_id
    FROM sub_system
    WHERE sub_system_de = 'Hojas de Tiempo';

    IF v_sub_system_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el sub_system "Hojas de Tiempo". Verifica el seed base.';
    END IF;

    -- 2. Objeto "Actividades" (se crea solo si no existe)
    SELECT object_id INTO v_object_id
    FROM object
    WHERE object_de = 'Actividades' AND sub_system_id = v_sub_system_id;

    IF v_object_id IS NULL THEN
        INSERT INTO object (object_de, sub_system_id)
        VALUES ('Actividades', v_sub_system_id)
        RETURNING object_id INTO v_object_id;
    END IF;

    -- 3. Métodos del objeto "Actividades" (se insertan solo los que falten)
    INSERT INTO method (method_de, object_id)
    SELECT v.method_de, v_object_id
    FROM (VALUES ('consultarAsignaciones'), ('consultarNotificaciones'), ('registrarAvance')) AS v(method_de)
    WHERE NOT EXISTS (
        SELECT 1 FROM method m WHERE m.method_de = v.method_de AND m.object_id = v_object_id
    );

    -- 4. Perfil "Miembro"
    SELECT profile_id INTO v_profile_miembro_id
    FROM profile
    WHERE profile_de = 'Miembro';

    IF v_profile_miembro_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el profile "Miembro". Verifica el seed base.';
    END IF;

    -- 5. Otorgamos permiso de los 3 métodos al perfil Miembro (solo los que falten)
    INSERT INTO permission_method (profile_id, method_id)
    SELECT v_profile_miembro_id, m.method_id
    FROM method m
    WHERE m.object_id = v_object_id
      AND NOT EXISTS (
          SELECT 1 FROM permission_method pm
          WHERE pm.profile_id = v_profile_miembro_id AND pm.method_id = m.method_id
      );

    RAISE NOTICE 'Permisos del módulo Miembro (Actividades) aplicados correctamente.';
END $$;
