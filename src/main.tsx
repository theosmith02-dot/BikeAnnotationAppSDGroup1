/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Application Entry Point                            */
/* -------------------------------------------------------------------------- */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Connects the React component tree to the <div id="root"> 
 * defined in your public/index.html file.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    "Failed to find the root element. Ensure <div id='root'></div> exists in your index.html"
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);