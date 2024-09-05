import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  // 定义覆盖屏幕上半部分的阴影样式
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: '50%',  // 覆盖从顶部到屏幕中间
    backgroundColor: 'rgba(0,0,0,0.5)'  // 半透明黑色背景
  };

  // 定义弹窗样式，占据屏幕下半部分
  const modalStyle = {
    position: 'fixed',
    top: '50%',   // 从屏幕中间到底部
    // set width to 80%
    // width: '80%',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',  // 白色背景
    padding: 20,
    borderRadius: '16px 16px 0 0', // 仅顶部圆角
    display: 'flex',
    flexDirection: 'column', // 子元素垂直布局
    alignItems: 'center',
    justifyContent: 'center'
  };

  return ReactDOM.createPortal(
    <>
      {/* 点击阴影部分关闭弹窗 */}
      <div style={overlayStyle} onClick={onClose}></div>
      {/* 弹窗内容区 */}
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {children}
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10 }}>Close</button>
      </div>
    </>,
    document.body
  );
};

export default Modal;
