// Vite Configuration File
// This file configures Vite, the build tool that bundles and serves the React application
// Vite provides fast development server and optimized production builds

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration object
// This tells Vite how to build and serve the application
export default defineConfig({
  // Plugins - React plugin enables JSX and React features
  plugins: [react()],
})
