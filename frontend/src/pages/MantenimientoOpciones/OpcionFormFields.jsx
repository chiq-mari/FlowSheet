import React, { useState, useEffect } from 'react';
import { useSubsistemas } from '../../hooks/useSubsistemas';
import { ejecutarMetodo } from '../../services/toProcess';
import '../../componentes/ui/FormGrid.css';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_OPCION = 'Opcion';

// Campos de formulario compartidos por Crear y Editar Opción. Puramente controlado.
// Reusa useSubsistemas() solo para leer el catálogo del <select> de subsistema, igual
// que PersonaFormFields reusa useCargos().
//
// El <select> de "Opción Padre" es una cascada: depende del subsistema elegido, así que
// se recarga con ejecutarMetodo directo (no con useOpciones, que trae/filtra la tabla
// completa de la página). Solo lista raíces (parent_option_id null) porque Sidebar.jsx
// no sabe renderizar un tercer nivel de menú — anidar bajo una opción que ya tiene padre
// simplemente la haría desaparecer del sidebar. excludeId evita que una opción, al
// editarse, se elija a sí misma como su propio padre.
const OpcionFormFields = ({ values, onFieldChange, disabled = false, excludeId = null }) => {
  const { subsistemas, loading: loadingSubsistemas } = useSubsistemas();
  const [padres, setPadres] = useState([]);
  const [loadingPadres, setLoadingPadres] = useState(false);
  // true si la opción que se está editando (excludeId) ya es padre de otras: en ese
  // caso no puede recibir a su vez un padre (crearía un 3er nivel que Sidebar.jsx no renderiza).
  const [esPadreDeAlgo, setEsPadreDeAlgo] = useState(false);

  useEffect(() => {
    if (!values.subSystemId) {
      setPadres([]);
      setEsPadreDeAlgo(false);
      return;
    }
    let cancelled = false;
    setLoadingPadres(true);
    ejecutarMetodo(SUB_SYSTEM, OBJECT_OPCION, 'getAll', { subSystemId: values.subSystemId })
      .then((data) => {
        if (cancelled) return;
        const lista = data || [];
        setPadres(lista.filter((o) => !o.parent_option_id && o.option_id !== excludeId));
        const tieneHijos = excludeId ? lista.some((o) => o.parent_option_id === excludeId) : false;
        setEsPadreDeAlgo(tieneHijos);
        if (tieneHijos && values.parentOptionId) {
          onFieldChange('parentOptionId', '');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPadres(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.subSystemId, excludeId]);

  const handleChange = (field) => (e) => onFieldChange(field, e.target.value);

  return (
    <div className="form-grid">
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

      <div className="form-field form-field-full">
        <label>Opción</label>
        <input
          type="text"
          placeholder="Ej: Gestión de Usuarios"
          value={values.optionDe}
          onChange={handleChange('optionDe')}
          disabled={disabled}
        />
      </div>

      <div className="form-field form-field-full">
        <label>Opción Padre (opcional)</label>
        <select
          value={values.parentOptionId}
          onChange={handleChange('parentOptionId')}
          disabled={disabled || !values.subSystemId || loadingPadres || esPadreDeAlgo}
        >
          <option value="">
            {!values.subSystemId
              ? 'Elige un subsistema primero'
              : loadingPadres
              ? 'Cargando...'
              : esPadreDeAlgo
              ? 'No aplica: esta opción ya tiene sub-opciones'
              : 'Ninguna (opción raíz)'}
          </option>
          {padres.map((padre) => (
            <option key={padre.option_id} value={padre.option_id}>{padre.option_de}</option>
          ))}
        </select>
        {esPadreDeAlgo && (
          <p className="form-field-hint">
            Esta opción ya tiene sub-opciones propias, así que no puede pasar a ser hija de otra.
          </p>
        )}
      </div>
    </div>
  );
};

export default OpcionFormFields;
