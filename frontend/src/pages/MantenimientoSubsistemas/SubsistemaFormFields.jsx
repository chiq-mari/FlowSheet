import React from 'react';
import '../../componentes/ui/FormGrid.css';

// Campo de formulario compartido por Crear y Editar Subsistema. Puramente controlado.
const SubsistemaFormFields = ({ values, onFieldChange, disabled = false }) => {
  return (
    <div className="form-field">
      <label>Nombre del Subsistema</label>
      <input
        type="text"
        placeholder="Ej: Seguridad"
        value={values.name}
        onChange={(e) => onFieldChange('name', e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

export default SubsistemaFormFields;
