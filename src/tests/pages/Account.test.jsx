import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DarkModeProvider } from "../../context/DarkModeContext";
import * as useUpdateUserModule from "../../features/authentication/useUpdateUser";
import * as useUserModule from "../../features/authentication/useUser";
import * as useUserDataModule from "../../features/authentication/useUserData";
import Account from "../../pages/Account";

// Mock the hooks
vi.mock("../../features/authentication/useUser");
vi.mock("../../features/authentication/useUserData");
vi.mock("../../features/authentication/useUpdateUser");

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

describe("Account Page - Integration Tests", () => {
  let mockUpdateUser;
  let queryClient;

  beforeEach(() => {
    mockUpdateUser = vi.fn();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  // Helper function to render Account with all necessary providers
  const renderAccount = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <MemoryRouter>
            <Account />
          </MemoryRouter>
        </DarkModeProvider>
      </QueryClientProvider>
    );
  };

  // ==================== RENDERING TESTS ====================

  describe("Rendering", () => {
    it("renders account page with all sections", () => {
      // ARRANGE: Mock user data
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateUser,
        isUpdating: false,
      });

      // ACT
      renderAccount();

      // ASSERT: All sections present (use getAllByText for multiple matches)
      expect(screen.getByText(/Update your account/i)).toBeInTheDocument();
      expect(screen.getByText(/Update user data/i)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /Update password/i })
      ).toBeInTheDocument();
    });

    it("renders update user data form with current values", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateUser,
        isUpdating: false,
      });

      // ACT
      renderAccount();

      // ASSERT: Form fields populated with current data
      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("emp123")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Computer Science")).toBeInTheDocument();
    });

    it("renders update password form fields", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateUser,
        isUpdating: false,
      });

      // ACT
      renderAccount();

      // ASSERT: Password form fields present
      expect(
        screen.getByLabelText(/Password \(min 8 characters\)/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
    });
  });

  // ==================== UPDATE USER DATA TESTS ====================

  describe("Update User Data Form", () => {
    it("allows user to edit their information", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateUser,
        isUpdating: false,
      });

      renderAccount();

      // ACT: Change full name
      const nameInput = screen.getByDisplayValue("John Doe");
      fireEvent.change(nameInput, { target: { value: "Jane Smith" } });

      // ASSERT
      expect(nameInput).toHaveValue("Jane Smith");
    });

    it("submits updated user data successfully", () => {
      // ARRANGE
      const mockUpdateFn = vi.fn();

      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateFn,
        isUpdating: false,
      });

      renderAccount();

      // ACT: Update name and submit
      const nameInput = screen.getByDisplayValue("John Doe");
      fireEvent.change(nameInput, { target: { value: "Jane Smith" } });

      // Get the first form's update button (Update account)
      const updateButton = screen.getByRole("button", {
        name: /Update account/i,
      });
      fireEvent.click(updateButton);

      // ASSERT
      expect(mockUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Jane Smith",
          employee_id: "emp123",
          department_name: "Computer Science",
        }),
        expect.any(Object)
      );
    });

    it("prevents submission with empty fields", () => {
      // ARRANGE
      const mockUpdateFn = vi.fn();

      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateFn,
        isUpdating: false,
      });

      renderAccount();

      // ACT: Clear name field and try to submit
      const nameInput = screen.getByDisplayValue("John Doe");
      fireEvent.change(nameInput, { target: { value: "   " } });

      const updateButton = screen.getByRole("button", {
        name: /Update account/i,
      });
      fireEvent.click(updateButton);

      // ASSERT: Update not called
      expect(mockUpdateFn).not.toHaveBeenCalled();
    });

    it("resets form to original values on cancel", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateUser,
        isUpdating: false,
      });

      renderAccount();

      // ACT: Change name then cancel
      const nameInput = screen.getByDisplayValue("John Doe");
      fireEvent.change(nameInput, { target: { value: "Jane Smith" } });
      expect(nameInput).toHaveValue("Jane Smith");

      // Get all cancel buttons and click the first one (user data form)
      const cancelButtons = screen.getAllByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButtons[0]);

      // ASSERT: Reverted to original value
      expect(nameInput).toHaveValue("John Doe");
    });

    it("disables form while updating", () => {
      // ARRANGE: Mock updating state
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateUser,
        isUpdating: true,
      });

      // ACT
      renderAccount();

      // ASSERT: Email is always disabled (read-only)
      expect(screen.getByDisplayValue("test@example.com")).toBeDisabled();

      // Other fields should also be disabled when updating
      expect(screen.getByDisplayValue("John Doe")).toBeDisabled();
      expect(screen.getByDisplayValue("emp123")).toBeDisabled();
    });
  });

  // ==================== UPDATE PASSWORD TESTS ====================

  describe("Update Password Form", () => {
    it("allows user to enter new password", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateUser,
        isUpdating: false,
      });

      renderAccount();

      // ACT: Enter new password
      const passwordInput = screen.getByLabelText(
        /Password \(min 8 characters\)/i
      );
      fireEvent.change(passwordInput, { target: { value: "newPassword123" } });

      // ASSERT
      expect(passwordInput).toHaveValue("newPassword123");
    });

    it("submits password update successfully", async () => {
      // ARRANGE
      const mockUpdateFn = vi.fn((data, options) => {
        options.onSuccess();
      });

      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateFn,
        isUpdating: false,
      });

      renderAccount();

      // ACT: Enter valid matching passwords
      const passwordInput = screen.getByLabelText(
        /Password \(min 8 characters\)/i
      );
      const confirmInput = screen.getByLabelText(/Confirm password/i);

      fireEvent.change(passwordInput, { target: { value: "newPassword123" } });
      fireEvent.change(confirmInput, { target: { value: "newPassword123" } });

      const passwordUpdateButton = screen.getByRole("button", {
        name: /Update password/i,
      });
      fireEvent.click(passwordUpdateButton);

      // ASSERT
      await waitFor(() => {
        expect(mockUpdateFn).toHaveBeenCalledWith(
          { password: "newPassword123" },
          expect.any(Object)
        );
      });
    });

    it("clears password form after successful update", async () => {
      // ARRANGE
      const mockUpdateFn = vi.fn((data, options) => {
        options.onSuccess();
      });

      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateFn,
        isUpdating: false,
      });

      renderAccount();

      // ACT: Submit password update
      const passwordInput = screen.getByLabelText(
        /Password \(min 8 characters\)/i
      );
      const confirmInput = screen.getByLabelText(/Confirm password/i);

      fireEvent.change(passwordInput, { target: { value: "newPassword123" } });
      fireEvent.change(confirmInput, { target: { value: "newPassword123" } });

      const updateButton = screen.getByRole("button", {
        name: /Update password/i,
      });
      fireEvent.click(updateButton);

      // ASSERT: Form cleared
      await waitFor(() => {
        expect(passwordInput).toHaveValue("");
        expect(confirmInput).toHaveValue("");
      });
    });
  });

  // ==================== ACCESSIBILITY TESTS ====================

  describe("Accessibility", () => {
    it("has proper heading hierarchy", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateUser,
        isUpdating: false,
      });

      // ACT
      renderAccount();

      // ASSERT: Main heading and section headings exist
      expect(
        screen.getByRole("heading", { name: /Update your account/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /Update user data/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /Update password/i })
      ).toBeInTheDocument();
    });

    it("has accessible form labels for password form", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { email: "test@example.com" },
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "emp123",
        username: "John Doe",
        department_name: "Computer Science",
        role: "Faculty",
      });

      vi.spyOn(useUpdateUserModule, "useUpdateUser").mockReturnValue({
        updateUser: mockUpdateUser,
        isUpdating: false,
      });

      // ACT
      renderAccount();

      // ASSERT: Password form fields have proper labels
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Password \(min 8 characters\)/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
    });
  });
});
