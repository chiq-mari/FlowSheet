import React, { useState } from 'react';
import Modal from '../../componentes/ui/Modal';
import CargoFormFields from './CargoFormFields';
import '../../componentes/ui/ModalForm.css';

// Modal de edición (icono lápiz). Recibe la fila seleccionada y la precarga en el formulario.
const EditarCargoModal = ({ cargo, onClose, onSubmit, error }) => {
  const [values, setValues] = useState({ name: cargo.name || '' });
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ id: cargo.id, ...values });
    setSubmitting(false);
  };

  return (
    <Modal title="Editar Cargo" icon="briefcase" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <CargoFormFields values={values} onFieldChange={handleFieldChange} disabled={submitting} />

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

export default EditarCargoModal;
