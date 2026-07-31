import React from 'react';
import '../../componentes/ui/FormGrid.css';

// Campo de formulario compartido por Crear y Editar Cargo. Puramente controlado.
const CargoFormFields = ({ values, onFieldChange, disabled = false }) => {
  return (
    <div className="form-field">
      <label>Nombre del Cargo</label>
      <input
        type="text"
        placeholder="Ej: Ingeniero de Sistemas"
        value={values.name}
        onChange={(e) => onFieldChange('name', e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

export default CargoFormFields;
