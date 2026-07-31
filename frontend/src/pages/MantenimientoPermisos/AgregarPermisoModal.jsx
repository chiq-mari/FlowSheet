import React, { useState, useEffect } from 'react';
import Modal from '../../componentes/ui/Modal';
import PerfilSelector from './PerfilSelector';
import { useSubsistemas } from '../../hooks/useSubsistemas';
import { ejecutarMetodo } from '../../services/toProcess';
import '../../componentes/ui/FormGrid.css';
import '../../componentes/ui/ModalForm.css';
import './MantenimientoPermisos.css';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_OPCION = 'Opcion';
const OBJECT_OBJETO = 'Objeto';
const OBJECT_METODO = 'Metodo';

// Modal "Agregar Permiso". Opción/Método se eligen con selects en cascada dependientes
// del Subsistema (y del Objeto, en la pestaña Métodos) -- el mismo patrón de
// MetodoFormFields/OpcionFormFields -- para que el alta se arme exactamente con las
// mismas columnas que muestra la tabla, en vez de buscar en una lista mezclada de
// todo el sistema.
const AgregarPermisoModal = ({ tab, perfiles, accent, onClose, onSubmit, error }) => {
  const { subsistemas, loading: loadingSubsistemas } = useSubsistemas();

  const [profileId, setProfileId] = useState('');
  const [subSystemId, setSubSystemId] = useState('');
  const [objectId, setObjectId] = useState('');
  const [optionId, setOptionId] = useState('');
  const [methodId, setMethodId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOpciones = tab === 'opciones';

  // Cascada: opciones del subsistema elegido (pestaña Opciones)
  const [opciones, setOpciones] = useState([]);
  const [loadingOpciones, setLoadingOpciones] = useState(false);
  useEffect(() => {
    if (!isOpciones || !subSystemId) {
      setOpciones([]);
      return;
    }
    let cancelled = false;
    setLoadingOpciones(true);
    ejecutarMetodo(SUB_SYSTEM, OBJECT_OPCION, 'getAll', { subSystemId })
      .then((data) => {
        if (!cancelled) setOpciones(data || []);
      })
      .finally(() => {
        if (!cancelled) setLoadingOpciones(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpciones, subSystemId]);

  // Cascada: objetos del subsistema elegido (pestaña Métodos)
  const [objetos, setObjetos] = useState([]);
  const [loadingObjetos, setLoadingObjetos] = useState(false);
  useEffect(() => {
    if (isOpciones || !subSystemId) {
      setObjetos([]);
      return;
    }
    let cancelled = false;
    setLoadingObjetos(true);
    ejecutarMetodo(SUB_SYSTEM, OBJECT_OBJETO, 'getAll', { subSystemId })
      .then((data) => {
        if (!cancelled) setObjetos(data || []);
      })
      .finally(() => {
        if (!cancelled) setLoadingObjetos(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpciones, subSystemId]);

  // Cascada: métodos del objeto elegido (pestaña Métodos)
  const [metodos, setMetodos] = useState([]);
  const [loadingMetodos, setLoadingMetodos] = useState(false);
  useEffect(() => {
    if (isOpciones || !objectId) {
      setMetodos([]);
      return;
    }
    let cancelled = false;
    setLoadingMetodos(true);
    ejecutarMetodo(SUB_SYSTEM, OBJECT_METODO, 'getAll', { subSystemId, objectId })
      .then((data) => {
        if (!cancelled) setMetodos(data || []);
      })
      .finally(() => {
        if (!cancelled) setLoadingMetodos(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpciones, subSystemId, objectId]);

  const handleSubSystemChange = (e) => {
    setSubSystemId(e.target.value);
    setObjectId('');
    setOptionId('');
    setMethodId('');
  };

  const handleObjectChange = (e) => {
    setObjectId(e.target.value);
    setMethodId('');
  };

  const canSubmit = Boolean(profileId && (isOpciones ? optionId : methodId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    if (isOpciones) {
      await onSubmit({ profileId, optionId });
    } else {
      await onSubmit({ profileId, methodId });
    }
    setSubmitting(false);
  };

  return (
    <Modal title="Agregar Permiso" icon="shield" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-field form-field-full">
          <label>Perfil</label>
          <PerfilSelector perfiles={perfiles} value={profileId} onChange={setProfileId} accent={accent} />
        </div>

        <div className="form-grid">
          <div className="form-field form-field-full">
            <label>Subsistema</label>
            <select value={subSystemId} onChange={handleSubSystemChange} disabled={loadingSubsistemas}>
              <option value="">{loadingSubsistemas ? 'Cargando...' : 'Seleccionar subsistema...'}</option>
              {subsistemas.map((subsistema) => (
                <option key={subsistema.id} value={subsistema.id}>{subsistema.name}</option>
              ))}
            </select>
          </div>

          {isOpciones ? (
            <div className="form-field form-field-full">
              <label>Opción</label>
              <select
                value={optionId}
                onChange={(e) => setOptionId(e.target.value)}
                disabled={!subSystemId || loadingOpciones}
              >
                <option value="">
                  {!subSystemId
                    ? 'Primero selecciona un subsistema'
                    : loadingOpciones
                    ? 'Cargando...'
                    : 'Seleccionar opción...'}
                </option>
                {opciones.map((opcion) => (
                  <option key={opcion.option_id} value={opcion.option_id}>{opcion.option_de}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="form-field form-field-full">
                <label>Objeto</label>
                <select
                  value={objectId}
                  onChange={handleObjectChange}
                  disabled={!subSystemId || loadingObjetos}
                >
                  <option value="">
                    {!subSystemId
                      ? 'Primero selecciona un subsistema'
                      : loadingObjetos
                      ? 'Cargando...'
                      : 'Seleccionar objeto...'}
                  </option>
                  {objetos.map((objeto) => (
                    <option key={objeto.object_id} value={objeto.object_id}>{objeto.object_de}</option>
                  ))}
                </select>
              </div>

              <div className="form-field form-field-full">
                <label>Método</label>
                <select
                  value={methodId}
                  onChange={(e) => setMethodId(e.target.value)}
                  disabled={!objectId || loadingMetodos}
                >
                  <option value="">
                    {!objectId
                      ? 'Primero selecciona un objeto'
                      : loadingMetodos
                      ? 'Cargando...'
                      : 'Seleccionar método...'}
                  </option>
                  {metodos.map((metodo) => (
                    <option key={metodo.method_id} value={metodo.method_id}>{metodo.method_de}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {error && <p className="modal-form-error">{error}</p>}

        <div className="modal-form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting || !canSubmit}>
            {submitting ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AgregarPermisoModal;
