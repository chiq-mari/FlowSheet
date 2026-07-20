import express from 'express'
import path from 'path'
import session from 'express-session'; // Importamos el manejador de sesiones
import Session from './services/session.js'; // Ajusta la ruta según tus carpetas
import config from './config/config.json' with { type: 'json' };
import { DBComponent } from './config/dbComponent.js';
import Security from './services/security.js';
import authRoutes from './routes/authRoutes.js';

//VARIABLES GLOBALES
global.global_db = new DBComponent();
global.global_security = new Security();
global.global_session = new Session();

const app = express()
const port = config.server.port

// MIDDLEWARES
app.use(express.json()); //lee el flujo de texto de la petición y le añade a req la propiedad .body.

// lee las cookies de la petición y le añade a req la propiedad .session acoplada a su contenedor.
app.use(session({
    secret: config.session.secret,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    cookie: config.session.cookie
}));


// Le dice a Express que exponga todo lo que esté en la carpeta public
//app.use(express.static('./src/views'));
// CONSTRUCCIÓN ABSOLUTA: Entra a la carpeta de server.js y busca 'views' de forma segura
app.use(express.static(path.join(import.meta.dirname, 'views')));
app.use(express.urlencoded({ extended: false })); // Para formularios tradicionales si los usaras

// REGISTRO DE PETICIONES (Logger temporal):
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

/////////////////////////////////////
/*
app.post('/api/auth/login', (req, res) => {
    res.json({ message: "¡El servidor Express recibió los datos correctamente!" });
});*/

////////////////////////

// ====================================================================
// 2. RUTAS DE LA API
// ====================================================================

// 🔒 Vinculamos AUTENTICACION
app.use('/api/auth', authRoutes);

app.get('/perfiles', (req, res) => {
    //const userSession = new Session(req);
    
    // Seguridad: Si no hay sesión activa en el servidor, rebota al login
    if (global.global_session.sessionExist(req)) {
        res.sendFile(path.join(import.meta.dirname, 'views', 'perfiles.html'));
    } else {
        res.redirect('/');
    }
});

// seguridad

app.post('/toProcess', async (req, res) => {
    // ¿tiene_sesion?
    if (!global.global_session.sessionExist(req)) {
        return res.status(401).json({ 
            status: "Error",
            message: "Debe hacer sesión para ejecutar transacciones." 
        });
    }

    // 1. Extraemos SOLO el tipo de objetivo primero para decidir el camino
    const { targetType } = req.body; //method or menu
    const userData = global.global_session.getDataSession(req);
    const profileId = req.session.activeProfileId || userData.user_profiles?.[0]?.profile_id;

    try {
        // ================================================================
        // BIFURCACIÓN DE FLUJO: MÉTODOS VS MENÚS
        // ================================================================
        
        if (targetType === 'method') {
            // 2. Extraemos ÚNICAMENTE lo necesario para ejecutar código por reflexión
            const { subSystem, object, method, executionParams = {} } = req.body;  //pone exeParams default

            const resultadoEjecucion = await global.global_security.exeMethod(
                subSystem, 
                object, 
                method, 
                profileId, 
                executionParams
            );

            return res.json({
                status: "Éxito",
                type: "method_execution",
                message: `Transacción aprobada y ejecutada en [${subSystem}/${object}].`,
                data: resultadoEjecucion
            });

        } else if (targetType === 'menu') {
            // 3. Extraemos ÚNICAMENTE lo necesario para validar accesos visuales
            const { subSystem, menu } = req.body;

            const tieneAccesoMenu = global.global_security.getPermissionMenu(subSystem, menu, profileId);

            if (!tieneAccesoMenu) {
                return res.status(403).json({
                    status: "Acceso Denegado",
                    message: `El perfil ${profileId} no tiene permisos para visualizar el menú [${menu}].`
                });
            }

            return res.json({
                status: "Éxito",
                type: "menu_render",
                message: `Acceso concedido para la opción de menú: [${menu}].`
            });

        } else {
            return res.status(400).json({ status: "Error", message: "targetType inválido." });
        }

    } catch (error) {
        return res.status(403).json({
            status: "Acceso Denegado",
            message: error.message
        });
    }
});

// =================================
// 3. LEVANTAR EL SERVIDOR 
// =================================
app.listen(port, () => {
    console.log(`🚀 Servidor backend corriendo con éxito en http://localhost:${port}`);
});
