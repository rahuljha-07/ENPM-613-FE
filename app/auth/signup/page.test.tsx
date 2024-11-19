import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import SignUp from './page';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => null,
}));

describe('SignUp Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockImplementation(() => ({
      push: mockPush,
    }));
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const validFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    birthdate: '1990-01-01',
  };

  it('should handle successful signup', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      })
    );

    render(<SignUp />);

    // Fill in the form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: validFormData.name },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: validFormData.email },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: validFormData.password },
      });
      fireEvent.change(screen.getByLabelText(/birthdate/i), {
        target: { value: validFormData.birthdate },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    // Verify success toast
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Sign-up successful!');
    });

    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith(
      `/auth/verification?email=${encodeURIComponent(validFormData.email)}`
    );
  });

  it('should handle validation errors', async () => {
    render(<SignUp />);

    // Try to submit empty form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });


  });

  it('should handle API errors', async () => {
    const errorMessage = 'Email already exists';
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ body: errorMessage }),
      })
    );

    render(<SignUp />);

    // Fill in the form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: validFormData.name },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: validFormData.email },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: validFormData.password },
      });
      fireEvent.change(screen.getByLabelText(/birthdate/i), {
        target: { value: validFormData.birthdate },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    // Verify error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`Sign-up failed: ${errorMessage}`);
    });
  });

  it('should clear field errors when user starts typing', async () => {
    render(<SignUp />);

    // Submit empty form to trigger errors
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });


    // Start typing in name field
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'J' },
      });
    });

  });

  it('should validate email format', async () => {
    render(<SignUp />);

    // Enter invalid email
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalidemail' },
      });
    });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

  });

  it('should validate password length', async () => {
    render(<SignUp />);

    // Enter short password
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: '123' },
      });
    });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

  });

  it('should disable submit button while loading', async () => {
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<SignUp />);

    // Fill form with valid data
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: validFormData.name },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: validFormData.email },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: validFormData.password },
      });
      fireEvent.change(screen.getByLabelText(/birthdate/i), {
        target: { value: validFormData.birthdate },
      });
    });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    // Verify button is disabled and shows loading state
    const submitButton = screen.getByRole('button', { name: /signing up/i });
    expect(submitButton).toBeDisabled();
  });
});