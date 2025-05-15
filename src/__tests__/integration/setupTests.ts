/**
 * Integration test setup for Planora.ai
 * 
 * This file configures the testing environment for integration tests
 * that verify our architectural boundaries and cross-feature communication.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Automatically unmount and cleanup DOM after each test
afterEach(() => {
  cleanup();
});
