import React from 'react';
import { useCargos } from '../../hooks/useCargos';
import './PersonaFormFields.css';

// Campos de formulario compartidos por Crear y Editar Persona.
// Es puramente controlado: recibe los valores actuales y notifica cambios,
// sin conocer si viene de un alta o de una edición.
const PersonaFormFields = ({ values, onFieldChange, disabled = false }) => {
  const { cargos, loading: loadingCargos } = useCargos();

  const handleChange = (field) => (e) => onFieldChange(field, e.target.value);

  return (
    <div className="persona-form-grid">
      <div className="persona-form-field">
        <label>Cédula (CI)</label>
        <input
          type="text"
          placeholder="V-00.000.000"
          value={values.personCi}
          onChange={handleChange('personCi')}
          disabled={disabled}
        />
      </div>

      <div className="persona-form-field">
        <label>Nombre</label>
        <input
          type="text"
          placeholder="Nombre"
          value={values.personNa}
          onChange={handleChange('personNa')}
          disabled={disabled}
        />
      </div>

      <div className="persona-form-field">
        <label>Apellido</label>
        <input
          type="text"
          placeholder="Apellido"
          value={values.personLn}
          onChange={handleChange('personLn')}
          disabled={disabled}
        />
      </div>

      <div className="persona-form-field persona-form-field-full">
        <label>Correo</label>
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          value={values.personEmail}
          onChange={handleChange('personEmail')}
          disabled={disabled}
        />
      </div>

      <div className="persona-form-field persona-form-field-full">
        <label>Cargo</label>
        <select
          value={values.chargeId}
          onChange={handleChange('chargeId')}
          disabled={disabled || loadingCargos}
        >
          <option value="">{loadingCargos ? 'Cargando...' : 'Seleccione un cargo'}</option>
          {cargos.map((cargo) => (
            <option key={cargo.id} value={cargo.id}>{cargo.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PersonaFormFields;
