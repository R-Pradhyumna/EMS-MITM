import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as useUserDataModule from "../../features/authentication/useUserData";
import MainNav from "../../ui/MainNav";

// Mock the useUserData hook
vi.mock("../../features/authentication/useUserData");

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

describe("MainNav - Component Tests", () => {
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

  const renderMainNav = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MainNav />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  // ==================== RENDERING TESTS ====================
  describe("Rendering", () => {
    it("renders navigation list", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT: Navigation list should be present
      const navList = screen.getByRole("list");
      expect(navList).toBeInTheDocument();
    });

    it("renders Home link when not authenticated", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT: Only Home link visible
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
    });
  });

  // ==================== LOADING STATE TESTS ====================
  describe("Loading State", () => {
    it("shows only Home link while user data is loading", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: true,
      });

      // ACT
      renderMainNav();

      // ASSERT: Only Home link visible during loading
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.queryByText(/Faculty/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/CoE/i)).not.toBeInTheDocument();
    });
  });

  // ==================== ROLE-BASED RENDERING ====================
  describe("Role-Based Navigation", () => {
    it("shows Faculty link for Faculty role", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.getByText(/Faculty/i)).toBeInTheDocument();
      expect(screen.queryByText(/CoE/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/BoE/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Principal/i)).not.toBeInTheDocument();
    });

    it("shows CoE links for CoE role", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.getByText(/CoE/i)).toBeInTheDocument();
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Users/i)).toBeInTheDocument();
      expect(screen.queryByText(/Faculty/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/BoE/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Principal/i)).not.toBeInTheDocument();
    });

    it("shows BoE links for BoE role", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.getByText(/BoE/i)).toBeInTheDocument();
      expect(screen.getByText(/Users/i)).toBeInTheDocument();
      expect(screen.queryByText(/Faculty/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/CoE/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Principal/i)).not.toBeInTheDocument();
    });

    it("shows Principal links for Principal role", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Principal",
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.getByText(/Principal/i)).toBeInTheDocument();
      expect(screen.getByText(/Users/i)).toBeInTheDocument();
      expect(screen.queryByText(/Faculty/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/CoE/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/BoE/i)).not.toBeInTheDocument();
    });
  });

  // ==================== CASE-INSENSITIVE ROLE MATCHING ====================
  describe("Case-Insensitive Role Matching", () => {
    it("handles uppercase role correctly", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "FACULTY",
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT: Faculty link should still show
      expect(screen.getByText(/Faculty/i)).toBeInTheDocument();
    });

    it("handles mixed case role correctly", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT: CoE link should show
      expect(screen.getByText(/CoE/i)).toBeInTheDocument();
    });
  });

  // ==================== NAVIGATION LINKS ====================
  describe("Navigation Links", () => {
    it("renders correct href for Home link", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT
      const homeLink = screen.getByText(/Home/i).closest("a");
      expect(homeLink).toHaveAttribute("href", "/homepage");
    });

    it("renders correct href for Faculty link", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Faculty",
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT
      const facultyLink = screen.getByText(/Faculty/i).closest("a");
      expect(facultyLink).toHaveAttribute("href", "/faculty");
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles undefined role gracefully", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: undefined,
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT: Should only show Home
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.queryByText(/Faculty/i)).not.toBeInTheDocument();
    });

    it("handles empty string role gracefully", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "",
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT: Should only show Home
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.queryByText(/Faculty/i)).not.toBeInTheDocument();
    });

    it("handles unknown role gracefully", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "UnknownRole",
        isLoading: false,
      });

      // ACT
      renderMainNav();

      // ASSERT: Should only show Home
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.queryByText(/Faculty/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/CoE/i)).not.toBeInTheDocument();
    });
  });
});
