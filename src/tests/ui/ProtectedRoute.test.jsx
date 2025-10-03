import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as useUserModule from "../../features/authentication/useUser";
import * as useUserDataModule from "../../features/authentication/useUserData";
import ProtectedRoute from "../../ui/ProtectedRoute";

// Mock the dependencies
vi.mock("../features/authentication/useUser");
vi.mock("../features/authentication/useUserData");
vi.mock("../ui/Spinner", () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));

// Mock React Router's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe("ProtectedRoute - Integration Tests", () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderProtectedRoute = (
    allowedRoles = null,
    children = <div data-testid="protected-content">Protected Content</div>
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/test"]}>
          <ProtectedRoute allowedRoles={allowedRoles}>
            {children}
          </ProtectedRoute>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  // ==================== LOADING STATE TESTS ====================
  describe("Loading State", () => {
    it("does not render content while user authentication is loading", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: false,
      });

      // ACT
      renderProtectedRoute();

      // ASSERT: Should not render protected content or navigate
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ==================== AUTHENTICATION TESTS ====================
  describe("Authentication", () => {
    it("redirects to login when user is not authenticated", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: false,
      });

      // ACT
      renderProtectedRoute();

      // ASSERT
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
      });
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("does not redirect when user is authenticated and no role restrictions", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(); // No allowedRoles specified

      // ASSERT
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });
  });

  // ==================== ROLE-BASED ACCESS CONTROL (RBAC) TESTS ====================
  describe("Role-Based Access Control", () => {
    it("allows access when user has correct role", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(["Faculty", "Admin"]);

      // ASSERT
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("shows not authorized message when user has wrong role", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(["Admin", "Principal"]);

      // ASSERT
      expect(screen.getByText("Not authorized")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("redirects user to their role-based route when unauthorized", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(["CoE", "Principal"]);

      // ASSERT
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/faculty", {
          replace: true,
        });
      });
    });

    it("handles case-insensitive role matching", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "FACULTY", // Uppercase
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(["faculty", "admin"]); // Lowercase

      // ASSERT
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("handles multiple allowed roles", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(["Faculty", "CoE", "BoE"]);

      // ASSERT
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles null role gracefully", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(["Faculty"]);

      // ASSERT
      expect(screen.getByText("Not authorized")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("handles undefined role gracefully", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: undefined,
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(["Faculty"]);

      // ASSERT
      expect(screen.getByText("Not authorized")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("handles non-string role gracefully", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: 123, // Non-string role
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(["Faculty"]);

      // ASSERT
      expect(screen.getByText("Not authorized")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("handles empty allowedRoles array", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
        isLoading: false,
      });

      // ACT
      renderProtectedRoute([]); // Empty array

      // ASSERT
      expect(screen.getByText("Not authorized")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("handles no allowedRoles (null/undefined)", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(null); // No role restrictions

      // ASSERT
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ==================== NAVIGATION FLOW TESTS ====================
  describe("Navigation Flow", () => {
    it("does not redirect when user is loading", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: false,
      });

      // ACT
      renderProtectedRoute();

      // ASSERT: Should not redirect during loading
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("redirects to user's role route when unauthorized with valid role", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Principal",
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(["Faculty", "CoE"]);

      // ASSERT
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/principal", {
          replace: true,
        });
      });
    });

    it("does not redirect when unauthorized with invalid role type", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null, // Invalid role type
        isLoading: false,
      });

      // ACT
      renderProtectedRoute(["Faculty"]);

      // ASSERT: Should not attempt to navigate with null role
      expect(mockNavigate).not.toHaveBeenCalledWith(
        expect.stringContaining("/"),
        expect.anything()
      );
      expect(screen.getByText("Not authorized")).toBeInTheDocument();
    });
  });

  // ==================== CHILDREN RENDERING ====================
  describe("Children Rendering", () => {
    it("renders children when authorized", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, role: "authenticated" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
        isLoading: false,
      });

      const customChildren = (
        <div data-testid="custom-content">Custom Protected Content</div>
      );

      // ACT
      renderProtectedRoute(["Faculty"], customChildren);

      // ASSERT
      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
      expect(screen.getByText("Custom Protected Content")).toBeInTheDocument();
    });

    it("does not render children when not authenticated", () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: false,
      });

      const customChildren = (
        <div data-testid="custom-content">Should Not Render</div>
      );

      // ACT
      renderProtectedRoute(["Faculty"], customChildren);

      // ASSERT
      expect(screen.queryByTestId("custom-content")).not.toBeInTheDocument();
      expect(screen.queryByText("Should Not Render")).not.toBeInTheDocument();
    });
  });
});
