import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../../componentes/ui/Modal';
import '../MisProyectos/ProyectoModal.css';

export function SeleccionarResponsableModal({
  isOpen,
  onClose,
  unassignedMembers = [],
  onAdd
}) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedMember(null);
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    onAdd(selectedMember.proyect_role_user_id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar Responsable"
      icon="person"
    >
      <form onSubmit={handleSubmit} className="proyecto-form">
        <div className="proyecto-form-group" style={{ position: 'relative' }}>
          <label className="proyecto-form-label">MIEMBRO DEL EQUIPO</label>
          
          {/* Custom Select Trigger */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              className={`proyecto-form-select custom-select-trigger ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                borderColor: isDropdownOpen ? '#3b82f6' : '#cbd5e1'
              }}
            >
              <span style={{ color: selectedMember ? '#1e293b' : '#94a3b8' }}>
                {selectedMember
                  ? `${selectedMember.username} — ${selectedMember.role_name}`
                  : 'Select'}
              </span>
              <span className="dropdown-arrow-icon" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                ▼
              </span>
            </div>

            {/* Custom Dropdown List */}
            {isDropdownOpen && (
              <div
                className="custom-dropdown-list"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  zIndex: 200,
                  marginTop: '0.5rem',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  padding: '0.5rem'
                }}
              >
                {unassignedMembers.length > 0 ? (
                  unassignedMembers.map((member) => {
                    const isSelected = selectedMember?.proyect_role_user_id === member.proyect_role_user_id;
                    return (
                      <div
                        key={member.proyect_role_user_id}
                        className="custom-dropdown-item"
                        onClick={() => handleSelectMember(member)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', color: isSelected ? '#1d4ed8' : '#1e293b', fontSize: '0.9rem' }}>
                            {member.username}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                            {member.role_name}
                          </span>
                        </div>
                        {isSelected && (
                          <div
                            className="selected-check-circle"
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: '#3b82f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.65rem'
                            }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    No hay miembros disponibles
                  </div>
                )}
              </div>
            )}
          </div>
          
          {unassignedMembers.length === 0 && (
            <p className="field-help-text-red">Todos los miembros del equipo ya están asignados a esta actividad.</p>
          )}
        </div>

        <div className="proyecto-modal-actions" style={{ marginTop: '2rem' }}>
          <button
            type="button"
            className="proyecto-btn-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="proyecto-btn-submit btn-blue"
            disabled={!selectedMember}
            style={{
              backgroundColor: !selectedMember ? '#cbd5e1' : '#1e293b',
              cursor: !selectedMember ? 'not-allowed' : 'pointer'
            }}
          >
            Agregar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SeleccionarResponsableModal;
