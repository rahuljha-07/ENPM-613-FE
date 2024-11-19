import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { toast } from 'react-toastify';
import ForgotPassword from './page';
 
// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
 
// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  ToastContainer: () => null,
}));
 
// Mock fetch
global.fetch = jest.fn();
 
describe('ForgotPassword Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };
 
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch.mockClear();
    toast.error.mockClear();
    toast.success.mockClear();
    mockRouter.push.mockClear();
  });
 
  it('renders forgot password form', () => {
    render(<ForgotPassword />);
 
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset OTP/i })).toBeInTheDocument(); });
  
  it('handles API error response', async () => {
    const errorMessage = 'Email not found';
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      })
    );
 
    render(<ForgotPassword />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset OTP/i });
 
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
    });
 
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
 
  it('handles network error', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );
 
    render(<ForgotPassword />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset OTP/i });
 
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
    });
 
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An error occurred. Please try again.');
    });
  });
 
  it('disables submit button during API call', async () => {
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve =>
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({}),
          });
        }, 100)
      )
    );
 
    render(<ForgotPassword />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset OTP/i });
 
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
    });
 
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Sending...');
 
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Send Reset OTP');
    });
  });
});