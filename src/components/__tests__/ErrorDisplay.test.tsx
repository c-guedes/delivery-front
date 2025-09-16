import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorDisplay from '../ErrorDisplay';

describe('ErrorDisplay', () => {
  it('renders error message when error is provided', () => {
    const error = { error: 'authentication_error', message: 'Test error message' };
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders validation errors when validations array is provided', () => {
    const error = {
      error: 'validation_error',
      message: 'Validation failed',
      validations: [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password is too short' }
      ]
    };
    
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is too short')).toBeInTheDocument();
  });

  it('does not render anything when no error is provided', () => {
    const { container } = render(<ErrorDisplay error={null} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders general error message for other error types', () => {
    const error = { error: 'server_error', message: 'Internal server error' };
    
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Internal server error')).toBeInTheDocument();
  });
});
