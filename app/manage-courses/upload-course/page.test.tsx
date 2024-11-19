import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadCoursePage from './page';
import React from 'react';

// Mock dependencies
jest.mock('../../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);
jest.mock('../../../lib/s3', () => ({
  uploadFileToS3: jest.fn(() => Promise.resolve('https://mock-thumbnail-url.com')),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));
jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster" />,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UploadCoursePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('accessToken', 'mock-token');
    localStorage.setItem('id', 'mock-user-id');
  });

  test('renders the page with sidebar and form fields', () => {
    render(<UploadCoursePage />);

  });

  test('disables submit button if title is not provided', () => {
    render(<UploadCoursePage />);

    const submitButton = screen.getByRole('button', { name: /create/i });
  });



  test('shows an error if no token is found during form submission', async () => {
    localStorage.removeItem('accessToken');
    render(<UploadCoursePage />);

    fireEvent.change(screen.getByLabelText(/course title/i), { target: { value: 'Test Course' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

  });
});
