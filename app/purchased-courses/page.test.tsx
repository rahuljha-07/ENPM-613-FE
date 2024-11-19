import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import PurchasedCoursesPage from './page';
import { toast } from 'react-toastify';
import React from "react";
// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn()
  },
  ToastContainer: jest.fn(() => null)
}));

// Mock Sidebar component
jest.mock('../components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

describe('PurchasedCoursesPage', () => {
  // Mock data
  const mockCourses = [
    {
      id: 1,
      title: 'Test Course 1',
      instructorId: 'instructor1',
      createdAt: '2024-01-01T00:00:00.000Z',
      thumbnailUrl: 'https://example.com/thumbnail1.jpg',
      description: 'Test description 1'
    },
    {
      id: 2,
      title: 'Test Course 2',
      instructorId: 'instructor2',
      createdAt: '2024-01-02T00:00:00.000Z',
      thumbnailUrl: 'https://example.com/thumbnail2.jpg',
      description: 'Test description 2'
    }
  ];

  const mockRouter = {
    push: jest.fn()
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  it('displays courses when fetch is successful', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ body: mockCourses })
    });

    render(<PurchasedCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
      expect(screen.getByText('Test Course 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Purchased Courses')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('handles fetch error correctly', async () => {
    const errorMessage = 'Failed to fetch courses';
    global.fetch = jest.fn().mockRejectedValueOnce(new Error(errorMessage));

    render(<PurchasedCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('handles missing access token', async () => {
    window.localStorage.getItem.mockReturnValueOnce(null);
    
    render(<PurchasedCoursesPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Access token not found. Please log in.');
    });
  });

  it('navigates to course info page when clicking continue button', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ body: mockCourses })
    });

    render(<PurchasedCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    });

    const continueButtons = screen.getAllByText('Continue');
    fireEvent.click(continueButtons[0]);

    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringMatching(/^purchased-courses\/course-info\/1\?courseId=1$/)
    );
  });

  it('displays empty state message when no courses', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ body: [] })
    });

    render(<PurchasedCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('You have not purchased any courses yet.')).toBeInTheDocument();
    });
  });

  it('handles image loading errors', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ body: mockCourses })
    });

    render(<PurchasedCoursesPage />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      fireEvent.error(images[0]);
      expect(images[0].src).toBe('https://via.placeholder.com/64');
    });
  });
});