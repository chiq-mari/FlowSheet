import React, { useState } from 'react';
import Modal from '../../componentes/ui/Modal';
import OpcionFormFields from './OpcionFormFields';
import '../../componentes/ui/ModalForm.css';

// Modal de edición (icono lápiz). Recibe la fila seleccionada y la precarga en el formulario.
const EditarOpcionModal = ({ opcion, onClose, onSubmit, error }) => {
  const [values, setValues] = useState({
    subSystemId: opcion.sub_system_id || '',
    optionDe: opcion.option_de || '',
    parentOptionId: opcion.parent_option_id || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ id: opcion.option_id, ...values });
    setSubmitting(false);
  };

  return (
    <Modal title="Editar Opción" icon="list" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <OpcionFormFields
          values={values}
          onFieldChange={handleFieldChange}
          disabled={submitting}
          excludeId={opcion.option_id}
        />

        {error && <p className="modal-form-error">{error}</p>}

        <div className="modal-form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditarOpcionModal;
