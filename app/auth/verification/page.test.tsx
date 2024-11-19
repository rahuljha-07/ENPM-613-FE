import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Verification from './page';
 
// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  }),
  useSearchParams: () => ({
    get: () => 'test@example.com'
  })
}));
 
describe('Verification Component', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' })
      })
    );
  });
 
  test('renders verification form and handles submission', async () => {
    render(<Verification />);
 
    // Check if main elements are rendered
    expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
 
    // Fill in verification code
    const input = screen.getByPlaceholderText('Enter the code sent to your email');
    fireEvent.change(input, { target: { value: '123456' } });
 
    // Submit form
    const submitButton = screen.getByText('Verify');
    fireEvent.click(submitButton);
 
    // Verify fetch was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});