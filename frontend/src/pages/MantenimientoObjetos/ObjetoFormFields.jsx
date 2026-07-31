import React from 'react';
import { useSubsistemas } from '../../hooks/useSubsistemas';
import '../../componentes/ui/FormGrid.css';

// Campos de formulario compartidos por Crear y Editar Objeto. Puramente controlado.
// Reusa useSubsistemas() solo para leer el catálogo del <select>, igual que OpcionFormFields.
const ObjetoFormFields = ({ values, onFieldChange, disabled = false }) => {
  const { subsistemas, loading: loadingSubsistemas } = useSubsistemas();

  const handleChange = (field) => (e) => onFieldChange(field, e.target.value);

  return (
    <div className="form-grid">
      <div className="form-field form-field-full">
        <label>Nombre</label>
        <input
          type="text"
          placeholder="Ej: usuario"
          value={values.objectDe}
          onChange={handleChange('objectDe')}
          disabled={disabled}
        />
      </div>

      <div className="form-field form-field-full">
        <label>Subsistema</label>
        <select
          value={values.subSystemId}
          onChange={handleChange('subSystemId')}
          disabled={disabled || loadingSubsistemas}
        >
          <option value="">{loadingSubsistemas ? 'Cargando...' : 'Seleccionar subsistema...'}</option>
          {subsistemas.map((subsistema) => (
            <option key={subsistema.id} value={subsistema.id}>{subsistema.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ObjetoFormFields;
