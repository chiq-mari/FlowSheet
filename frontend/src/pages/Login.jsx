// src/pages/Login.jsx
import { useState } from 'react';
import logo from '../assets/flowsheet_logo.png';
import { ProfileSelector } from '../componentes/ProfileSelector';
import './Login.css';

// Obtenemos la URL base desde el archivo .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado para el usuario autenticado y su perfil seleccionado
  const [user, setUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Script encargado de procesar el envío del formulario de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Petición directa al endpoint /api/auth/login del backend con credenciales
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Permite que Express cree y gestione la cookie de sesión (connect.sid)
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al autenticar.');
      }

      console.log('Sesión creada exitosamente:', data.user);
      setUser(data.user);

    } catch (err) {
      setErrorMsg(err.message || 'No se pudo conectar con el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar un perfil de usuario
  const handleSelectProfile = async (profile) => {
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/select-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          profileName: profile.profile_de,
          profileId: profile.profile_id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al seleccionar perfil.');
      }

      setSelectedProfile(profile);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo seleccionar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Cierre de sesión
  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setUser(null);
      setSelectedProfile(null);
      setErrorMsg('');
      setUsername('');
      setPassword('');
      setLoading(false);
    }
  };

  // PASO 2: Si el usuario ya se autenticó pero aún no selecciona perfil
  if (user && !selectedProfile) {
    return (
      <ProfileSelector
        user={user}
        onSelectProfile={handleSelectProfile}
        onLogout={handleLogout}
        loading={loading}
        errorMsg={errorMsg}
      />
    );
  }

  // PASO 3: Sesión iniciada y perfil activo (Vista del sistema con perfil seleccionado)
  if (user && selectedProfile) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>¡Bienvenido, {user.person_na || user.user_na}!</h2>
          <p className="active-profile-info">
            Perfil Activo: <strong>{selectedProfile.profile_de}</strong>
          </p>
          <button onClick={handleLogout} className="logout-button" disabled={loading}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // PASO 1: Formulario de Login
  return (
    <div className="login-container">
      <div className="login-header">
        <img src={logo} alt="FlowSheet Logo" className="login-logo" />
        <p className="login-subtitle">Control de Hojas de Tiempo</p>
      </div>

      <div className="login-card">
        {errorMsg && <div className="error-badge">{errorMsg}</div>}

        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin_lider"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>

      <footer className="login-footer">
        FlowSheet v1.0 — Sistema de Control de Hojas de Tiempo
      </footer>
      <button className="help-button" title="Ayuda">?</button>
    </div>
  );
}