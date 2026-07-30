import express from 'express'
import cors from 'cors';
import session from 'express-session'; // Importamos el manejador de sesiones
import Session from './services/session.js'; // Ajusta la ruta según tus carpetas
import config from './config/config.json' with { type: 'json' };
import { DBComponent } from './config/dbComponent.js';
import Security from './services/security.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js'; // Importa el nuevo router
import processRoutes from './routes/processRoutes.js'; // Router del endpoint único /toProcess

//VARIABLES GLOBALES
global.global_db = new DBComponent();
global.global_security = new Security();
global.global_session = new Session();

const app = express()
const port = config.server.port

// MIDDLEWARES
// Configuración de CORS para aceptar credenciales/cookies desde React
app.use(cors({
  origin: 'http://localhost:5173', // URL exacta donde corre tu frontend con Vite
  credentials: true                // VITAL: permite el envío y recepción de cookies de sesión
}));
/////////////////////////////
app.use(express.json()); //lee el flujo de texto de la petición y le añade a req la propiedad .body.

// lee las cookies de la petición y le añade a req la propiedad .session acoplada a su contenedor.
app.use(session({
    secret: config.session.secret,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    cookie: config.session.cookie
}));

app.use(express.urlencoded({ extended: false })); // Para formularios si se requiere

// REGISTRO DE PETICIONES (Logger temporal):
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

// ====================================================================
// 2. RUTAS DE LA API
// ====================================================================

// 🔒 Vinculamos AUTENTICACION
app.use('/api/auth', authRoutes);
// Montamos el router del Dashboard bajo el prefijo /api/dashboard
app.use('/api/dashboard', dashboardRoutes);

// 🔒 Punto único de entrada para transacciones protegidas por permisos (POST /toProcess)
app.use('/', processRoutes);

// =================================
// 3. LEVANTAR EL SERVIDOR 
// =================================
app.listen(port, () => {
    console.log(`🚀 Servidor backend corriendo con éxito en http://localhost:${port}`);
});
