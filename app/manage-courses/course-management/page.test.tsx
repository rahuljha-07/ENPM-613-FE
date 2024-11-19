import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CourseManagementPage from './page';
import '@testing-library/jest-dom';

// Mock Sidebar component
jest.mock('../../components/Sidebar', () => () => <div>Mock Sidebar</div>);

// Mock next/navigation router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Toaster
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  Toaster: () => <div>Mock Toaster</div>,
}));

describe('CourseManagementPage Component', () => {
  const mockCourses = [
    {
      id: 1,
      title: 'Course 1',
      description: 'Description 1',
      status: 'DRAFT',
      thumbnailUrl: '/test-image-1.jpg',
    },
    {
      id: 2,
      title: 'Course 2',
      description: 'Description 2',
      status: 'WAIT_APPROVAL',
      thumbnailUrl: '/test-image-2.jpg',
    },
    {
      id: 3,
      title: 'Course 3',
      description: 'Description 3',
      status: 'PUBLISHED',
      thumbnailUrl: '/test-image-3.jpg',
    },
  ];

  // Mock fetch replacement
  let fetchMock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Replace fetch function in the component with a mock
    fetchMock = jest.fn((url) => {
      if (url.includes('/instructor/course/created')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ body: mockCourses }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    window.fetch = fetchMock; // Assign the mocked fetch to global fetch
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders CourseManagementPage and fetches courses', async () => {
    render(<CourseManagementPage />);
    expect(screen.getByText('Course Applications')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
      expect(screen.getByText('Course 3')).toBeInTheDocument();
    });
  });

  test('filters courses by status', async () => {
    render(<CourseManagementPage />);
    await waitFor(() => screen.getByText('Course Applications'));

    fireEvent.click(screen.getByText('Draft'));
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.queryByText('Course 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Course 3')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Waiting Approval'));
    await waitFor(() => {
      expect(screen.getByText('Course 2')).toBeInTheDocument();
      expect(screen.queryByText('Course 1')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Published'));
    await waitFor(() => {
      expect(screen.getByText('Course 3')).toBeInTheDocument();
    });
  });

  test('searches courses by title', async () => {
    render(<CourseManagementPage />);
    await waitFor(() => screen.getByPlaceholderText('Search courses...'));

    fireEvent.change(screen.getByPlaceholderText('Search courses...'), {
      target: { value: 'Course 1' },
    });
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.queryByText('Course 2')).not.toBeInTheDocument();
    });
  });

  test('handles empty course list gracefully', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ body: [] }),
    });

    render(<CourseManagementPage />);
    await waitFor(() => {
      expect(screen.getByText('No courses found.')).toBeInTheDocument();
    });
  });

  test('handles fetch errors gracefully', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Fetch error'));

    render(<CourseManagementPage />);
    await waitFor(() => {
      expect(screen.getByText('Mock Toaster')).toBeInTheDocument();
    });
  });
});
