import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SupportPage from "./page";
import { ToastContainer } from "react-toastify";

// Mock Sidebar component
jest.mock("../components/Sidebar", () => () => <div data-testid="sidebar">Sidebar</div>);

// Mock localStorage
Storage.prototype.getItem = jest.fn((key) => (key === "accessToken" ? "mockAccessToken" : null));

// Mock fetch
global.fetch = jest.fn();

describe("SupportPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the SupportPage with form fields and submit button", () => {
    render(<SupportPage />);

    // Check for Sidebar
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();

    // Check for form elements
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("updates form fields on user input", () => {
    render(<SupportPage />);

    // Input data
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const prioritySelect = screen.getByLabelText(/priority/i);

    fireEvent.change(titleInput, { target: { value: "Test Title" } });
    fireEvent.change(descriptionInput, { target: { value: "Test Description" } });
    fireEvent.change(prioritySelect, { target: { value: "HIGH" } });

    expect(titleInput.value).toBe("Test Title");
    expect(descriptionInput.value).toBe("Test Description");
    expect(prioritySelect.value).toBe("HIGH");
  });



  it("shows error toast on failed API call", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "Server error" }),
    });

    render(
      <>
        <ToastContainer />
        <SupportPage />
      </>
    );

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Test Title" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Test Description" } });
    fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: "LOW" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error: server error/i)).toBeInTheDocument();
    });
  });

  it("disables the submit button during form submission", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    render(
      <>
        <ToastContainer />
        <SupportPage />
      </>
    );

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Test Title" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Test Description" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
