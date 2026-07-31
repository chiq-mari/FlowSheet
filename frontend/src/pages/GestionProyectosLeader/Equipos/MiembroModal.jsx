import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../../componentes/ui/Modal';
import '../MisProyectos/ProyectoModal.css';

export function MiembroModal({
  isOpen,
  onClose,
  onSave,
  member = null,
  availableUsers = [], // Users in the system not in the project
  roles = []            // Project roles
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);
  const [roleSearch, setRoleSearch] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const userDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // Sync state on open/change
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (member) {
        // Edit mode
        setSelectedUser({ user_id: member.user_id, username: member.username });
        setUserSearch(member.username);
        setShowUserDropdown(false);

        const activeRole = roles.find((r) => String(r.id) === String(member.proyect_role_id));
        setSelectedRole(activeRole || { id: member.proyect_role_id, name: member.role_name });
        setRoleSearch(activeRole ? activeRole.name : member.role_name);
        setShowRoleDropdown(false);
      } else {
        // Add mode
        setSelectedUser(null);
        setUserSearch('');
        setShowUserDropdown(false);

        setSelectedRole(null);
        setRoleSearch('');
        setShowRoleDropdown(false);
      }
    }
  }, [member, isOpen, roles]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available users by search query
  const filteredUsers = availableUsers.filter((u) =>
    u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter project roles by search query
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUserSearch(user.username);
    setShowUserDropdown(false);
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setRoleSearch(role.name);
    setShowRoleDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setErrorMsg('Debe seleccionar un usuario.');
      return;
    }
    if (!selectedRole) {
      setErrorMsg('Debe seleccionar un rol para el proyecto.');
      return;
    }

    onSave({
      id: member ? member.proyect_role_user_id : null,
      userId: selectedUser.user_id,
      proyectRoleId: selectedRole.id
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member ? 'Editar Miembro' : 'Agregar Miembro'}
      icon="briefcase"
      tone="warning"
    >
      <form onSubmit={handleSubmit} className="proyecto-form" style={{ minHeight: '320px' }}>
        {errorMsg && <div className="error-alert">{errorMsg}</div>}

        {/* User autocomplete selector */}
        <div className="proyecto-form-group" style={{ position: 'relative' }} ref={userDropdownRef}>
          <label className="proyecto-form-label">USUARIO</label>
          <input
            type="text"
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setSelectedUser(null);
              setShowUserDropdown(true);
            }}
            onFocus={() => {
              if (!member) setShowUserDropdown(true);
            }}
            placeholder="Buscar usuario..."
            className="proyecto-form-input"
            disabled={!!member} // Disabled in edit mode (screenshot 4)
            required
          />
          {/* Autocomplete list */}
          {!member && showUserDropdown && (
            <div
              className="custom-autocomplete-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                zIndex: 100,
                maxHeight: '150px',
                overflowY: 'auto',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div
                    key={u.user_id}
                    onClick={() => handleSelectUser(u)}
                    style={{
                      padding: '0.6rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#1e293b'
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  >
                    {u.username}
                  </div>
                ))
              ) : (
                <div style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  No se encontraron usuarios
                </div>
              )}
            </div>
          )}
          {/* Checked indicator */}
          {selectedUser && (
            <div style={{ fontSize: '0.825rem', color: '#16a34a', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              ✓ {selectedUser.username}
            </div>
          )}
        </div>

        {/* Project Role autocomplete selector */}
        <div className="proyecto-form-group" style={{ position: 'relative', marginTop: '1.25rem' }} ref={roleDropdownRef}>
          <label className="proyecto-form-label">ROL EN EL PROYECTO</label>
          <input
            type="text"
            value={roleSearch}
            onChange={(e) => {
              setRoleSearch(e.target.value);
              setSelectedRole(null);
              setShowRoleDropdown(true);
            }}
            onFocus={() => setShowRoleDropdown(true)}
            placeholder="Buscar rol del proyecto..."
            className="proyecto-form-input"
            required
          />
          {/* Autocomplete list */}
          {showRoleDropdown && (
            <div
              className="custom-autocomplete-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                zIndex: 90,
                maxHeight: '150px',
                overflowY: 'auto',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              {filteredRoles.length > 0 ? (
                filteredRoles.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleSelectRole(r)}
                    style={{
                      padding: '0.6rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#1e293b'
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  >
                    {r.name}
                  </div>
                ))
              ) : (
                <div style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  No se encontraron roles en el proyecto
                </div>
              )}
            </div>
          )}
          {/* Checked indicator */}
          {selectedRole && (
            <div style={{ fontSize: '0.825rem', color: '#16a34a', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              ✓ {selectedRole.name}
            </div>
          )}
        </div>

        <div className="proyecto-modal-actions" style={{ marginTop: '2.5rem' }}>
          <button
            type="button"
            className="proyecto-btn-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="proyecto-btn-submit btn-orange"
            disabled={!selectedUser || !selectedRole}
            style={{
              backgroundColor: (!selectedUser || !selectedRole) ? '#cbd5e1' : '#f59e0b',
              cursor: (!selectedUser || !selectedRole) ? 'not-allowed' : 'pointer'
            }}
          >
            {member ? 'Guardar' : 'Agregar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default MiembroModal;
