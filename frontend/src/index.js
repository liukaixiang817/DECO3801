import React from 'react';
import ReactDOM from 'react-dom/client';  // from 'react-dom/client' import createRoot
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));  // create root
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
