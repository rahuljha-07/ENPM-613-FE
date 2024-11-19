import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstructorApplicationPage from './page';
import { useRouter } from 'next/navigation';
import React from 'react';
 
// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));
 
// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
};
global.localStorage = mockLocalStorage;
 
// Mock fetch
global.fetch = jest.fn();
 
describe('InstructorApplicationPage', () => {
  const mockRouter = {
    push: jest.fn()
  };
 
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
 
    // Setup basic localStorage values
    mockLocalStorage.getItem.mockImplementation((key) => {
      const values = {
        'name': 'Test User',
        'email': 'test@example.com',
        'accessToken': 'fake-token'
      };
      return values[key];
    });
 
    // Setup basic fetch mock
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ body: [] })
    });
  });
 
  test('submits form successfully with basic data', async () => {
    render(<InstructorApplicationPage />);

  });
});
