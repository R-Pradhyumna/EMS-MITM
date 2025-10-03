import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DarkModeProvider } from "../../context/DarkModeContext";
import * as useUserDataModule from "../../features/authentication/useUserData";
import * as useGetFacultiesModule from "../../features/boe/useGetFaculties";
import * as useGetUsersModule from "../../features/coe/useGetUsers";
import * as useGetCoEModule from "../../features/principal/useGetCoE";
import Users from "../../pages/Users";

// Mock the hooks
vi.mock("../../features/authentication/useUserData");
vi.mock("../../features/boe/useGetFaculties");
vi.mock("../../features/coe/useGetUsers");
vi.mock("../../features/principal/useGetCoE");

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

describe("Users Page - Integration Tests", () => {
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

  const renderUsers = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <MemoryRouter>
            <Users />
          </MemoryRouter>
        </DarkModeProvider>
      </QueryClientProvider>
    );
  };

  // ==================== RENDERING TESTS ====================
  describe("Rendering", () => {
    it("renders Users Portal heading", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
        isLoading: false,
      });
      vi.spyOn(useGetFacultiesModule, "useGetFaculties").mockReturnValue({
        users: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderUsers();

      // ASSERT
      expect(screen.getByText(/Users Portal/i)).toBeInTheDocument();
    });

    it("renders table headers when data is loaded", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
        isLoading: false,
      });
      vi.spyOn(useGetFacultiesModule, "useGetFaculties").mockReturnValue({
        users: [
          {
            id: 1,
            employee_id: "EMP001",
            username: "john.doe",
            department_name: "Computer Science",
            role: "Faculty",
          },
        ],
        isLoading: false,
        count: 1,
      });

      // ACT
      renderUsers();

      // ASSERT: Table headers present
      expect(screen.getByText(/Employee ID/i)).toBeInTheDocument();
      expect(screen.getByText(/Username/i)).toBeInTheDocument();
      expect(screen.getByText(/Department Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Role/i)).toBeInTheDocument();
    });
  });

  // ==================== LOADING STATE TESTS ====================
  describe("Loading State", () => {
    it("shows loading state while fetching user role", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: true,
      });
      vi.spyOn(useGetFacultiesModule, "useGetFaculties").mockReturnValue({
        users: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderUsers();

      // ASSERT: No table data displayed yet (still loading)
      expect(screen.queryByText(/Employee ID/i)).not.toBeInTheDocument();

      // Heading should still be visible during loading
      expect(screen.getByText(/Users Portal/i)).toBeInTheDocument();
    });

    it("shows loading state while fetching users data", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
        isLoading: false,
      });
      vi.spyOn(useGetFacultiesModule, "useGetFaculties").mockReturnValue({
        users: [],
        isLoading: true,
        count: 0,
      });

      // ACT
      renderUsers();

      // ASSERT: No table data displayed yet (still loading)
      expect(screen.queryByText(/Employee ID/i)).not.toBeInTheDocument();

      // Heading should still be visible during loading
      expect(screen.getByText(/Users Portal/i)).toBeInTheDocument();
    });
  });

  // ==================== EMPTY STATE TESTS ====================
  describe("Empty State", () => {
    it("shows empty message when no users available", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
        isLoading: false,
      });
      vi.spyOn(useGetFacultiesModule, "useGetFaculties").mockReturnValue({
        users: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderUsers();

      // ASSERT: Empty state message
      expect(screen.getByText(/No users could be found/i)).toBeInTheDocument();
    });
  });

  // ==================== DATA DISPLAY TESTS - BoE ROLE ====================
  describe("Data Display - BoE Role", () => {
    it("displays faculty users for BoE role", () => {
      // ARRANGE
      const mockUsers = [
        {
          id: 1,
          employee_id: "EMP001",
          username: "john.doe",
          department_name: "Computer Science",
          role: "Faculty",
        },
        {
          id: 2,
          employee_id: "EMP002",
          username: "jane.smith",
          department_name: "Information Science",
          role: "Faculty",
        },
      ];

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
        isLoading: false,
      });
      vi.spyOn(useGetFacultiesModule, "useGetFaculties").mockReturnValue({
        users: mockUsers,
        isLoading: false,
        count: 2,
      });

      // ACT
      renderUsers();

      // ASSERT: User data displayed
      expect(screen.getByText(/EMP001/i)).toBeInTheDocument();
      expect(screen.getByText(/john.doe/i)).toBeInTheDocument();
      expect(screen.getByText(/EMP002/i)).toBeInTheDocument();
      expect(screen.getByText(/jane.smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Computer Science/i)).toBeInTheDocument();
      expect(screen.getByText(/Information Science/i)).toBeInTheDocument();
    });

    it("displays correct count of faculty users", () => {
      // ARRANGE
      const mockUsers = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        employee_id: `EMP00${i + 1}`,
        username: `user${i + 1}`,
        department_name: "Computer Science",
        role: "Faculty",
      }));

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
        isLoading: false,
      });
      vi.spyOn(useGetFacultiesModule, "useGetFaculties").mockReturnValue({
        users: mockUsers,
        isLoading: false,
        count: 5,
      });

      // ACT
      renderUsers();

      // ASSERT: All users displayed
      mockUsers.forEach((user) => {
        expect(screen.getByText(user.employee_id)).toBeInTheDocument();
        expect(screen.getByText(user.username)).toBeInTheDocument();
      });
    });
  });

  // ==================== DATA DISPLAY TESTS - CoE ROLE ====================
  describe("Data Display - CoE Role", () => {
    it("displays users for CoE role", () => {
      // ARRANGE
      const mockUsers = [
        {
          id: 1,
          employee_id: "EMP101",
          username: "coe.user1",
          department_name: "Computer Science",
          role: "Faculty",
        },
        {
          id: 2,
          employee_id: "EMP102",
          username: "coe.user2",
          department_name: "Electronics",
          role: "Faculty",
        },
      ];

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
        isLoading: false,
      });
      vi.spyOn(useGetUsersModule, "useGetUsers").mockReturnValue({
        users: mockUsers,
        isLoading: false,
        count: 2,
      });

      // ACT
      renderUsers();

      // ASSERT: CoE user data displayed
      expect(screen.getByText(/EMP101/i)).toBeInTheDocument();
      expect(screen.getByText(/coe.user1/i)).toBeInTheDocument();
      expect(screen.getByText(/EMP102/i)).toBeInTheDocument();
      expect(screen.getByText(/coe.user2/i)).toBeInTheDocument();
    });
  });

  // ==================== DATA DISPLAY TESTS - Principal ROLE ====================
  describe("Data Display - Principal Role", () => {
    it("displays CoE users for Principal role", () => {
      // ARRANGE
      const mockUsers = [
        {
          id: 1,
          employee_id: "EMP201",
          username: "principal.user1",
          department_name: "Administration",
          role: "CoE",
        },
      ];

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Principal",
        isLoading: false,
      });
      vi.spyOn(useGetCoEModule, "useGetCoE").mockReturnValue({
        users: mockUsers,
        isLoading: false,
        count: 1,
      });

      // ACT
      renderUsers();

      // ASSERT: Principal view user data displayed
      expect(screen.getByText(/EMP201/i)).toBeInTheDocument();
      expect(screen.getByText(/principal.user1/i)).toBeInTheDocument();
      expect(screen.getByText(/Administration/i)).toBeInTheDocument();
    });
  });

  // ==================== PAGINATION TESTS ====================
  describe("Pagination", () => {
    it("displays pagination when there are multiple pages", () => {
      // ARRANGE: More users than fit on one page
      const mockUsers = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        employee_id: `EMP00${i + 1}`,
        username: `user${i + 1}`,
        department_name: "Computer Science",
        role: "Faculty",
      }));

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
        isLoading: false,
      });
      vi.spyOn(useGetFacultiesModule, "useGetFaculties").mockReturnValue({
        users: mockUsers,
        isLoading: false,
        count: 25, // More than page size
      });

      // ACT
      renderUsers();

      // ASSERT: Pagination controls present
      expect(
        screen.getByRole("button", { name: /previous/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    });
  });

  // ==================== ROLE SWITCHING TESTS ====================
  describe("Role Switching", () => {
    it("uses correct hook for BoE role", () => {
      // ARRANGE
      const getFacultiesSpy = vi
        .spyOn(useGetFacultiesModule, "useGetFaculties")
        .mockReturnValue({
          users: [],
          isLoading: false,
          count: 0,
        });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
        isLoading: false,
      });

      // ACT
      renderUsers();

      // ASSERT: BoE hook was called
      expect(getFacultiesSpy).toHaveBeenCalled();
    });

    it("uses correct hook for CoE role", () => {
      // ARRANGE
      const getUsersSpy = vi
        .spyOn(useGetUsersModule, "useGetUsers")
        .mockReturnValue({
          users: [],
          isLoading: false,
          count: 0,
        });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
        isLoading: false,
      });

      // ACT
      renderUsers();

      // ASSERT: CoE hook was called
      expect(getUsersSpy).toHaveBeenCalled();
    });

    it("uses correct hook for Principal role", () => {
      // ARRANGE
      const getCoESpy = vi.spyOn(useGetCoEModule, "useGetCoE").mockReturnValue({
        users: [],
        isLoading: false,
        count: 0,
      });

      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "Principal",
        isLoading: false,
      });

      // ACT
      renderUsers();

      // ASSERT: Principal hook was called
      expect(getCoESpy).toHaveBeenCalled();
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles unknown role gracefully", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "UnknownRole",
        isLoading: false,
      });

      // ACT
      renderUsers();

      // ASSERT: Page renders without crashing
      expect(screen.getByText(/Users Portal/i)).toBeInTheDocument();
    });

    it("handles null role gracefully", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: null,
        isLoading: false,
      });

      // ACT
      renderUsers();

      // ASSERT: Page renders without crashing
      expect(screen.getByText(/Users Portal/i)).toBeInTheDocument();
    });
  });
});
