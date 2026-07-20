const form = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue sola
        
    // Limpiamos mensajes anteriores
    messageDiv.textContent = '';
    messageDiv.className = '';

    // Sacamos los datos de los inputs
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Hacemos la petición POST a nuestro futuro servidor de Express
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }) //convierte respuestas de usuario a json
        }); //devuelve objeto response

        const data = await response.json();

        if (response.ok && data.success) {  //status & property 
           // Redireccionamos al nuevo endpoint que sirve la interfaz de perfiles
            window.location.href = '/perfiles';
        } else {
            messageDiv.textContent = `${data.message || 'Error al iniciar sesión'}`;
            messageDiv.className = 'error';
        }

        } catch (error) {
            messageDiv.textContent = 'No se pudo conectar con el servidor backend.';
            messageDiv.className = 'error';
    }
});