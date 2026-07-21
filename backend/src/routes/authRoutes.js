import express from 'express';
//import Session from '../services/session.js'; // Ajustamos la ruta para subir un nivel

const router = express.Router();

// 1. POST -> /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {

        // 1. authenticate busca en la BD, pasa por tu transformador y devuelve el objeto limpio con user_profiles
        const userData = await global.global_session.authenticate(username, password);
        console.log(userData)

        if (userData) {
            // 2. Le pasas ese objeto directo a createSession y se guarda enterito en la sesión
            global.global_session.createSession(req, userData);

            // 3. Respondemos con éxito al index.html
            return res.json({ 
                success: true,
                user: userData 
            });
        } else {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos." });
        }

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
});

// 2. GET -> /api/auth/current-user 
// Nuevo endpoint seguro para consultar los datos del usuario logueado
router.get('/current-user', (req, res) => {

    // Si el usuario tiene sesión activa en el servidor...
    if (global.global_session.sessionExist(req)) {
        const userData = global.global_session.getDataSession(req);
        
        // Le enviamos al front únicamente lo que necesita para renderizar la vista
        return res.json({
            success: true,
            person_na: userData.person_na,
            user_profiles: userData.user_profiles
        });
    } else {
        return res.status(401).json({ message: "No autorizado." });
    }
});

// 3. POST -> /api/auth/select-profile
router.post('/select-profile', (req, res) => {
    const { profileName, profileId } = req.body;

    if (!global.global_session.sessionExist(req)) {
        return res.status(401).json({ message: "Sesión expirada o inválida." });
    }

    const userData = global.global_session.getDataSession(req);

    // Buscamos el objeto de perfil coincidiendo por ID o por Nombre
    const matchedProfile = userData.user_profiles.find(
        p => (profileId && p.profile_id === profileId) || (profileName && p.profile_de === profileName)
    );

    if (matchedProfile) {
        // Guardamos tanto el ID como el Perfil seleccionado en la sesión
        req.session.activeProfileId = matchedProfile.profile_id;
        req.session.activeProfileName = matchedProfile.profile_de;

        return res.json({
            success: true,
            activeProfile: matchedProfile,
            message: `¡Bienvenido, ${userData.person_na}! Ingresaste correctamente como [${matchedProfile.profile_de}].`
        });
    } else {
        return res.status(403).json({ message: "No tienes autorización para usar este perfil." });
    }
});

// 4. POST -> /api/auth/logout
router.post('/logout', async (req, res) => {
    try {
        await global.global_session.destroySession(req);
        res.clearCookie('connect.sid');
        return res.json({ success: true, message: "Sesión cerrada exitosamente." });
    } catch (error) {
        console.error("Error en logout:", error);
        return res.status(500).json({ message: "Error al cerrar la sesión." });
    }
});

// Exportamos el router para usarlo en server.js
export default router;