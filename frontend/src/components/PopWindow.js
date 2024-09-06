import React from 'react';
import ReactDOM from 'react-dom';


// this is the pop up window
// how to use:
// 1. import Modal from './PopWindow';
// 2. const [isOpen, setIsOpen] = useState(false);
// 3. const handleOpen = () => setIsOpen(true);
// 4. const handleClose = () => setIsOpen(false);
// 5. add this part in the return part
//    <Modal isOpen={isOpen} onClose={handleClose}>
//    {/* children content here */}
//      </Modal>



const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  // the upper up background shadow
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)'
  };

  // update the downside part for the modal
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
    justifyContent: 'center'
  };

  // close button style
  const closeButtonStyle = {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: '6px 12px',
    // transparent background
    background: 'transparent',
    color: '#007bff',// blue color
    border: 'none',
    borderRadius: '5px',  // slightly rounded corners
    cursor: 'pointer'
  };

  return ReactDOM.createPortal(
    <>
      {/* click shadow part to close */}
      <div style={overlayStyle} onClick={onClose}></div>
      {/* the content */}
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {children}
        <button onClick={onClose} style={closeButtonStyle}>Close</button>
      </div>
    </>,
    document.body
  );
};

export default Modal;
