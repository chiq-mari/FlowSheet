import React, { useState } from 'react';
import Modal from '../../componentes/ui/Modal';
import ObjetoFormFields from './ObjetoFormFields';
import '../../componentes/ui/ModalForm.css';

// Modal de edición (icono lápiz). Recibe la fila seleccionada y la precarga en el formulario.
const EditarObjetoModal = ({ objeto, onClose, onSubmit, error }) => {
  const [values, setValues] = useState({
    objectDe: objeto.object_de || '',
    subSystemId: objeto.sub_system_id || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ id: objeto.object_id, ...values });
    setSubmitting(false);
  };

  return (
    <Modal title="Editar Objeto" icon="database" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <ObjetoFormFields values={values} onFieldChange={handleFieldChange} disabled={submitting} />

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

export default EditarObjetoModal;
