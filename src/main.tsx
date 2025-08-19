// Main Application Entry Point
// This file initializes the React application and sets up routing
// It's the first file that runs when the app starts

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/global.css';
import { BrowserRouter } from 'react-router-dom';

// Create the root element and render the application
// This is where React connects to the HTML element with id "root"
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* BrowserRouter provides routing functionality to the entire app */}
    <BrowserRouter
      future={{
        v7_startTransition: true,      // Enables React 18's concurrent features
        v7_relativeSplatPath: true     // Enables new routing features
      }}
    >
      {/* App component is the main component that contains all other components */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);