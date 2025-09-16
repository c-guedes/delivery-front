import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Toast from '../Toast';

// Mock dos ícones do Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  CheckIcon: () => <div data-testid="check-icon" />
}));

describe('Toast', () => {
  it('renders toast message when visible', () => {
    render(
      <Toast
        message="Test message"
        isVisible={true}
        onClose={() => {}}
      />
    );
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    const { container } = render(
      <Toast
        message="Test message"
        isVisible={false}
        onClose={() => {}}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('displays toast with custom duration prop', () => {
    const onClose = jest.fn();
    
    render(
      <Toast
        message="Custom duration"
        isVisible={true}
        onClose={onClose}
        duration={5000}
      />
    );
    
    expect(screen.getByText('Custom duration')).toBeInTheDocument();
    // Should not close immediately
    expect(onClose).not.toHaveBeenCalled();
  });

  it('uses default duration when not specified', () => {
    const onClose = jest.fn();
    
    render(
      <Toast
        message="Default duration"
        isVisible={true}
        onClose={onClose}
      />
    );
    
    expect(screen.getByText('Default duration')).toBeInTheDocument();
    // Should not close immediately
    expect(onClose).not.toHaveBeenCalled();
  });
});
