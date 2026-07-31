// 1. Mapeo centralizado de los nombres de las tablas
const dbSchema = {
    security: {
        user: 'public."user"',
        status_user: 'public.status_user',
        person: 'public.person', 
        profile: 'public.profile',
        user_profile: 'public.user_profile',
        sub_system: 'public.sub_system',
        object: 'public.object',
        method: 'public.method',
        permission_method: 'public.permission_method',
        option: 'public.option',
        permission_option: 'public.permission_option'
    }
};

// 2. Diccionario de consultas con los placeholders fijos ($1, $2...) que entiende Postgres
export const sentences = {
    security: {
        // Busca al usuario por su username para validar la contraseña y el estatus en el servicio
        getUser: `SELECT 
            u.user_id,
            u.user_na,
            u.user_pw,
            p.person_id,
            p.person_na,
            p.person_ln,
            p.person_ci,
            su.status_user_id,
            su.status_user_de,
            prof.profile_id,
            prof.profile_de
        FROM "user" u
        INNER JOIN status_user su ON u.status_user_id = su.status_user_id
        INNER JOIN person p ON p.person_id = u.person_id 
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        LEFT JOIN profile prof ON up.profile_id = prof.profile_id
        WHERE u.user_na = $1`,

        // Trae todos los métodos/acciones asignados a cada perfil
        getAllMethodPermissions: `
            SELECT 
                sub.sub_system_de,
                obj.object_de,
                m.method_de,
                pm.profile_id
            FROM permission_method pm
            INNER JOIN method m ON pm.method_id = m.method_id
            INNER JOIN object obj ON m.object_id = obj.object_id
            INNER JOIN sub_system sub ON obj.sub_system_id = sub.sub_system_id
        `,

        // Trae todas las opciones de menú asignadas a cada perfil
        getAllMenuPermissions: `
            SELECT 
                sub.sub_system_de,
                opt.option_de,
                po.profile_id
            FROM permission_option po
            INNER JOIN option opt ON po.option_id = opt.option_id
            INNER JOIN sub_system sub ON opt.sub_system_id = sub.sub_system_id
        `,
        // Para insertar en 'permission' (necesitamos cruzar con la tabla 'method' y 'object' para hallar el method_id)
        insertMethodPermission: `
            INSERT INTO permission_method (profile_id, method_id)
            SELECT $4, m.method_id
            FROM method m
            INNER JOIN object o ON m.object_id = o.object_id
            INNER JOIN sub_system s ON o.sub_system_id = s.sub_system_id
            WHERE s.sub_system_de = $1 
            AND o.object_de = $2 
            AND m.method_de = $3
            ON CONFLICT DO NOTHING;
        `,

        // Para insertar en 'permission_menu' (necesitamos cruzar con 'menu' para hallar el menu_id)
        insertMenuPermission: `
            INSERT INTO permission_option (profile_id, option_id)
            SELECT $3, opt.option_id
            FROM option opt
            INNER JOIN sub_system s ON opt.sub_system_id = s.sub_system_id
            WHERE s.sub_system_de = $1 
            AND opt.option_de = $2
            ON CONFLICT DO NOTHING;
        `
        ,
        deleteMethodPermission: `
        DELETE FROM permission_method 
            WHERE profile_id = $4 
            AND method_id = (
                SELECT m.method_id 
                FROM method m
                INNER JOIN object o ON m.object_id = o.object_id
                INNER JOIN sub_system s ON o.sub_system_id = s.sub_system_id
                WHERE s.sub_system_de = $1 
                    AND o.object_de = $2 
                    AND m.method_de = $3
            );
        `,

        deleteMenuPermission: `
            DELETE FROM permission_option 
            WHERE profile_id = $3 
            AND option_id = (
                SELECT opt.option_id 
                FROM option opt
                INNER JOIN sub_system s ON opt.sub_system_id = s.sub_system_id
                WHERE s.sub_system_de = $1 
                    AND opt.option_de = $2
            );
        `,
        // --- CONSULTAS DASHBOARD DINÁMICO ---

        // Obtiene los subsistemas permitidos para el perfil seleccionado ($1 = profile_id)
        getSubSystemsByProfile: `
            SELECT DISTINCT 
                s.sub_system_id, 
                s.sub_system_de
            FROM sub_system s
            INNER JOIN option o ON s.sub_system_id = o.sub_system_id
            INNER JOIN permission_option po ON o.option_id = po.option_id
            WHERE po.profile_id = $1
            ORDER BY s.sub_system_de ASC;
        `,

        // Obtiene las opciones y sub-opciones según el perfil ($1 = profile_id) y subsistema ($2 = sub_system_id)
        getOptionsByProfileAndSubSystem: `
            SELECT DISTINCT 
                o.option_id, 
                o.option_de, 
                o.parent_option_id, 
                o.sub_system_id
            FROM option o
            INNER JOIN permission_option po ON o.option_id = po.option_id
            WHERE po.profile_id = $1 
              AND o.sub_system_id = $2
            ORDER BY o.option_id ASC;
        `,

        // Obtiene los perfiles asignados a un usuario ($1 = user_id)
        getUserProfiles: `
            SELECT
                p.profile_id,
                p.profile_de
            FROM profile p
            INNER JOIN user_profile up ON p.profile_id = up.profile_id
            WHERE up.user_id = $1
            ORDER BY p.profile_de ASC;
        `,

        // --- INTEGRIDAD DE OBJETOS Y MÉTODOS (usados por Security.loadObjectMap / loadMethodMap) ---

        // Trae todos los objetos (clases) registrados en la BD, con su subsistema dueño
        getAllObjects: `
            SELECT
                obj.object_id,
                obj.object_de,
                sub.sub_system_de
            FROM object obj
            INNER JOIN sub_system sub ON obj.sub_system_id = sub.sub_system_id
        `,

        // Trae todos los métodos registrados en la BD, con su objeto y subsistema dueño
        getAllMethods: `
            SELECT
                m.method_id,
                m.method_de,
                obj.object_de,
                sub.sub_system_de
            FROM method m
            INNER JOIN object obj ON m.object_id = obj.object_id
            INNER JOIN sub_system sub ON obj.sub_system_id = sub.sub_system_id
        `
    },
    leader: {
        getMetrics: `
            SELECT 
              -- Metric 1: Active Projects
              (SELECT COUNT(DISTINCT p.id)::int
               FROM public.proyect p
               INNER JOIN public.proyect_role pr ON p.id = pr.proyect_id
               INNER JOIN public.proyect_role_user pru ON pr.id = pru.proyect_role_id
               INNER JOIN public.status s ON p.status_id = s.status_id
               WHERE pru.user_id = $1 
                 AND pr.name = 'Lider' 
                 AND s.status_de = 'En desarrollo'
              ) as active_projects,

              -- Metric 2: Total Employees
              (SELECT COUNT(DISTINCT pru_member.user_id)::int
               FROM public.proyect_role_user pru_leader
               INNER JOIN public.proyect_role pr_leader ON pru_leader.proyect_role_id = pr_leader.id
               INNER JOIN public.proyect_role pr_member ON pr_leader.proyect_id = pr_member.proyect_id
               INNER JOIN public.proyect_role_user pru_member ON pr_member.id = pru_member.proyect_role_id
               WHERE pru_leader.user_id = $1 
                 AND pr_leader.name = 'Lider'
                 AND pru_member.user_id <> $1
              ) as total_employees,

              -- Metric 3: Notifications Today
              (SELECT COUNT(n.id)::int
               FROM public.notification n
               INNER JOIN public.user_assignment ua ON n.user_assignment_id = ua.id
               INNER JOIN public.proyect_role_user pru_member ON ua.proyect_role_user_id = pru_member.id
               INNER JOIN public.proyect_role pr_member ON pru_member.proyect_role_id = pr_member.id
               INNER JOIN public.proyect_role pr_leader ON pr_member.proyect_id = pr_leader.proyect_id
               INNER JOIN public.proyect_role_user pru_leader ON pr_leader.id = pru_leader.proyect_role_id
               WHERE pru_leader.user_id = $1 
                 AND pr_leader.name = 'Lider'
                 AND pru_member.user_id <> $1
                 AND n.date = CURRENT_DATE
              ) as notifications_today,

              -- Metric 4: Total Hours Spent This Week
              (SELECT COALESCE(SUM(n.total_hours_spent), 0)::float
               FROM public.notification n
               INNER JOIN public.user_assignment ua ON n.user_assignment_id = ua.id
               INNER JOIN public.proyect_role_user pru_member ON ua.proyect_role_user_id = pru_member.id
               INNER JOIN public.proyect_role pr_member ON pru_member.proyect_role_id = pr_member.id
               INNER JOIN public.proyect_role pr_leader ON pr_member.proyect_id = pr_leader.proyect_id
               INNER JOIN public.proyect_role_user pru_leader ON pr_leader.id = pru_leader.proyect_role_id
               WHERE pru_leader.user_id = $1 
                 AND pr_leader.name = 'Lider'
                 AND n.date >= date_trunc('week', CURRENT_DATE)
                 AND n.date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
              ) as total_hours_week;
        `,
        getProjects: `
            SELECT DISTINCT p.id, p.name
            FROM public.proyect p
            INNER JOIN public.proyect_role pr ON p.id = pr.proyect_id
            INNER JOIN public.proyect_role_user pru ON pr.id = pru.proyect_role_id
            WHERE pru.user_id = $1 AND pr.name = 'Lider'
            ORDER BY p.name ASC;
        `,
        getNotifications: `
            SELECT 
              n.id, 
              n.date, 
              n.progress_percentage, 
              n.total_hours_spent, 
              n.observation, 
              n.notification_time,
              pe.person_na, 
              pe.person_ln, 
              u.user_na,
              proj.id as project_id, 
              proj.name as project_name,
              assign.name as assignment_name
            FROM public.notification n
            INNER JOIN public.user_assignment ua ON n.user_assignment_id = ua.id
            INNER JOIN public.assignment assign ON ua.assignment_id = assign.id
            INNER JOIN public.proyect_role_user pru_member ON ua.proyect_role_user_id = pru_member.id
            INNER JOIN public.proyect_role pr_member ON pru_member.proyect_role_id = pr_member.id
            INNER JOIN public.proyect proj ON pr_member.proyect_id = proj.id
            INNER JOIN public.proyect_role pr_leader ON proj.id = pr_leader.proyect_id
            INNER JOIN public.proyect_role_user pru_leader ON pr_leader.id = pru_leader.proyect_role_id
            INNER JOIN public."user" u ON pru_member.user_id = u.user_id
            INNER JOIN public.person pe ON u.person_id = pe.person_id
            WHERE pru_leader.user_id = $1 
              AND pr_leader.name = 'Lider'
              AND ($2::date IS NULL OR n.date >= $2)
              AND ($3::date IS NULL OR n.date <= $3)
              AND ($4::varchar IS NULL OR $4 = '' OR proj.id::varchar = $4)
            ORDER BY n.date DESC, n.notification_time DESC;
        `
    }
    ,
    person: {
    // 1. Obtener todas las personas con su Cargo (para la tabla principal)
    // Permite filtrar opcionalmente por nombre/apellido/CI/correo desde Node.js si se manda un término de búsqueda
    getAll: `
      SELECT 
        p.person_id,
        p.person_ci,
        p.person_na,
        p.person_ln,
        p.person_email,
        p.charge_id,
        c.name AS charge_name
      FROM person p
      LEFT JOIN charge c ON p.charge_id = c.id
      WHERE 
        ($1::text IS NULL OR $1 = '' OR 
         LOWER(p.person_na) LIKE LOWER('%' || $1 || '%') OR 
         LOWER(p.person_ln) LIKE LOWER('%' || $1 || '%') OR
         LOWER(p.person_ci) LIKE LOWER('%' || $1 || '%'))
      ORDER BY p.person_id DESC;
    `,

    // 2. Obtener una persona por ID (para cargar en modal de edición)
    getById: `
      SELECT 
        p.person_id,
        p.person_ci,
        p.person_na,
        p.person_ln,
        p.person_email,
        p.charge_id,
        c.name AS charge_name
      FROM person p
      LEFT JOIN charge c ON p.charge_id = c.id
      WHERE p.person_id = $1;
    `,

    // 3. Crear persona (+)
    create: `
      INSERT INTO person (
        person_ci,
        person_na,
        person_ln,
        person_email,
        charge_id
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING person_id, person_ci, person_na, person_ln, person_email, charge_id;
    `,

    // 4. Actualizar persona (icono lápiz)
    update: `
      UPDATE person
      SET 
        person_ci = $1,
        person_na = $2,
        person_ln = $3,
        person_email = $4,
        charge_id = $5
      WHERE person_id = $6
      RETURNING person_id, person_ci, person_na, person_ln, person_email, charge_id;
    `,

    // 5. Eliminar persona (icono papelera - soporta ID único o array vía ANY)
    delete: `
      DELETE FROM person
      WHERE person_id = ANY($1::uuid[]);
    `
  },

  // Cargo: usado tanto por el <select> de Persona como por su propia pantalla de mantenimiento
  charge: {
    // Admite búsqueda opcional por nombre; si no se manda término, devuelve todos (uso del combobox).
    getAll: `
      SELECT
        id,
        name
      FROM charge
      WHERE ($1::text IS NULL OR $1 = '' OR LOWER(name) LIKE LOWER('%' || $1 || '%'))
      ORDER BY name ASC;
    `,

    create: `
      INSERT INTO charge (name)
      VALUES ($1)
      RETURNING id, name;
    `,

    update: `
      UPDATE charge
      SET name = $1
      WHERE id = $2
      RETURNING id, name;
    `,

    delete: `
      DELETE FROM charge
      WHERE id = ANY($1::uuid[]);
    `
  },

  usuario: {
    // 1. Obtener todos los usuarios con los datos de su Persona vinculada (para la tabla principal)
    // Permite filtrar opcionalmente por username o por nombre/apellido/CI de la persona
    getAll: `
      SELECT
        u.user_id,
        u.user_na,
        u.user_pw,
        u.user_email,
        u.status_user_id,
        su.status_user_de,
        u.person_id,
        p.person_ci,
        p.person_na,
        p.person_ln
      FROM "user" u
      INNER JOIN status_user su ON u.status_user_id = su.status_user_id
      LEFT JOIN person p ON u.person_id = p.person_id
      WHERE
        ($1::text IS NULL OR $1 = '' OR
         LOWER(u.user_na) LIKE LOWER('%' || $1 || '%') OR
         LOWER(p.person_ci) LIKE LOWER('%' || $1 || '%') OR
         LOWER(p.person_na) LIKE LOWER('%' || $1 || '%') OR
         LOWER(p.person_ln) LIKE LOWER('%' || $1 || '%'))
      ORDER BY u.user_id DESC;
    `,

    // 2. Crear usuario (+)
    create: `
      INSERT INTO "user" (
        user_na,
        user_pw,
        user_email,
        status_user_id,
        person_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, user_na, user_pw, user_email, status_user_id, person_id;
    `,

    // 3. Actualizar usuario (icono lápiz)
    update: `
      UPDATE "user"
      SET
        user_na = $1,
        user_pw = $2,
        user_email = $3,
        status_user_id = $4,
        person_id = $5
      WHERE user_id = $6
      RETURNING user_id, user_na, user_pw, user_email, status_user_id, person_id;
    `,

    // 4. Eliminar usuario (icono papelera - soporta ID único o array vía ANY)
    delete: `
      DELETE FROM "user"
      WHERE user_id = ANY($1::uuid[]);
    `,

    // 5. Catálogo de estados para el <select> de Status en el formulario
    getEstados: `
      SELECT status_user_id, status_user_de
      FROM status_user
      ORDER BY status_user_id ASC;
    `
  },

  // Subsistema: agrupa Objetos/Opciones del árbol de permisos (ver sub_system en el ERD).
  // Se alias sub_system_id/sub_system_de a id/name para reusar la misma forma que Cargo.
  subSystem: {
    getAll: `
      SELECT
        sub_system_id AS id,
        sub_system_de AS name
      FROM sub_system
      WHERE ($1::text IS NULL OR $1 = '' OR LOWER(sub_system_de) LIKE LOWER('%' || $1 || '%'))
      ORDER BY sub_system_de ASC;
    `,

    create: `
      INSERT INTO sub_system (sub_system_de)
      VALUES ($1)
      RETURNING sub_system_id AS id, sub_system_de AS name;
    `,

    update: `
      UPDATE sub_system
      SET sub_system_de = $1
      WHERE sub_system_id = $2
      RETURNING sub_system_id AS id, sub_system_de AS name;
    `,

    delete: `
      DELETE FROM sub_system
      WHERE sub_system_id = ANY($1::uuid[]);
    `
  },

  // Opción: fila del árbol de menú (option), mostrada junto al nombre de su Subsistema.
  // parent_option_id sí es editable: permite anidar una opción bajo otra (ej. "Subsistemas"
  // bajo "Mantenimiento"). Queda NULL cuando la opción es raíz.
  option: {
    getAll: `
      SELECT
        o.option_id,
        o.option_de,
        o.sub_system_id,
        s.sub_system_de,
        o.parent_option_id
      FROM option o
      INNER JOIN sub_system s ON o.sub_system_id = s.sub_system_id
      WHERE
        ($1::uuid IS NULL OR o.sub_system_id = $1)
        AND ($2::text IS NULL OR $2 = '' OR LOWER(o.option_de) LIKE LOWER('%' || $2 || '%'))
      ORDER BY s.sub_system_de ASC, o.option_de ASC;
    `,

    create: `
      INSERT INTO option (option_de, sub_system_id, parent_option_id)
      VALUES ($1, $2, $3)
      RETURNING option_id, option_de, sub_system_id, parent_option_id;
    `,

    update: `
      UPDATE option
      SET option_de = $1, sub_system_id = $2, parent_option_id = $3
      WHERE option_id = $4
      RETURNING option_id, option_de, sub_system_id, parent_option_id;
    `,

    // Cuenta las opciones que cuelgan de $1 (usado para bloquear que una opción
    // que ya es padre reciba a su vez un padre, lo que crearía un 3er nivel).
    countChildren: `
      SELECT COUNT(*)::int AS count
      FROM option
      WHERE parent_option_id = $1;
    `,

    delete: `
      DELETE FROM option
      WHERE option_id = ANY($1::uuid[]);
    `
  },

  // Objeto: la clase de negocio registrada para reflexión (Security.exeMethod importa
  // ./${object_de.toLowerCase()}.js). Mostrado junto al nombre de su Subsistema.
  object: {
    getAll: `
      SELECT
        o.object_id,
        o.object_de,
        o.sub_system_id,
        s.sub_system_de
      FROM object o
      INNER JOIN sub_system s ON o.sub_system_id = s.sub_system_id
      WHERE
        ($1::uuid IS NULL OR o.sub_system_id = $1)
        AND ($2::text IS NULL OR $2 = '' OR LOWER(o.object_de) LIKE LOWER('%' || $2 || '%'))
      ORDER BY s.sub_system_de ASC, o.object_de ASC;
    `,

    create: `
      INSERT INTO object (object_de, sub_system_id)
      VALUES ($1, $2)
      RETURNING object_id, object_de, sub_system_id;
    `,

    update: `
      UPDATE object
      SET object_de = $1, sub_system_id = $2
      WHERE object_id = $3
      RETURNING object_id, object_de, sub_system_id;
    `,

    delete: `
      DELETE FROM object
      WHERE object_id = ANY($1::uuid[]);
    `
  },

  // Método: acción concreta de un Objeto, invocada por reflexión desde Security.exeMethod.
  // Se filtra opcionalmente por subsistema y por objeto (dropdowns en cascada del mockup).
  method: {
    getAll: `
      SELECT
        m.method_id,
        m.method_de,
        m.object_id,
        o.object_de,
        o.sub_system_id,
        s.sub_system_de
      FROM method m
      INNER JOIN object o ON m.object_id = o.object_id
      INNER JOIN sub_system s ON o.sub_system_id = s.sub_system_id
      WHERE
        ($1::uuid IS NULL OR o.sub_system_id = $1)
        AND ($2::uuid IS NULL OR m.object_id = $2)
        AND ($3::text IS NULL OR $3 = '' OR LOWER(m.method_de) LIKE LOWER('%' || $3 || '%'))
      ORDER BY s.sub_system_de ASC, o.object_de ASC, m.method_de ASC;
    `,

    create: `
      INSERT INTO method (method_de, object_id)
      VALUES ($1, $2)
      RETURNING method_id, method_de, object_id;
    `,

    update: `
      UPDATE method
      SET method_de = $1, object_id = $2
      WHERE method_id = $3
      RETURNING method_id, method_de, object_id;
    `,

    delete: `
      DELETE FROM method
      WHERE method_id = ANY($1::uuid[]);
    `
  },

  // Perfil: no es un CRUD sobre la tabla profile en sí (esos ya existen fijos), sino
  // la gestión de la relación N:M user_profile — resumen de conteos, la grilla de
  // usuarios+perfiles, y asignar/quitar un perfil a un usuario puntual.
  perfil: {
    // Tarjetas de la pestaña "Ver Perfiles": cuántos usuarios tiene cada perfil.
    getResumen: `
      SELECT
        p.profile_id,
        p.profile_de,
        COUNT(up.user_id)::int AS user_count
      FROM profile p
      LEFT JOIN user_profile up ON up.profile_id = p.profile_id
      GROUP BY p.profile_id, p.profile_de
      ORDER BY p.profile_de ASC;
    `,

    // Grilla de la pestaña "Ver Perfiles": cada usuario con sus perfiles asignados
    // como arreglo JSON (evita el problema N+1 de una consulta por usuario).
    getUsuarios: `
      SELECT
        u.user_id,
        u.user_na,
        u.user_email,
        COALESCE(
          json_agg(
            json_build_object('profile_id', p.profile_id, 'profile_de', p.profile_de)
            ORDER BY p.profile_de ASC
          ) FILTER (WHERE p.profile_id IS NOT NULL),
          '[]'
        ) AS perfiles
      FROM "user" u
      LEFT JOIN user_profile up ON up.user_id = u.user_id
      LEFT JOIN profile p ON up.profile_id = p.profile_id
      GROUP BY u.user_id, u.user_na, u.user_email
      ORDER BY u.user_na ASC;
    `,

    // Pestaña "Asignar": perfiles ya asignados al usuario elegido en el buscador.
    getPerfilesPorUsuario: `
      SELECT p.profile_id, p.profile_de
      FROM user_profile up
      INNER JOIN profile p ON up.profile_id = p.profile_id
      WHERE up.user_id = $1
      ORDER BY p.profile_de ASC;
    `,

    asignarPerfil: `
      INSERT INTO user_profile (user_id, profile_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING user_profile_id, user_id, profile_id;
    `,

    quitarPerfil: `
      DELETE FROM user_profile
      WHERE user_id = $1 AND profile_id = $2;
    `
  },
  
  status: {
    getAll: `
      SELECT 
        status_id, 
        status_de 
      FROM public.status 
      ORDER BY status_de ASC;
    `
  },

  proyecto: {
    getAllForLeader: `
        SELECT 
          p.id, 
          p.name, 
          p.status_id,
          s.status_de,
          (SELECT COUNT(DISTINCT ua.assignment_id)::int
           FROM public.proyect_role pr_inner
           INNER JOIN public.proyect_role_user pru_inner ON pr_inner.id = pru_inner.proyect_role_id
           INNER JOIN public.user_assignment ua ON pru_inner.id = ua.proyect_role_user_id
           WHERE pr_inner.proyect_id = p.id
          ) as activities_count,
          (SELECT COUNT(DISTINCT pru_inner.user_id)::int
           FROM public.proyect_role pr_inner
           INNER JOIN public.proyect_role_user pru_inner ON pr_inner.id = pru_inner.proyect_role_id
           WHERE pr_inner.proyect_id = p.id
          ) as members_count,
          (SELECT COUNT(DISTINCT pr_inner.id)::int
           FROM public.proyect_role pr_inner
           WHERE pr_inner.proyect_id = p.id
          ) as roles_count
        FROM public.proyect p
        INNER JOIN public.status s ON p.status_id = s.status_id
        INNER JOIN public.proyect_role pr ON p.id = pr.proyect_id
        INNER JOIN public.proyect_role_user pru ON pr.id = pru.proyect_role_id
        WHERE pru.user_id = $1 
          AND pr.name = 'Lider'
          AND ($2::text IS NULL OR $2 = '' OR LOWER(p.name) LIKE LOWER('%' || $2 || '%'))
        ORDER BY p.name ASC;
    `,
    insertProyect: `
        INSERT INTO public.proyect (name, status_id)
        VALUES ($1, $2)
        RETURNING id, name, status_id;
    `,
    insertDefaultRole: `
        INSERT INTO public.proyect_role (proyect_id, name)
        VALUES ($1, $2)
        RETURNING id;
    `,
    insertProyectRoleUser: `
        INSERT INTO public.proyect_role_user (proyect_role_id, user_id)
        VALUES ($1, $2);
    `,
    updateProyect: `
        UPDATE public.proyect
        SET name = $1, status_id = $2
        WHERE id = $3
        RETURNING id, name, status_id;
    `,
    deleteProyect: `
        DELETE FROM public.proyect
        WHERE id = $1;
    `,
    deleteNotificationsByProyect: `
        DELETE FROM public.notification
        WHERE user_assignment_id IN (
          SELECT ua.id 
          FROM public.user_assignment ua
          INNER JOIN public.proyect_role_user pru ON ua.proyect_role_user_id = pru.id
          INNER JOIN public.proyect_role pr ON pru.proyect_role_id = pr.id
          WHERE pr.proyect_id = $1
        );
    `,
    deleteUserAssignmentsByProyect: `
        DELETE FROM public.user_assignment
        WHERE proyect_role_user_id IN (
          SELECT pru.id 
          FROM public.proyect_role_user pru
          INNER JOIN public.proyect_role pr ON pru.proyect_role_id = pr.id
          WHERE pr.proyect_id = $1
        );
    `,
    deleteProyectRoleUsersByProyect: `
        DELETE FROM public.proyect_role_user
        WHERE proyect_role_id IN (
          SELECT pr.id 
          FROM public.proyect_role pr
          WHERE pr.proyect_id = $1
        );
    `,
    deleteProyectRolesByProyect: `
        DELETE FROM public.proyect_role
        WHERE proyect_id = $1;
    `
  },

  business: {
    // --- Member queries (friend's database queries) ---
    getMemberAssignments: `
        SELECT 
            ua.id AS user_assignment_id,
            a.id AS assignment_id,
            a.name AS assignment_name,
            p.name AS proyect_name,
            pr.name AS role_name
        FROM public.user_assignment ua
        INNER JOIN public.assignment a ON ua.assignment_id = a.id
        INNER JOIN public.proyect_role_user pru ON ua.proyect_role_user_id = pru.id
        INNER JOIN public.proyect_role pr ON pru.proyect_role_id = pr.id
        INNER JOIN public.proyect p ON pr.proyect_id = p.id
        WHERE pru.user_id = $1
        ORDER BY a.name ASC;
    `,
    getMemberNotifications: `
        SELECT 
            n.id AS notification_id,
            n.date,
            n.notification_time,
            n.progress_percentage,
            n.total_hours_spent,
            n.observation,
            a.name AS assignment_name,
            p.name AS proyect_name
        FROM public.notification n
        INNER JOIN public.user_assignment ua ON n.user_assignment_id = ua.id
        INNER JOIN public.assignment a ON ua.assignment_id = a.id
        INNER JOIN public.proyect_role_user pru ON ua.proyect_role_user_id = pru.id
        INNER JOIN public.proyect_role pr ON pru.proyect_role_id = pr.id
        INNER JOIN public.proyect p ON pr.proyect_id = p.id
        WHERE pru.user_id = $1
        ORDER BY n.date DESC, n.notification_time DESC;
    `,
    checkAssignmentOwnership: `
        SELECT ua.id 
        FROM public.user_assignment ua
        INNER JOIN public.proyect_role_user pru ON ua.proyect_role_user_id = pru.id
        WHERE ua.id = $1 AND pru.user_id = $2;
    `,
    insertNotification: `
        INSERT INTO public.notification (user_assignment_id, date, progress_percentage, observation, notification_time, total_hours_spent)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_assignment_id, date, progress_percentage, observation, notification_time, total_hours_spent;
    `,

    // --- Leader activities management queries ---
    getAllForProject: `
        SELECT DISTINCT a.id, a.name, a.status_id, s.status_de 
        FROM public.assignment a
        INNER JOIN public.status s ON a.status_id = s.status_id
        INNER JOIN public.user_assignment ua ON a.id = ua.assignment_id
        INNER JOIN public.proyect_role_user pru ON ua.proyect_role_user_id = pru.id
        INNER JOIN public.proyect_role pr ON pru.proyect_role_id = pr.id
        WHERE pr.proyect_id = $1
        ORDER BY a.name ASC;
    `,
    getAllAssignmentsForProject: `
        SELECT 
            ua.id AS user_assignment_id,
            a.id AS assignment_id,
            a.name AS assignment_name,
            u.user_id,
            u.user_na AS username,
            pru.id AS proyect_role_user_id,
            pr.name AS role_name,
            pers.person_na,
            pers.person_ln
        FROM public.user_assignment ua
        INNER JOIN public.assignment a ON ua.assignment_id = a.id
        INNER JOIN public.proyect_role_user pru ON ua.proyect_role_user_id = pru.id
        INNER JOIN public.proyect_role pr ON pru.proyect_role_id = pr.id
        INNER JOIN public.user u ON pru.user_id = u.user_id
        INNER JOIN public.person pers ON u.person_id = pers.person_id
        WHERE pr.proyect_id = $1
        ORDER BY a.name ASC, u.user_na ASC;
    `,
    insertActivity: `
        INSERT INTO public.assignment (name, status_id)
        VALUES ($1, $2)
        RETURNING id, name, status_id;
    `,
    insertUserAssignment: `
        INSERT INTO public.user_assignment (proyect_role_user_id, assignment_id)
        VALUES ($1, $2)
        RETURNING id;
    `,
    updateActivity: `
        UPDATE public.assignment
        SET name = $1, status_id = $2
        WHERE id = $3
        RETURNING id, name, status_id;
    `,
    deleteNotificationsByActivity: `
        DELETE FROM public.notification
        WHERE user_assignment_id IN (
            SELECT id FROM public.user_assignment WHERE assignment_id = $1
        );
    `,
    deleteUserAssignmentsByActivity: `
        DELETE FROM public.user_assignment
        WHERE assignment_id = $1;
    `,
    deleteActivity: `
        DELETE FROM public.assignment
        WHERE id = $1;
    `,
    getActivityStatusById: `
        SELECT status_id FROM public.assignment
        WHERE id = $1;
    `,
    getTeamMembers: `
        SELECT 
            pru.id AS proyect_role_user_id,
            u.user_id,
            u.user_na AS username,
            u.user_email AS email,
            pr.id AS proyect_role_id,
            pr.name AS role_name,
            pers.person_na,
            pers.person_ln
        FROM public.proyect_role_user pru
        INNER JOIN public.proyect_role pr ON pru.proyect_role_id = pr.id
        INNER JOIN public.user u ON pru.user_id = u.user_id
        INNER JOIN public.person pers ON u.person_id = pers.person_id
        WHERE pr.proyect_id = $1
        ORDER BY u.user_na ASC;
    `,
    deleteUserAssignment: `
        DELETE FROM public.user_assignment
        WHERE id = $1;
    `,
    getLeaderRoleUser: `
        SELECT pru.id 
        FROM public.proyect_role_user pru
        INNER JOIN public.proyect_role pr ON pru.proyect_role_id = pr.id
        WHERE pr.proyect_id = $1 AND pru.user_id = $2;
    `,
    getFirstRoleUser: `
        SELECT pru.id 
        FROM public.proyect_role_user pru
        INNER JOIN public.proyect_role pr ON pru.proyect_role_id = pr.id
        WHERE pr.proyect_id = $1
        LIMIT 1;
    `,
    checkUserAssignmentExists: `
        SELECT id FROM public.user_assignment 
        WHERE proyect_role_user_id = $1 AND assignment_id = $2;
    `,
    deleteNotificationsByUserAssignment: `
        DELETE FROM public.notification
        WHERE user_assignment_id = $1;
    `,
    
    // --- Roles queries ---
    getRolesForProject: `
        SELECT id, name, proyect_id 
        FROM public.proyect_role 
        WHERE proyect_id = $1 
        ORDER BY name ASC;
    `,
    insertRole: `
        INSERT INTO public.proyect_role (name, proyect_id) 
        VALUES ($1, $2) 
        RETURNING id, name, proyect_id;
    `,
    updateRole: `
        UPDATE public.proyect_role 
        SET name = $1 
        WHERE id = $2 
        RETURNING id, name, proyect_id;
    `,
    deleteRole: `
        DELETE FROM public.proyect_role 
        WHERE id = $1;
    `,
    deleteNotificationsByRole: `
        DELETE FROM public.notification
        WHERE user_assignment_id IN (
            SELECT ua.id 
            FROM public.user_assignment ua
            INNER JOIN public.proyect_role_user pru ON ua.proyect_role_user_id = pru.id
            WHERE pru.proyect_role_id = $1
        );
    `,
    deleteUserAssignmentsByRole: `
        DELETE FROM public.user_assignment
        WHERE proyect_role_user_id IN (
            SELECT id FROM public.proyect_role_user WHERE proyect_role_id = $1
        );
    `,
    deleteProyectRoleUsersByRole: `
        DELETE FROM public.proyect_role_user
        WHERE proyect_role_id = $1;
    `,
    
    // --- Team Members queries ---
    getAvailableUsers: `
        SELECT 
            u.user_id,
            u.user_na AS username,
            u.user_email AS email,
            pers.person_na,
            pers.person_ln
        FROM public.user u
        INNER JOIN public.person pers ON u.person_id = pers.person_id
        WHERE u.user_id NOT IN (
            SELECT user_id 
            FROM public.proyect_role_user pru
            INNER JOIN public.proyect_role pr ON pru.proyect_role_id = pr.id
            WHERE pr.proyect_id = $1
        )
        ORDER BY u.user_na ASC;
    `,
    insertTeamMember: `
        INSERT INTO public.proyect_role_user (proyect_role_id, user_id)
        VALUES ($1, $2)
        RETURNING id, proyect_role_id, user_id;
    `,
    updateTeamMember: `
        UPDATE public.proyect_role_user
        SET proyect_role_id = $1
        WHERE id = $2
        RETURNING id, proyect_role_id, user_id;
    `,
    deleteTeamMember: `
        DELETE FROM public.proyect_role_user
        WHERE id = $1;
    `,
    deleteNotificationsByTeamMember: `
        DELETE FROM public.notification
        WHERE user_assignment_id IN (
            SELECT id FROM public.user_assignment WHERE proyect_role_user_id = $1
        );
    `,
    deleteUserAssignmentsByTeamMember: `
        DELETE FROM public.user_assignment
        WHERE proyect_role_user_id = $1;
    `
  }
};