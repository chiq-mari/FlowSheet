import React, { useState } from 'react';
import Modal from '../../componentes/ui/Modal';
import MetodoFormFields from './MetodoFormFields';
import '../../componentes/ui/ModalForm.css';

// Modal de edición (icono lápiz). Recibe la fila seleccionada y la precarga en el formulario.
const EditarMetodoModal = ({ metodo, onClose, onSubmit, error }) => {
  const [values, setValues] = useState({
    subSystemId: metodo.sub_system_id || '',
    objectId: metodo.object_id || '',
    methodDe: metodo.method_de || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ id: metodo.method_id, ...values });
    setSubmitting(false);
  };

  return (
    <Modal title="Editar Método" icon="code" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <MetodoFormFields values={values} onFieldChange={handleFieldChange} disabled={submitting} />

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

export default EditarMetodoModal;
