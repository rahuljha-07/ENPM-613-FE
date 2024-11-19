import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManagement from './page';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import React from 'react';
 
fetchMock.enableMocks();
 
jest.mock('../../components/Sidebar', () => () => <div>Mock Sidebar</div>);
 
describe('UserManagement Component', () => {
  const BASE_URL = 'https://mock-api-url.com';
 
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ILIM_BE = BASE_URL;
    localStorage.setItem('accessToken', 'mockedAccessToken');
  });
 
  it('should display a loading spinner initially', () => {
    render(<UserManagement />);
  });
 
  it('should fetch and display unblocked users for the active tab (Students by default)', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        body: [
          { id: '1', name: 'Alice', email: 'alice@example.com', role: 'STUDENT', blocked: false },
          { id: '2', name: 'Bob', email: 'bob@example.com', role: 'INSTRUCTOR', blocked: false },
        ],
      })
    );
 
    render(<UserManagement />);
 
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });
  });
 
  it('should handle API errors gracefully when fetching users', async () => {
    fetchMock.mockRejectOnce(new Error('API Error'));
 
    render(<UserManagement />);
 
    await waitFor(() => {
      expect(screen.getByText('Failed to connect to the API')).toBeInTheDocument();
    });
  });
 
  it('should filter users based on the selected tab (Instructor)', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        body: [
          { id: '1', name: 'Alice', email: 'alice@example.com', role: 'STUDENT', blocked: false },
          { id: '2', name: 'Bob', email: 'bob@example.com', role: 'INSTRUCTOR', blocked: false },
        ],
      })
    );
 
    render(<UserManagement />);
 
    await waitFor(() => {
      fireEvent.click(screen.getByText('Instructors'));
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });
  });
 
  it('should show a message when no users are found', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ body: [] }));
 
    render(<UserManagement />);
 
    await waitFor(() => {
      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });
  });
 
  it('should block a user and refresh the list', async () => {
    fetchMock.mockResponses(
      [
        JSON.stringify({
          body: [{ id: '1', name: 'Alice', email: 'alice@example.com', role: 'STUDENT', blocked: false }],
        }),
      ],
      [JSON.stringify({})]
    );
 
    render(<UserManagement />);
 
    await waitFor(() => {
      fireEvent.click(screen.getByText('Block'));
    });
 
  });
 
  it('should display user details in a modal and allow closing it', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        body: [{ id: '1', name: 'Alice', email: 'alice@example.com', role: 'STUDENT', blocked: false }],
      })
    );
 
    render(<UserManagement />);
 
    await waitFor(() => {
      fireEvent.click(screen.getByText('Alice'));
      expect(screen.getByText('User Details')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByText('User Details')).not.toBeInTheDocument();
    });
  });
 
  it('should display a default profile image if the user does not have one', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        body: [{ id: '1', name: 'Alice', email: 'alice@example.com', role: 'STUDENT', blocked: false, profileImageUrl: null }],
      })
    );
 
    render(<UserManagement />);
 
    await waitFor(() => {
      const profileImage = screen.getByAltText("Alice's profile");
      expect(profileImage).toHaveAttribute(
        'src',
        'https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg'
      );
    });
  });
});