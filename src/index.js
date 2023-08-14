import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot from "react-dom/client"
import App from './components/App.jsx'; // Replace 'App' with the main component of your application
// Use createRoot for React 18 or later


const root = document.getElementById('root');
createRoot(root).render(<App />);
