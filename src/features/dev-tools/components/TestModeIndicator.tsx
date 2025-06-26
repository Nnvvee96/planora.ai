/**
 * Test Mode Indicator Component
 *
 * Displays a visible badge when the application is running in test/development mode.
 * Following Planora's architectural principles with feature-first organization.
 */

import React from "react";

/**
 * Test Mode Indicator props
 */
export interface TestModeIndicatorProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  customLabel?: string;
}

/**
 * Test Mode Indicator Component
 * Displays a visible badge when the application is running in test/development mode
 */
export const TestModeIndicator: React.FC<TestModeIndicatorProps> = ({
  position = "bottom-right",
  customLabel,
}) => {
  // Only show in development/test mode
  const isTestMode = import.meta.env.DEV || import.meta.env.MODE === "test";

  if (!isTestMode) return null;

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    "top-right": {
      top: "10px",
      right: "10px",
    },
    "top-left": {
      top: "10px",
      left: "10px",
    },
    "bottom-right": {
      bottom: "10px",
      right: "10px",
    },
    "bottom-left": {
      bottom: "10px",
      left: "10px",
    },
  };

  const styles: React.CSSProperties = {
    position: "fixed",
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 9999,
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    ...positionStyles[position],
  };

  return <div style={styles}>{customLabel || "TEST MODE"}</div>;
};
