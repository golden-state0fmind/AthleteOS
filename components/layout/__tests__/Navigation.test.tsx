import React from 'react';
import { render, screen } from '@testing-library/react';
import { Navigation } from '../Navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

describe('Navigation', () => {
  it('renders all navigation items', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getByText('Nutrition')).toBeInTheDocument();
    expect(screen.getByText('Supplements')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('applies fixed bottom positioning', () => {
    const { container } = render(<Navigation />);
    const nav = container.querySelector('nav');
    
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('bottom-0');
  });

  it('meets minimum 44x44px touch target requirement', () => {
    render(<Navigation />);
    const links = screen.getAllByRole('link');
    
    links.forEach(link => {
      expect(link).toHaveClass('min-w-[44px]');
      expect(link).toHaveClass('min-h-[44px]');
    });
  });

  it('highlights active navigation item', () => {
    const { usePathname } = require('next/navigation');
    usePathname.mockReturnValue('/workouts');
    
    render(<Navigation />);
    const workoutsLink = screen.getByText('Workouts').closest('a');
    
    expect(workoutsLink).toHaveClass('text-accent');
    expect(workoutsLink).toHaveAttribute('aria-current', 'page');
  });

  it('provides accessible labels for all navigation items', () => {
    render(<Navigation />);
    
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Workouts')).toBeInTheDocument();
    expect(screen.getByLabelText('Nutrition')).toBeInTheDocument();
    expect(screen.getByLabelText('Supplements')).toBeInTheDocument();
    expect(screen.getByLabelText('Chat')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('uses dark theme styling', () => {
    const { container } = render(<Navigation />);
    const nav = container.querySelector('nav');
    
    expect(nav).toHaveClass('bg-background');
    expect(nav).toHaveClass('border-white/10');
  });
});
