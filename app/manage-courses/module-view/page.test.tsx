import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditCoursePage from './page';
import React from 'react';

// Mock dependencies
jest.mock('../../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => 'mock-course-id'),
  })),
}));
jest.mock('../../../lib/s3', () => ({
  uploadFileToS3: jest.fn(() => Promise.resolve('mock-upload-url')),
}));

// Mock the Toaster
jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster" />,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('EditCoursePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('accessToken', 'mock-token');
  });

  test('renders the page with the sidebar and back button', async () => {
    render(<EditCoursePage />);

    
  });

  test('fetches course data and displays modules', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          body: {
            title: 'Mock Course',
            description: 'Mock Description',
            courseModules: [
              { id: 'module-1', title: 'Module 1', description: 'Module 1 Description' },
            ],
          },
        }),
      })
    );

    render(<EditCoursePage />);

    await waitFor(() => {
    });
  });


  test('handles course submission', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));

    render(<EditCoursePage />);

    fireEvent.click(screen.getByText('Submit'));
  });

  test('handles errors during fetch', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

    render(<EditCoursePage />);
  });
});
