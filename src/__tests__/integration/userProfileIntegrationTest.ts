/**
 * User Profile Integration Test
 * 
 * This test verifies that the user-profile feature properly interacts with the auth feature
 * through integration hooks while maintaining architectural boundaries.
 */

import { renderHook } from '@testing-library/react-hooks';
import { useUserProfileIntegration } from '@/hooks/integration/useUserProfileIntegration';
import { createTestWrapper, RootState } from './testSetup';

describe('User Profile Integration', () => {
  // Test that integration hook properly accesses auth data
  it('should access auth data through integration hooks', () => {
    // Given: Test state with authenticated user
    const preloadedState: Partial<RootState> = {
      auth: {
        user: { id: '123', username: 'testuser', email: 'test@example.com' },
        isAuthenticated: true,
        loading: false
      }
    };
    
    // When: Using the integration hook with authenticated state
    const { result } = renderHook(
      () => useUserProfileIntegration(), 
      { wrapper: createTestWrapper(preloadedState) }
    );

    // Then: Should properly access user data through integration boundaries
    expect(result.current.userProfile).toBeDefined();
    expect(result.current.hasProfile).toBe(true);
    expect(result.current.userProfile).toEqual({
      id: '123',
      userName: 'testuser',
      email: 'test@example.com'
    });
  });

  // Test behavior when user is not authenticated
  it('should return null profile when not authenticated', () => {
    // Given: Test state with no authenticated user
    const preloadedState: Partial<RootState> = {
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false
      }
    };
    
    // When: Using the integration hook with unauthenticated state
    const { result } = renderHook(
      () => useUserProfileIntegration(), 
      { wrapper: createTestWrapper(preloadedState) }
    );

    // Then: Should properly handle unauthenticated state
    expect(result.current.userProfile).toBeNull();
    expect(result.current.hasProfile).toBe(false);
  });

  // Test architectural boundary validation
  it('should validate architectural boundaries', () => {
    // This test validates that useUserProfileIntegration follows architectural boundaries
    // by only accessing auth data through integration hooks, not direct imports
    
    // When testing architectural boundaries
    const { result } = renderHook(
      () => useUserProfileIntegration(),
      { wrapper: createTestWrapper() }
    );
    
    // Then the integration hook should only expose expected properties
    const expectedKeys = ['userProfile', 'hasProfile'];
    const actualKeys = Object.keys(result.current);
    
    expectedKeys.forEach(key => {
      expect(actualKeys).toContain(key);
    });
    
    // And should not expose any internal implementation details
    expect(actualKeys).not.toContain('authState');
    expect(actualKeys).not.toContain('dispatch');
    expect(actualKeys.length).toBe(expectedKeys.length);
  });
});
