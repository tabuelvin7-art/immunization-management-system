import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './mobile.css';
import App from './App';
import GlobalBackground from './components/GlobalBackground';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalBackground />
    <App />
  </React.StrictMode>
);
