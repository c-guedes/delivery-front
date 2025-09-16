import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';

describe('useErrorHandler', () => {
  it('initializes with no error and not loading', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('sets and clears loading state', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('handles API errors correctly', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const apiError = {
      response: {
        data: {
          error: 'validation_error',
          message: 'Validation failed',
          validations: [
            { field: 'email', message: 'Email is required' }
          ]
        }
      }
    };
    
    act(() => {
      result.current.handleError(apiError);
    });
    
    expect(result.current.error).toEqual({
      error: 'validation_error',
      message: 'Validation failed',
      validations: [
        { field: 'email', message: 'Email is required' }
      ]
    });
  });

  it('handles network errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const networkError = {
      message: 'Network Error'
    };
    
    act(() => {
      result.current.handleError(networkError);
    });
    
    expect(result.current.error).toEqual({
      error: 'network_error',
      message: 'Network Error'
    });
  });

  it('handles unknown errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const unknownError = 'Some random error';
    
    act(() => {
      result.current.handleError(unknownError);
    });
    
    expect(result.current.error).toEqual({
      error: 'unknown_error',
      message: 'Ocorreu um erro inesperado'
    });
  });

  it('clears error when clearError is called', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    // Set an error first
    act(() => {
      result.current.handleError('test error');
    });
    
    expect(result.current.error).not.toBeNull();
    
    // Clear the error
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });
});
