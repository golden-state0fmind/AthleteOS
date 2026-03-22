import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';

// Mock Next.js router
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('renders with title', () => {
    render(<Header title="Test Page" />);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('shows back button by default', () => {
    render(<Header title="Test Page" />);
    expect(screen.getByLabelText('Go back')).toBeInTheDocument();
  });

  it('hides back button when showBackButton is false', () => {
    render(<Header title="Test Page" showBackButton={false} />);
    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument();
  });

  it('calls router.back() when back button is clicked', () => {
    render(<Header title="Test Page" />);
    const backButton = screen.getByLabelText('Go back');
    
    fireEvent.click(backButton);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('calls custom onBack handler when provided', () => {
    const customBack = jest.fn();
    render(<Header title="Test Page" onBack={customBack} />);
    const backButton = screen.getByLabelText('Go back');
    
    fireEvent.click(backButton);
    expect(customBack).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('meets minimum 44x44px touch target requirement for back button', () => {
    render(<Header title="Test Page" />);
    const backButton = screen.getByLabelText('Go back');
    
    expect(backButton).toHaveClass('min-w-[44px]');
    expect(backButton).toHaveClass('min-h-[44px]');
  });

  it('uses dark theme styling', () => {
    const { container } = render(<Header title="Test Page" />);
    const header = container.querySelector('header');
    
    expect(header).toHaveClass('bg-background');
    expect(header).toHaveClass('border-white/10');
  });

  it('applies sticky positioning', () => {
    const { container } = render(<Header title="Test Page" />);
    const header = container.querySelector('header');
    
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
  });
});
