import React, { useState, useEffect } from 'react';
import { useSubsistemas } from '../../hooks/useSubsistemas';
import { ejecutarMetodo } from '../../services/toProcess';
import '../../componentes/ui/FormGrid.css';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_OBJETO = 'Objeto';

// Campos de formulario compartidos por Crear y Editar Método. Puramente controlado.
// Reusa useSubsistemas() solo para leer el catálogo del <select> de subsistema, igual
// que OpcionFormFields/ObjetoFormFields.
//
// El <select> de Objeto es una cascada: depende del subsistema elegido, así que se
// recarga con ejecutarMetodo directo (mismo patrón que el selector de "Opción Padre"
// en OpcionFormFields), no con useObjetos (que trae/filtra la tabla de su propia página).
const MetodoFormFields = ({ values, onFieldChange, disabled = false }) => {
  const { subsistemas, loading: loadingSubsistemas } = useSubsistemas();
  const [objetos, setObjetos] = useState([]);
  const [loadingObjetos, setLoadingObjetos] = useState(false);

  useEffect(() => {
    if (!values.subSystemId) {
      setObjetos([]);
      return;
    }
    let cancelled = false;
    setLoadingObjetos(true);
    ejecutarMetodo(SUB_SYSTEM, OBJECT_OBJETO, 'getAll', { subSystemId: values.subSystemId })
      .then((data) => {
        if (!cancelled) setObjetos(data || []);
      })
      .finally(() => {
        if (!cancelled) setLoadingObjetos(false);
      });
    return () => {
      cancelled = true;
    };
  }, [values.subSystemId]);

  const handleChange = (field) => (e) => onFieldChange(field, e.target.value);

  const handleSubSystemChange = (e) => {
    onFieldChange('subSystemId', e.target.value);
    onFieldChange('objectId', ''); // cambiar de subsistema invalida el objeto ya elegido
  };

  return (
    <div className="form-grid">
      <div className="form-field form-field-full">
        <label>Subsistema</label>
        <select value={values.subSystemId} onChange={handleSubSystemChange} disabled={disabled || loadingSubsistemas}>
          <option value="">{loadingSubsistemas ? 'Cargando...' : 'Seleccionar subsistema...'}</option>
          {subsistemas.map((subsistema) => (
            <option key={subsistema.id} value={subsistema.id}>{subsistema.name}</option>
          ))}
        </select>
      </div>

      <div className="form-field form-field-full">
        <label>Objeto</label>
        <select
          value={values.objectId}
          onChange={handleChange('objectId')}
          disabled={disabled || !values.subSystemId || loadingObjetos}
        >
          <option value="">
            {!values.subSystemId ? 'Primero selecciona un subsistema' : loadingObjetos ? 'Cargando...' : 'Seleccionar objeto...'}
          </option>
          {objetos.map((objeto) => (
            <option key={objeto.object_id} value={objeto.object_id}>{objeto.object_de}</option>
          ))}
        </select>
      </div>

      <div className="form-field form-field-full">
        <label>Nombre del Método</label>
        <input
          type="text"
          placeholder="Ej: INSERT, SELECT, UPDATE..."
          value={values.methodDe}
          onChange={handleChange('methodDe')}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default MetodoFormFields;
