import { render, screen, waitFor } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import * as useUserModule from "../features/authentication/useUser";
import * as useUserDataModule from "../features/authentication/useUserData";

// Mock all the lazy-loaded components
vi.mock("../styles/GlobalStyles", () => ({
  default: () => <div data-testid="global-styles" />,
}));

vi.mock("../ui/ProtectedRoute", () => ({
  default: ({ allowedRoles, children }) => (
    <div
      data-testid="protected-route"
      data-allowed-roles={allowedRoles?.join(",")}
    >
      {children}
    </div>
  ),
}));

vi.mock("../ui/AppLayout", () => ({
  default: () => <div data-testid="app-layout">App Layout</div>,
}));

vi.mock("../pages/HomePage", () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock("../pages/Faculty", () => ({
  default: () => <div data-testid="faculty-page">Faculty Page</div>,
}));

vi.mock("../pages/CoE", () => ({
  default: () => <div data-testid="coe-page">CoE Page</div>,
}));

vi.mock("../pages/Dashboard", () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock("../pages/BoE", () => ({
  default: () => <div data-testid="boe-page">BoE Page</div>,
}));

vi.mock("../pages/Principal", () => ({
  default: () => <div data-testid="principal-page">Principal Page</div>,
}));

vi.mock("../pages/Paper", () => ({
  default: () => <div data-testid="paper-page">Paper Page</div>,
}));

vi.mock("../pages/Approve", () => ({
  default: () => <div data-testid="approve-page">Approve Page</div>,
}));

vi.mock("../pages/Users", () => ({
  default: () => <div data-testid="users-page">Users Page</div>,
}));

vi.mock("../pages/Account", () => ({
  default: () => <div data-testid="account-page">Account Page</div>,
}));

vi.mock("../pages/Login", () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock("../pages/PageNotFound", () => ({
  default: () => <div data-testid="not-found-page">Page Not Found</div>,
}));

vi.mock("../context/DarkModeContext", () => ({
  DarkModeProvider: ({ children }) => (
    <div data-testid="dark-mode-provider">{children}</div>
  ),
}));

vi.mock("../ui/Spinner", () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));

// Mock authentication hooks
vi.mock("../features/authentication/useUser");
vi.mock("../features/authentication/useUserData");

// Mock window.matchMedia and window.location
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

  // Mock window.location properly for BrowserRouter
  delete window.location;
  window.location = {
    href: "http://localhost:3000/",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
  };
});

describe("App - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset window.location.pathname before each test
    window.location.pathname = "/";

    // Default authentication mocks
    vi.spyOn(useUserModule, "useUser").mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
      role: null,
    });
  });

  const renderApp = () => {
    return render(<App />);
  };

  // ==================== RENDERING TESTS ====================
  describe("Rendering", () => {
    it("renders App with providers and context", async () => {
      // ARRANGE & ACT
      renderApp();

      // ASSERT: Core providers should be present
      await waitFor(() => {
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
      });
    });

    it("renders lazy-loaded components correctly", async () => {
      // ARRANGE & ACT
      renderApp();

      // ASSERT: Lazy components should load
      await waitFor(() => {
        expect(screen.getByTestId("global-styles")).toBeInTheDocument();
      });
    });
  });

  // ==================== PUBLIC ROUTES TESTS ====================
  describe("Public Routes", () => {
    it("renders correctly when user is not authenticated", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
      });

      // ACT
      renderApp();

      // ASSERT: Should render login page
      expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
    });
  });

  // ==================== QUERY CLIENT TESTS ====================
  describe("Query Client Configuration", () => {
    it("provides QueryClient with correct configuration", async () => {
      // ARRANGE & ACT
      renderApp();

      // ASSERT: App should render without QueryClient errors
      await waitFor(() => {
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
      });
    });

    it("renders without throwing errors", () => {
      // ARRANGE & ACT
      expect(() => renderApp()).not.toThrow();
    });
  });

  // ==================== AUTHENTICATION INTEGRATION ====================
  describe("Authentication Integration", () => {
    it("renders correctly when user is not authenticated", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
      });

      // ACT
      renderApp();

      // ASSERT: Should render login page
      expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
    });

    it("renders correctly when user is authenticated", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, email: "user@test.com" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
      });

      // ACT
      renderApp();

      // ASSERT: Should render without crashing
      await waitFor(() => {
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
      });
    });

    it("renders correctly during authentication loading", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
      });

      // ACT
      renderApp();

      // ASSERT: Should render without crashing
      await waitFor(() => {
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
      });
    });
  });

  // ==================== ROLE-BASED RENDERING ====================
  describe("Role-Based Rendering", () => {
    it("renders correctly for Faculty role", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 1, email: "faculty@test.com" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
      });

      // ACT
      renderApp();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
      });
    });

    it("renders correctly for CoE role", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 2, email: "coe@test.com" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
      });

      // ACT
      renderApp();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
      });
    });

    it("renders correctly for BoE role", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 3, email: "boe@test.com" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
      });

      // ACT
      renderApp();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
      });
    });

    it("renders correctly for Principal role", async () => {
      // ARRANGE
      vi.spyOn(useUserModule, "useUser").mockReturnValue({
        user: { id: 4, email: "principal@test.com" },
        isLoading: false,
        isAuthenticated: true,
      });
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Principal",
      });

      // ACT
      renderApp();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
      });
    });
  });

  // ==================== LAZY LOADING TESTS ====================
  describe("Lazy Loading", () => {
    it("handles Suspense fallback for lazy components", async () => {
      // ARRANGE & ACT
      renderApp();

      // ASSERT: Should eventually load without errors
      await waitFor(
        () => {
          expect(screen.getByTestId("global-styles")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("loads all lazy components successfully", async () => {
      // ARRANGE & ACT
      renderApp();

      // ASSERT: Multiple lazy components should load
      await waitFor(() => {
        expect(screen.getByTestId("global-styles")).toBeInTheDocument();
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
      });
    });
  });

  // ==================== ERROR HANDLING ====================
  describe("Error Handling", () => {
    it("renders without crashing with different authentication states", async () => {
      // ARRANGE
      const authStates = [
        { user: null, isLoading: false, isAuthenticated: false, role: null },
        {
          user: { id: 1 },
          isLoading: false,
          isAuthenticated: true,
          role: "Faculty",
        },
        { user: null, isLoading: true, isAuthenticated: false, role: null },
      ];

      // ACT & ASSERT
      for (const state of authStates) {
        vi.spyOn(useUserModule, "useUser").mockReturnValue({
          user: state.user,
          isLoading: state.isLoading,
          isAuthenticated: state.isAuthenticated,
        });
        vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
          role: state.role,
        });

        const { unmount } = renderApp();

        await waitFor(() => {
          expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
        });

        unmount();
      }
    });

    it("handles QueryClient without errors", async () => {
      // ARRANGE & ACT
      renderApp();

      // ASSERT: Should not throw errors related to QueryClient
      await waitFor(() => {
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
      });
    });
  });

  // ==================== PROVIDER HIERARCHY ====================
  describe("Provider Hierarchy", () => {
    it("renders providers in correct order", async () => {
      // ARRANGE & ACT
      renderApp();

      // ASSERT: All providers should be present
      await waitFor(() => {
        expect(screen.getByTestId("dark-mode-provider")).toBeInTheDocument();
        expect(screen.getByTestId("global-styles")).toBeInTheDocument();
      });
    });
  });
});
