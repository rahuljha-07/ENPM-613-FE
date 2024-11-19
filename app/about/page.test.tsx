import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Custom matchers
import AboutPage from './page';

// Mock the Sidebar component
jest.mock('../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

describe('AboutPage Component', () => {
  it('renders the sidebar', () => {
    render(<AboutPage />);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('displays the page title', () => {
    render(<AboutPage />);
    const title = screen.getByRole('heading', { level: 1, name: /About Us/i });
    expect(title).toBeInTheDocument();
  });

  it('renders all sections with proper headings', () => {
    render(<AboutPage />);

    const sectionHeadings = [
      /Our Platform/i,
      /Our Mission/i,
      /Meet Our Team/i,
      /Contact Us/i,
    ];

    sectionHeadings.forEach((heading) => {
      const section = screen.getByRole('heading', { level: 2, name: heading });
      expect(section).toBeInTheDocument();
    });
  });

  it('has a contact link with the correct email address', () => {
    render(<AboutPage />);
    const contactLink = screen.getByRole('link', { name: /support@ilim.com/i });
    expect(contactLink).toHaveAttribute('href', 'mailto:support@ilim.com');
  });
});
