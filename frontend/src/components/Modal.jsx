import React from "react";

const Modal = ({ open, title, children, onClose, onConfirm, confirmLabel }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button onClick={onClose}>Cancelar</button>
          <button className="danger" onClick={onConfirm}>
            {confirmLabel || "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
