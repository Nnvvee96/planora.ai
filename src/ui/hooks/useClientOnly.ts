/**
 * useClientOnly Hook
 *
 * A custom hook for safely rendering components that access browser APIs.
 * This prevents hydration mismatches between server and client rendering.
 *
 * Following Planora's architectural principles of clean code and separation of concerns.
 */

import { useState, useEffect } from "react";

/**
 * Hook to ensure component only renders on the client side
 * Helps prevent hydration mismatches with window/browser APIs
 */
export function useClientOnly() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

// No default export - following Planora's architectural principles
