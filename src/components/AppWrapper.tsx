/**
 * App Wrapper Component
 *
 * Wraps the main App component with React.StrictMode and error boundaries
 */

import React from "react";
import { App } from "../App";

export function AppWrapper() {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} 