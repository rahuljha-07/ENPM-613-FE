import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import CourseDetailsPage from './page';
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

describe('CourseDetailsPage', () => {
  // Mock window.open
  const windowOpenMock = jest.fn();
  global.window.open = windowOpenMock;

  // Mock localStorage
  beforeEach(() => {
    // Properly mock localStorage with jest.fn()
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock router
    const mockRouter = {
      back: jest.fn(),
      push: jest.fn(),
    };
    useRouter.mockReturnValue(mockRouter);

    // Mock params
    useParams.mockReturnValue({ id: '1' });

    // Reset mocks
    jest.clearAllMocks();

    // Set default localStorage mock values
    localStorage.getItem.mockImplementation((key) => {
      const values = {
        'accessToken': 'mock-token',
        'role': 'STUDENT',
      };
      return values[key];
    });

    // Mock fetch
    global.fetch = jest.fn();
  });

  test('renders loading state initially', () => {
    global.fetch.mockImplementationOnce(() => 
      new Promise(() => {})
    );

    render(<CourseDetailsPage />);
    expect(screen.getByText('Loading course details...')).toBeInTheDocument();
  });

  test('renders course details successfully', async () => {
    const mockCourse = {
      id: '1',
      title: 'Test Course',
      description: 'Test Description',
      price: 99.99,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      modules: [
        {
          id: '1',
          title: 'Module 1',
          description: 'Module 1 Description',
        },
      ],
    };

    // Mock successful course details fetch
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ body: mockCourse }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ body: [] }),
        })
      );

    render(<CourseDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
      expect(screen.getByText(mockCourse.description)).toBeInTheDocument();
      expect(screen.getByText(`Price: $${mockCourse.price}`)).toBeInTheDocument();
    });
  });

  test('handles payment initiation successfully', async () => {
    const mockCourse = {
      id: '1',
      title: 'Test Course',
      description: 'Test Description',
      price: 99.99,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      modules: [
        {
          id: '1',
          title: 'Module 1',
          description: 'Module 1 Description',
        },
      ],
    };

    // Mock successful course details and purchase course fetches
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ body: mockCourse }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ body: [] }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ body: 'https://stripe.com/payment' }),
        })
      );

    render(<CourseDetailsPage />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Buy Course')).toBeInTheDocument();
    });

    // Click the buy button
    fireEvent.click(screen.getByText('Buy Course'));

    await waitFor(() => {
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://stripe.com/payment',
        '_blank'
      );
    });
  });

  test('handles fetch error gracefully', async () => {
    // Mock failed course details fetch
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error fetching course' }),
      })
    );

    render(<CourseDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load course details.')).toBeInTheDocument();
    });
  });

  test('displays correct content for admin user', async () => {
    const mockCourse = {
      id: '1',
      title: 'Test Course',
      description: 'Test Description',
      price: 99.99,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      modules: [
        {
          id: '1',
          title: 'Module 1',
          description: 'Module 1 Description',
        },
      ],
    };

    // Mock admin role
    localStorage.getItem.mockImplementation((key) => {
      const values = {
        'accessToken': 'mock-token',
        'role': 'ADMIN',
      };
      return values[key];
    });

    // Mock successful course details fetch
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ body: mockCourse }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ body: [] }),
        })
      );

    render(<CourseDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
      expect(screen.queryByText('Buy Course')).not.toBeInTheDocument(); // Admin shouldn't see buy button
    });
  });
});
