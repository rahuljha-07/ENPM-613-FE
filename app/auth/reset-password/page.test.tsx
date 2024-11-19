import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { toast } from 'react-toastify';
import ResetPassword from './page';
 
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
 
// Mock Sidebar component
jest.mock('../../components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});
 
// Mock heroicons
jest.mock('@heroicons/react/24/solid', () => ({
  EyeIcon: () => <div data-testid="eye-icon" />,
  EyeSlashIcon: () => <div data-testid="eye-slash-icon" />,
}));
 
// Mock fetch
global.fetch = jest.fn();
 
describe('ResetPassword Component', () => {
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
 
 
  it('toggles password visibility when clicking eye icon', () => {
    render(<ResetPassword />);
 
    const passwordInput = screen.getByLabelText(/New Password/i);
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
 
    expect(passwordInput).toHaveAttribute('type', 'password');
 
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
 
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
 
  
  it('handles API error response', async () => {
    const errorMessage = 'Invalid confirmation code';
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ body: errorMessage }),
      })
    );
 
    render(<ResetPassword />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const codeInput = screen.getByLabelText(/Confirmation Code/i);
    const passwordInput = screen.getByLabelText(/New Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
 
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(codeInput, { target: { value: '123456' } });
      fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
      fireEvent.click(submitButton);
    });
 
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid confirmation code');
    });
  });
 
  it('handles network error', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );
 
    render(<ResetPassword />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const codeInput = screen.getByLabelText(/Confirmation Code/i);
    const passwordInput = screen.getByLabelText(/New Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
 
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(codeInput, { target: { value: '123456' } });
      fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
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
 
    render(<ResetPassword />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const codeInput = screen.getByLabelText(/Confirmation Code/i);
    const passwordInput = screen.getByLabelText(/New Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
 
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(codeInput, { target: { value: '123456' } });
      fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
      fireEvent.click(submitButton);
    });
 
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Resetting Password...');
 
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Reset Password');
    });
  });
 
  it('updates form data when typing in inputs', () => {
    render(<ResetPassword />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const codeInput = screen.getByLabelText(/Confirmation Code/i);
    const passwordInput = screen.getByLabelText(/New Password/i);
 
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
 
    expect(emailInput.value).toBe('test@example.com');
    expect(codeInput.value).toBe('123456');
    expect(passwordInput.value).toBe('newPassword123');
  });
});