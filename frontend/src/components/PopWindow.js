import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  // Background overlay for the modal
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)'
  };

  // Modal styling
  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: 0,
    right: 0,
    bottom: 0,
    top: 'calc(50% - 10px)',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: '16px 16px 0 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  
  const backButtonStyle = {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: '6px 12px',
    color: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  return ReactDOM.createPortal(
      <div>
        <div style={overlayStyle} onClick={onClose}></div>
        <div className='flex-container'>
          <p className="blue-on-white-button-middle-left" onClick={onClose} >Cancel</p>
          <div style={modalStyle}>
            {children}
            {/* <button onClick={onClose}>Close</button> */}
          </div>
        </div>
        
      </div>,
      document.getElementById('modal-root')
  );
};

export default Modal;
