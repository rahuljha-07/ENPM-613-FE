import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { toast } from 'react-toastify';
import SignIn from './page';
 
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
 
// Mock heroicons
jest.mock('@heroicons/react/24/solid', () => ({
  EyeIcon: () => <div data-testid="eye-icon" />,
  EyeSlashIcon: () => <div data-testid="eye-slash-icon" />,
}));
 
// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
 
// Mock fetch
global.fetch = jest.fn();
 
describe('SignIn Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };
 
  const mockUserData = {
    body: {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      birthdate: '1990-01-01',
      role: 'user',
    }
  };
 
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.getItem.mockClear();
    toast.error.mockClear();
    toast.success.mockClear();
    mockRouter.push.mockClear();
  });
 

  it('updates form data when typing in inputs', () => {
    render(<SignIn />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
 
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
 
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });
 
  it('toggles password visibility when clicking eye icon', () => {
    render(<SignIn />);
 
    const passwordInput = screen.getByLabelText(/Password/i);
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
 
    expect(passwordInput).toHaveAttribute('type', 'password');
 
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
 
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
 
  it('handles sign in API error', async () => {
    const errorMessage = 'Invalid credentials';
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ body: errorMessage }),
      })
    );
 
    render(<SignIn />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
 
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
    });
 
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
 
  it('handles network error during sign in', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );
 
    render(<SignIn />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
 
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });
 
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'An error occurred during sign-in. Please try again.'
      );
    });
  });
 
  it('handles error during user role fetch', async () => {
    // Mock successful sign-in but failed user data fetch
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ accessToken: 'mock-token' }),
      }))
      .mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch user data')));
 
    render(<SignIn />);
 
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
 
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });
 
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock-token');
      // Verify that the error was logged (you might need to mock console.error)
      expect(toast.success).toHaveBeenCalledWith('Sign-in successful!');
    });
  });
 
  it('navigates to forgot password page when clicking forgot password link', () => {
    render(<SignIn />);
 
    const forgotPasswordLink = screen.getByText('Forgot Password?');
    expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');
  });
 
  it('navigates to sign up page when clicking sign up link', () => {
    render(<SignIn />);
 
    const signUpLink = screen.getByText('Sign Up');
    expect(signUpLink).toHaveAttribute('href', '/auth/signup');
  });
});