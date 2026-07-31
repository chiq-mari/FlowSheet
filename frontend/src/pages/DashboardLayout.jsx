// src/pages/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import Header from '../componentes/Header';
import Sidebar from '../componentes/Sidebar';
import { resolveDashboardPage } from './pageRegistry';
import { verificarAccesoMenu } from '../services/toProcess';
import './DashboardLayout.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DashboardLayout = ({ initialUser = null, onLogoutSuccess = null, children }) => {
  const [user, setUser] = useState(initialUser);
  const [profiles, setProfiles] = useState(initialUser?.user_profiles || []);
  const [activeProfileId, setActiveProfileId] = useState(
    initialUser?.activeProfile?.profile_id || initialUser?.user_profiles?.[0]?.profile_id || null
  );

  const [subSystems, setSubSystems] = useState([]);
  const [activeSubSystemId, setActiveSubSystemId] = useState(null);

  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 1. Obtener datos del usuario actual al montar (si no venían inicializados)
  useEffect(() => {
    if (!user) {
      fetch(`${API_URL}/api/auth/current-user`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data);
            setProfiles(data.user_profiles || []);
            if (data.user_profiles?.length > 0) {
              setActiveProfileId(data.user_profiles[0].profile_id);
            }
          }
        })
        .catch((err) => console.error("Error al obtener usuario actual:", err));
    }
  }, []);

  // 2. Cargar subsistemas autorizados para el perfil activo
  useEffect(() => {
    if (!activeProfileId) return;

    fetch(`${API_URL}/api/dashboard/subsystems/${activeProfileId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.subSystems)) {
          setSubSystems(data.subSystems);
          if (data.subSystems.length > 0) {
            setActiveSubSystemId(data.subSystems[0].sub_system_id);
          } else {
            setActiveSubSystemId(null);
            setOptions([]);
          }
        }
      })
      .catch((err) => console.error("Error al cargar subsistemas:", err));
  }, [activeProfileId]);

  // 3. Cargar opciones del sidebar cuando cambian perfil o subsistema. La lista viene
  // sin filtrar por permiso (ver comentario en getOptionsByProfileAndSubSystem): toda
  // opción del subsistema se renderiza siempre, y es el clic (handleSelectOption) el
  // que valida contra /toProcess y avisa si no hay acceso.
  useEffect(() => {
    if (!activeProfileId || !activeSubSystemId) {
      setOptions([]);
      setSelectedOption(null);
      return;
    }

    fetch(`${API_URL}/api/dashboard/options/${activeProfileId}/${activeSubSystemId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.options)) {
          setOptions(data.options);
          const defaultOpt = data.options.find((opt) => !opt.parent_option_id) || data.options[0] || null;
          setSelectedOption(defaultOpt);
        }
      })
      .catch((err) => console.error("Error al cargar opciones del sidebar:", err));
  }, [activeProfileId, activeSubSystemId]);

  // Switcheo de perfil del usuario (Llamada al backend)
  const handleProfileChange = async (targetProfile) => {
    const profId = typeof targetProfile === 'object' ? targetProfile.profile_id : targetProfile;
    const profDe = typeof targetProfile === 'object' ? targetProfile.profile_de : '';

    try {
      const response = await fetch(`${API_URL}/api/auth/select-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ profileId: profId, profileName: profDe }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setActiveProfileId(profId);
      }
    } catch (err) {
      console.error("Error al cambiar de perfil:", err);
    }
  };

  // Cierre de sesión
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      if (onLogoutSuccess) {
        onLogoutSuccess();
      } else {
        window.location.href = '/login';
      }
    }
  };

  const activeProfile = profiles.find((p) => String(p.profile_id) === String(activeProfileId));
  const activeSubSystem = subSystems.find((s) => String(s.sub_system_id) === String(activeSubSystemId));

  // Chequeo de acceso al hacer clic en una opción del sidebar. La lista que llega del
  // backend ya viene filtrada por permiso, pero puede haber quedado desactualizada
  // (por ejemplo si un Administrador quitó el permiso en otra pestaña mientras esta
  // sesión seguía abierta); este chequeo es la defensa real al momento del clic.
  const handleSelectOption = async (option) => {
    if (!activeSubSystem?.sub_system_de || !option?.option_de) {
      setSelectedOption(option);
      return;
    }
    try {
      await verificarAccesoMenu(activeSubSystem.sub_system_de, option.option_de);
      setSelectedOption(option);
    } catch (err) {
      // El alert ya se mostró dentro de verificarAccesoMenu (caso 403). No navegamos.
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Header Superior */}
      <Header
        user={user}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onProfileChange={handleProfileChange}
        subSystems={subSystems}
        activeSubSystemId={activeSubSystemId}
        onSubSystemChange={setActiveSubSystemId}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Cuerpo Principal */}
      <div className="dashboard-body">
        {/* Sidebar Dinámico por Permisos */}
        <Sidebar
          options={options}
          selectedOptionId={selectedOption?.option_id}
          onSelectOption={handleSelectOption}
          isOpen={sidebarOpen}
        />

        {/* ÁREA DE CONTENIDO PRINCIPAL: renderiza la página registrada para la opción de menú activa */}
        <main className="dashboard-main">
          {children ? (
            children
          ) : (
            (() => {
              const SelectedPage = resolveDashboardPage(selectedOption?.option_de);
              if (SelectedPage) return <SelectedPage user={user} activeProfile={activeProfile} />;
              return (
                <div className="dashboard-placeholder">
                  {selectedOption
                    ? `La sección "${selectedOption.option_de}" aún no tiene una pantalla implementada.`
                    : 'Selecciona una opción del menú para comenzar.'}
                </div>
              );
            })()
          )}
        </main>
      </div>

      {/* Botón flotante de Ayuda */}
      <button className="floating-help-btn" title="Ayuda">?</button>
    </div>
  );
};

export default DashboardLayout;