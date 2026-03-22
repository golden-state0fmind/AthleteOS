import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays helper text when provided', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('applies error styles when error is present', () => {
    render(<Input error="Error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('meets minimum 44px height requirement', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('min-h-[44px]');
  });

  it('applies dark theme styles', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('bg-white/5');
    expect(input).toHaveClass('text-white');
  });
});
