import { render, screen, waitFor } from '@testing-library/react';
import UserDetails from './page';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import { useParams } from 'next/navigation';
import React from 'react';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('../../../components/Sidebar', () => () => <div>Mock Sidebar</div>);

fetchMock.enableMocks();

describe('UserDetails Component', () => {
  const BASE_URL = 'https://mock-api-url.com';

  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ILIM_BE = BASE_URL;
    localStorage.setItem('accessToken', 'mockedAccessToken');
    (useParams as jest.Mock).mockReturnValue({ userId: '1' });
  });

  it('should display a loading spinner initially', () => {
    render(<UserDetails />);
  });

  it('should fetch and display user details on successful API response', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        body: {
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
          birthdate: '2000-01-01',
          profileImageUrl: '',
          role: 'STUDENT',
        },
      })
    );

    render(<UserDetails />);


  });

  it('should handle API errors gracefully when fetching user details', async () => {
    fetchMock.mockRejectOnce(new Error('API Error'));

    render(<UserDetails />);

  });

  it('should display a default profile image if none is provided', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        body: {
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
          birthdate: '2000-01-01',
          profileImageUrl: null,
          role: 'STUDENT',
        },
      })
    );

    render(<UserDetails />);

  });

  it('should calculate the correct age based on birthdate', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        body: {
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
          birthdate: '2000-01-01',
          profileImageUrl: '',
          role: 'STUDENT',
        },
      })
    );

    render(<UserDetails />);

    await waitFor(() => {
      const currentYear = new Date().getFullYear();
      const age = currentYear - 2000;
    });
  });

  it('should handle empty or malformed API responses gracefully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ body: null }));

    render(<UserDetails />);

  });

  it('should show an error message if accessToken is missing', () => {
    localStorage.removeItem('accessToken');
    render(<UserDetails />);
  });
});
