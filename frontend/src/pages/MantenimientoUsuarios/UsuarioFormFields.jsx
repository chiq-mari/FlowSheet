import React, { useState } from 'react';
import { useEstadosUsuario } from '../../hooks/useEstadosUsuario';
import SeleccionarPersonaModal from './SeleccionarPersonaModal';
import '../../componentes/ui/FormGrid.css';

// Campos de formulario compartidos por Crear y Editar Usuario.
// Es puramente controlado: recibe los valores actuales y notifica cambios,
// sin conocer si viene de un alta o de una edición.
// values.personDisplay guarda solo los datos para pintar el botón de "Persona"
// (CI/nombre/apellido); el dato real que se envía al backend es personId.
const UsuarioFormFields = ({ values, onFieldChange, disabled = false }) => {
  const { estados, loading: loadingEstados } = useEstadosUsuario();
  const [showPassword, setShowPassword] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleChange = (field) => (e) => onFieldChange(field, e.target.value);

  const handleSelectPersona = (persona) => {
    onFieldChange('personId', persona.person_id);
    onFieldChange('personDisplay', persona);
  };

  return (
    <>
      <div className="form-grid">
        <div className="form-field">
          <label>Username</label>
          <input
            type="text"
            placeholder="username"
            value={values.userNa}
            onChange={handleChange('userNa')}
            disabled={disabled}
          />
        </div>

        <div className="form-field">
          <label>Password</label>
          <div className="form-field-password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={values.userPw}
              onChange={handleChange('userPw')}
              disabled={disabled}
            />
            <button
              type="button"
              className="form-field-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="form-field form-field-full">
          <label>Correo</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={values.userEmail}
            onChange={handleChange('userEmail')}
            disabled={disabled}
          />
        </div>

        <div className="form-field">
          <label>Status</label>
          <select
            value={values.statusUserId}
            onChange={handleChange('statusUserId')}
            disabled={disabled || loadingEstados}
          >
            <option value="">{loadingEstados ? 'Cargando...' : 'Seleccione un status'}</option>
            {estados.map((estado) => (
              <option key={estado.status_user_id} value={estado.status_user_id}>{estado.status_user_de}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Persona</label>
          <button
            type="button"
            className="form-field-picker-btn"
            onClick={() => setPickerOpen(true)}
            disabled={disabled}
          >
            {values.personDisplay ? (
              <span>{values.personDisplay.person_ci} — {values.personDisplay.person_na} {values.personDisplay.person_ln}</span>
            ) : (
              <span className="picker-placeholder">Seleccione una persona</span>
            )}
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {pickerOpen && (
        <SeleccionarPersonaModal
          selectedPersonId={values.personId || null}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelectPersona}
        />
      )}
    </>
  );
};

export default UsuarioFormFields;
