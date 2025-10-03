import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "../../pages/Login";
import * as useLoginModule from "../../features/authentication/useLogin";
import { DarkModeProvider } from "../../context/DarkModeContext";

// Mock the useLogin hook
vi.mock("../../features/authentication/useLogin");

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("Login Page - Integration Tests", () => {
  let mockLogin;
  let queryClient;

  beforeEach(() => {
    mockLogin = vi.fn();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  // Helper function to render Login with all necessary providers
  const renderLogin = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </DarkModeProvider>
      </QueryClientProvider>
    );
  };

  // ==================== RENDERING TESTS ====================

  describe("Rendering", () => {
    it("renders all login page elements correctly", () => {
      // ARRANGE: Mock useLogin to return default state
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLogin,
        isLoading: false,
      });

      // ACT
      renderLogin();

      // ASSERT: All elements present
      expect(screen.getByRole("img")).toBeInTheDocument(); // Logo
      expect(screen.getByText(/Log in to your account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Log in/i })
      ).toBeInTheDocument();
    });

    it("renders form inputs with correct attributes", () => {
      // ARRANGE
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLogin,
        isLoading: false,
      });

      // ACT
      renderLogin();

      // ASSERT: Email input
      const emailInput = screen.getByLabelText(/Email address/i);
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("id", "email");
      expect(emailInput).toHaveAttribute("autoComplete", "username");

      // ASSERT: Password input
      const passwordInput = screen.getByLabelText(/Password/i);
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("id", "password");
      expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
    });
  });

  // ==================== USER INTERACTION TESTS ====================

  describe("User Interaction", () => {
    it("allows user to type email and password", () => {
      // ARRANGE
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLogin,
        isLoading: false,
      });

      renderLogin();

      // ACT: Type into email and password fields
      const emailInput = screen.getByLabelText(/Email address/i);
      const passwordInput = screen.getByLabelText(/Password/i);

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      // ASSERT: Values are updated
      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });

    it("prevents form submission when fields are empty", () => {
      // ARRANGE
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLogin,
        isLoading: false,
      });

      renderLogin();

      // ACT: Click login without filling fields
      const loginButton = screen.getByRole("button", { name: /Log in/i });
      fireEvent.click(loginButton);

      // ASSERT: Login function was NOT called
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("prevents form submission when email is missing", () => {
      // ARRANGE
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLogin,
        isLoading: false,
      });

      renderLogin();

      // ACT: Fill only password
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

      // ASSERT
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("prevents form submission when password is missing", () => {
      // ARRANGE
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLogin,
        isLoading: false,
      });

      renderLogin();

      // ACT: Fill only email
      fireEvent.change(screen.getByLabelText(/Email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

      // ASSERT
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  // ==================== LOGIN SUBMISSION TESTS ====================

  describe("Login Submission", () => {
    it("submits login with correct credentials", () => {
      // ARRANGE
      const mockLoginFn = vi.fn((credentials, options) => {
        // Simulate successful login by calling onSettled
        options.onSettled();
      });

      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLoginFn,
        isLoading: false,
      });

      renderLogin();

      // ACT: Fill form and submit
      fireEvent.change(screen.getByLabelText(/Email address/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

      // ASSERT: Login called with correct arguments
      expect(mockLoginFn).toHaveBeenCalledTimes(1);
      expect(mockLoginFn).toHaveBeenCalledWith(
        { email: "test@example.com", password: "password123" },
        expect.objectContaining({
          onSettled: expect.any(Function),
        })
      );
    });

    it("clears form fields after successful submission", async () => {
      // ARRANGE
      const mockLoginFn = vi.fn((credentials, options) => {
        // Simulate successful login
        options.onSettled();
      });

      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLoginFn,
        isLoading: false,
      });

      renderLogin();

      // ACT: Fill and submit form
      const emailInput = screen.getByLabelText(/Email address/i);
      const passwordInput = screen.getByLabelText(/Password/i);

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

      // ASSERT: Fields are cleared after onSettled
      await waitFor(() => {
        expect(emailInput).toHaveValue("");
        expect(passwordInput).toHaveValue("");
      });
    });
  });

  // ==================== LOADING STATE TESTS ====================

  describe("Loading State", () => {
    it("disables inputs and button while loading", () => {
      // ARRANGE: Mock loading state
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLogin,
        isLoading: true,
      });

      // ACT
      renderLogin();

      // ASSERT: All interactive elements disabled
      expect(screen.getByLabelText(/Email address/i)).toBeDisabled();
      expect(screen.getByLabelText(/Password/i)).toBeDisabled();
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it('shows spinner instead of "Log in" text while loading', () => {
      // ARRANGE
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLogin,
        isLoading: true,
      });

      // ACT
      renderLogin();

      // ASSERT: Button does not contain "Log in" text
      const button = screen.getByRole("button");
      expect(button).not.toHaveTextContent("Log in");
    });

    it("prevents form submission while loading", () => {
      // ARRANGE
      const mockLoginFn = vi.fn();
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLoginFn,
        isLoading: true,
      });

      renderLogin();

      // ACT: Try to click button while loading
      const button = screen.getByRole("button");
      fireEvent.click(button);

      // ASSERT: Login not called because button is disabled
      expect(mockLoginFn).not.toHaveBeenCalled();
    });
  });

  // ==================== ACCESSIBILITY TESTS ====================

  describe("Accessibility", () => {
    it("has accessible form labels", () => {
      // ARRANGE
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLogin,
        isLoading: false,
      });

      // ACT
      renderLogin();

      // ASSERT: Labels properly associated with inputs
      const emailInput = screen.getByLabelText(/Email address/i);
      const passwordInput = screen.getByLabelText(/Password/i);

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    it("has proper heading hierarchy", () => {
      // ARRANGE
      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLogin,
        isLoading: false,
      });

      // ACT
      renderLogin();

      // ASSERT: Heading exists (as="h4" renders as h4)
      expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
        /Log in to your account/i
      );
    });
  });

  // ==================== EDGE CASES ====================

  describe("Edge Cases", () => {
    it("handles special characters in email and password", () => {
      // ARRANGE
      const mockLoginFn = vi.fn((credentials, options) => {
        options.onSettled();
      });

      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLoginFn,
        isLoading: false,
      });

      renderLogin();

      // ACT: Use special characters
      const specialEmail = "test+tag@example.co.uk";
      const specialPassword = "P@ssw0rd!#$%";

      fireEvent.change(screen.getByLabelText(/Email address/i), {
        target: { value: specialEmail },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: specialPassword },
      });
      fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

      // ASSERT
      expect(mockLoginFn).toHaveBeenCalledWith(
        { email: specialEmail, password: specialPassword },
        expect.any(Object)
      );
    });

    it("handles whitespace in inputs (email trims, password preserves)", () => {
      // ARRANGE
      const mockLoginFn = vi.fn((credentials, options) => {
        options.onSettled();
      });

      vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
        login: mockLoginFn,
        isLoading: false,
      });

      renderLogin();

      // ACT: Add whitespace
      fireEvent.change(screen.getByLabelText(/Email address/i), {
        target: { value: "  test@example.com  " },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: "  password123  " },
      });
      fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

      // ASSERT: Email is trimmed automatically by browser (type="email"),
      // but password preserves whitespace
      expect(mockLoginFn).toHaveBeenCalledWith(
        {
          email: "test@example.com", // Trimmed by browser
          password: "  password123  ", // Preserved
        },
        expect.any(Object)
      );
    });
  });
});
