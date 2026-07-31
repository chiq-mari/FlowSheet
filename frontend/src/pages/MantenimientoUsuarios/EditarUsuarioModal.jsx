import React, { useState } from 'react';
import Modal from '../../componentes/ui/Modal';
import UsuarioFormFields from './UsuarioFormFields';
import '../../componentes/ui/ModalForm.css';

// Modal de edición (icono lápiz). Recibe la fila seleccionada y la precarga en el formulario,
// incluyendo la Persona ya vinculada (viene resuelta desde el JOIN de usuario.getAll).
const EditarUsuarioModal = ({ usuario, onClose, onSubmit, error }) => {
  const [values, setValues] = useState({
    userNa: usuario.user_na || '',
    userPw: usuario.user_pw || '',
    userEmail: usuario.user_email || '',
    statusUserId: usuario.status_user_id ?? '',
    personId: usuario.person_id ?? '',
    personDisplay: usuario.person_id
      ? { person_ci: usuario.person_ci, person_na: usuario.person_na, person_ln: usuario.person_ln }
      : null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { personDisplay: _personDisplay, ...payload } = values;
    await onSubmit({ userId: usuario.user_id, ...payload });
    setSubmitting(false);
  };

  return (
    <Modal title="Editar Usuario" icon="person" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <UsuarioFormFields values={values} onFieldChange={handleFieldChange} disabled={submitting} />

        {error && <p className="modal-form-error">{error}</p>}

        <div className="modal-form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditarUsuarioModal;
