/**
 * Auth Integration Test
 * 
 * This test verifies that the auth feature properly exposes its functionality
 * through integration hooks while maintaining architectural boundaries.
 */

import { renderHook } from '@testing-library/react-hooks';
import { useAuthIntegration } from '@/hooks/integration/useAuthIntegration';
import { createTestWrapper, RootState } from './testSetup';

describe('Auth Integration', () => {
  // Test that integration hook exposes the correct public API
  it('should expose auth state through integration hook', () => {
    // Given: A test wrapper with default state
    const wrapper = createTestWrapper();
    
    // When: Using the integration hook
    const { result } = renderHook(
      () => useAuthIntegration(), 
      { wrapper }
    );

    // Then: Should expose the expected public interface
    expect(result.current).toBeDefined();
    expect(result.current.isAuthenticated).toBeDefined();
    expect(result.current.loading).toBeDefined();
    expect(result.current.user).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });

  // Test with authenticated user state
  it('should provide user data when authenticated', () => {
    // Given: An authenticated user state
    const preloadedState: Partial<RootState> = {
      auth: {
        user: { id: '123', username: 'testuser', email: 'test@example.com' },
        isAuthenticated: true,
        loading: false
      }
    };
    
    // When: Using the integration hook with that state
    const { result } = renderHook(
      () => useAuthIntegration(), 
      { wrapper: createTestWrapper(preloadedState) }
    );
    
    // Then: Should correctly provide user information
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: '123', 
      username: 'testuser', 
      email: 'test@example.com'
    });
    expect(result.current.userName).toBe('testuser');
    expect(result.current.userInitial).toBe('T');
  });

  // Test that only public API is exposed
  it('should hide internal implementation details', () => {    
    // When: Using the integration hook
    const { result } = renderHook(
      () => useAuthIntegration(), 
      { wrapper: createTestWrapper() }
    );
    
    // Then: Should expose only the defined public interface
    const expectedKeys = ['isAuthenticated', 'loading', 'user', 'logout', 'userName', 'userInitial'];
    const actualKeys = Object.keys(result.current);
    
    expectedKeys.forEach(key => {
      expect(actualKeys).toContain(key);
    });
    
    // Should not expose internal implementation details
    expect(actualKeys).not.toContain('authState');
    expect(actualKeys).not.toContain('dispatch');
  });
});
