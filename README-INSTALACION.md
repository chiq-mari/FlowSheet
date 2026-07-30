# Módulo Miembro — FlowSheet

Este paquete contiene ÚNICAMENTE los archivos nuevos/modificados del Módulo Miembro.
No es un repo aparte: se aplica sobre tu clon local de https://github.com/chiq-mari/FlowSheet

## ⚠️ IMPORTANTE PARA EL EQUIPO (git merge)

Toda la lógica de negocio del Miembro (consultar asignaciones, consultar hoja de tiempo,
registrar avance) pasa por el motor de reflexión **POST /toProcess** que ya usa el resto
del sistema — NO usa rutas REST propias. Esto significa:

1. Hay un componente nuevo registrado en `Security.componentes`: **Actividades**
   (en `backend/src/services/actividades.js`), con 3 métodos:
   - `consultarAsignaciones`
   - `consultarNotificaciones`
   - `registrarAvance`

2. Para que el perfil "Miembro" tenga permiso de ejecutar esos 3 métodos, hay que
   correr UNA VEZ (por entorno/rama) el script:

     backend/src/database/permisos_miembro_actividades.sql

   Es IDEMPOTENTE — se puede correr varias veces sin duplicar filas ni romper nada.
   Sin este script, el sistema deniega el acceso con 403 aunque el código esté bien
   (así debe ser: el permiso vive en la BD, no en el código).

   Cómo correrlo:
     psql -U postgres -d flowsheet -f backend/src/database/permisos_miembro_actividades.sql

   (ajusta usuario/nombre de base según tu config.json)

3. Si algún compañero ya había creado rutas REST propias tipo `/api/member/...` para
   este mismo módulo, hay que eliminarlas para no duplicar lógica — todo debe pasar
   por `/toProcess` con `subSystem: "Hojas de Tiempo"`, `object: "Actividades"`.

## 1. Cómo aplicar estos archivos

1. Clona (o entra a) tu repo real:
   git clone https://github.com/chiq-mari/FlowSheet.git
   cd FlowSheet

2. Copia el contenido de este zip encima, respetando las carpetas:
   - backend/src/database/sentences.js              -> REEMPLAZA el existente
   - backend/src/database/permisos_miembro_actividades.sql -> ARCHIVO NUEVO (correr en psql, ver arriba)
   - backend/src/services/actividades.js             -> ARCHIVO NUEVO (componente de negocio)
   - backend/src/services/security.js                -> REEMPLAZA el existente (registra 'Actividades')
   - backend/src/server.js                            -> REEMPLAZA el existente (ya NO monta /api/member)
   - frontend/src/services/toProcess.js               -> ARCHIVO NUEVO (helper para llamar /toProcess)
   - frontend/src/pages/DashboardLayout.jsx           -> REEMPLAZA el existente
   - frontend/src/componentes/*.jsx / *.css           -> varios nuevos/modificados
   - frontend/src/pages/Member/*                      -> CARPETA COMPLETA (Dashboard, Proyectos,
                                                          Actividades, Reportes + gráficas)
   - frontend/package.json / package-lock.json        -> REEMPLAZA (agregan "recharts")

   Tip rápido (desde la raíz de tu clon real):
   cp -r /ruta/al/zip/descomprimido/backend/*  backend/
   cp -r /ruta/al/zip/descomprimido/frontend/* frontend/

## 2. Base de datos

Necesitas Postgres con el esquema de flowsheet_db2.sql cargado (el mismo que ya tienen).
Verifica que backend/src/config/config.json apunte a esa base:
  database: "flowsheet", user: "postgres", password: "postgres", host: "localhost", port: 5432

Después de cargar el schema, corre el script de permisos (ver sección de arriba):
  psql -U postgres -d flowsheet -f backend/src/database/permisos_miembro_actividades.sql

## 3. Levantar el sistema

Backend:
  cd backend
  npm install
  node src/server.js
  -> deberías ver en consola: "Caché de Métodos cargada: 3 permisos guardados."
     (si dice 0, el script de permisos no se aplicó)

Frontend (en otra terminal):
  cd frontend
  npm install
  -> instala recharts (gráficas de Reportes) desde el package.json actualizado
  npm run dev
  -> abre http://localhost:5173

## 4. Usuarios de prueba (perfil Miembro, ya en el seed de datos)

  usuario: bmendoza | elopez | gtorres | hramirez | icastro | fsanchez | crodriguez | dmartinez
  password: password123 (todos)

## 5. Qué deberías ver

- Login -> selector de perfil -> elige "Miembro"
- Sidebar: Dashboard, Proyectos, Reportes, Mis Chats
- Dashboard: banner de bienvenida + 2 stats + panel "Mis Notificaciones" con filtros
- Proyectos: pestañas Proyectos/Actividades, búsqueda, filtro por estado, modal de avance
- Reportes: selector de proyecto, 3 stats, tabla, 2 gráficas (barras y línea temporal)
- Mis Chats: placeholder "Próximamente" (no hay tablas de chat en la BD todavía)

Todo esto fue probado extremo a extremo contra una instancia real de Postgres:
login real, permisos denegados SIN el script SQL, permisos concedidos CON el script,
protección anti-IDOR, y confirmé que un usuario con 2 perfiles (ej. Administrador+Miembro)
NO puede ejecutar los métodos de Miembro si tiene el perfil Administrador activo.
