import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DarkModeProvider } from "../../context/DarkModeContext";
import * as useUserDataModule from "../../features/authentication/useUserData";
import * as useUserData from "../../features/authentication/useUserData";
import * as useBPaperModule from "../../features/boe/useBPaper";
import * as useCPaperModule from "../../features/coe/useCPaper";
import * as useApprovalModule from "../../features/paperActivities/useApproval";
import Approve from "../../pages/Approve";

// Mock the hooks
vi.mock("../../features/authentication/useUserData");
vi.mock("../../features/coe/useCPaper");
vi.mock("../../features/boe/useBPaper");
vi.mock("../../features/paperActivities/useApproval");
vi.mock("../../hooks/useMoveBack", () => ({
  useMoveBack: () => vi.fn(),
}));

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

describe("Approve Page - Integration Tests", () => {
  let queryClient;
  let mockMutate;

  beforeEach(() => {
    mockMutate = vi.fn();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderApprove = (initialRoute = "/approve/123") => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
              <Route path="/approve/:id" element={<Approve />} />
            </Routes>
          </MemoryRouter>
        </DarkModeProvider>
      </QueryClientProvider>
    );
  };

  // ==================== AUTHORISATION TESTS ====================
  describe("Authorization", () => {
    it("shows loading spinner while fetching user data", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "",
        isLoading: true,
        employee_id: "",
        username: "",
        department_name: "",
      });

      // ACT
      renderApprove();

      // ASSERT
      const spinnerDiv = document.querySelector(".sc-crozmw");
      expect(spinnerDiv).toBeInTheDocument();
    });

    it("shows PageNotFound component for unauthorized roles", () => {
      vi.spyOn(useUserData, "useUserData").mockReturnValue({
        role: "Faculty",
        isLoading: false,
        employee_id: "emp123",
        username: "John Doe",
        department_name: "CS",
      });

      render(
        <QueryClientProvider client={queryClient}>
          <DarkModeProvider>
            <MemoryRouter initialEntries={["/approve/123"]}>
              <Routes>
                <Route path="/approve/:id" element={<Approve />} />
              </Routes>
            </MemoryRouter>
          </DarkModeProvider>
        </QueryClientProvider>
      );

      expect(screen.getByText(/Page not found/i)).toBeInTheDocument(); // or any unique text from your PageNotFound component
    });

    it("allows CoE role to access page", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
        isLoading: false,
        employee_id: "emp123",
        username: "CoE User",
        department_name: "Admin",
      });

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 123,
          subject_code: "CS101",
          subject_name: "Data Structures",
          status: "Pending",
        },
        isLoading: false,
        error: null,
      });

      vi.spyOn(useApprovalModule, "useApproval").mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
      });

      // ACT
      renderApprove();

      // ASSERT: Page loads with paper info (avoid checking CS101 - it appears twice)
      expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
      expect(screen.getByText(/Paper 123/i)).toBeInTheDocument();
    });

    it("allows BoE role to access page", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "BoE",
        isLoading: false,
        employee_id: "emp456",
        username: "BoE User",
        department_name: "Admin",
      });

      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: {
          id: 123,
          subject_code: "CS101",
          subject_name: "Data Structures",
          status: "Approved",
        },
        isLoading: false,
        error: null,
      });

      vi.spyOn(useApprovalModule, "useApproval").mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
      });

      // ACT
      renderApprove();

      // ASSERT: Avoid checking CS101, check unique text
      expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
      expect(screen.getByText(/Paper 123/i)).toBeInTheDocument();
    });
  });

  // ==================== DISPLAY TESTS ====================
  describe("Paper Display", () => {
    it("shows loading spinner while fetching paper data", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
        isLoading: false,
        employee_id: "emp123",
        username: "CoE User",
        department_name: "Admin",
      });

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: null,
        isLoading: true,
        error: null,
      });

      // ACT
      renderApprove();

      // ASSERT
      const spinnerDiv = document.querySelector(".sc-crozmw");
      expect(spinnerDiv).toBeInTheDocument();
    });

    it("displays paper details when loaded", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
        isLoading: false,
        employee_id: "emp123",
        username: "CoE User",
        department_name: "Admin",
      });

      const mockPaper = {
        id: 123,
        subject_code: "CS101",
        subject_name: "Data Structures",
        semester: "3",
        academic_year: 2024,
        status: "Pending",
        created_at: new Date().toISOString(),
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      vi.spyOn(useApprovalModule, "useApproval").mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
      });

      // ACT
      renderApprove();

      // ASSERT: Paper details displayed (use getAllByText for duplicates)
      expect(screen.getByText(/Paper 123/i)).toBeInTheDocument();

      // CS101 appears multiple times, so just verify it exists
      const cs101Elements = screen.getAllByText(/CS101/i);
      expect(cs101Elements.length).toBeGreaterThan(0);

      expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending/i)).toBeInTheDocument();
    });

    it("displays status badge with correct paper status", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
        isLoading: false,
        employee_id: "emp123",
        username: "CoE User",
        department_name: "Admin",
      });

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 123,
          subject_code: "CS101",
          subject_name: "Data Structures",
          status: "Pending",
        },
        isLoading: false,
        error: null,
      });

      vi.spyOn(useApprovalModule, "useApproval").mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
      });

      // ACT
      renderApprove();

      // ASSERT: Status badge displayed
      expect(screen.getByText(/Pending/i)).toBeInTheDocument();
    });
  });

  // ==================== NAVIGATION TESTS ====================
  describe("Navigation", () => {
    it("has back buttons available", () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        role: "CoE",
        isLoading: false,
        employee_id: "emp123",
        username: "CoE User",
        department_name: "Admin",
      });

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 123,
          subject_code: "CS101",
          subject_name: "Data Structures",
          status: "Pending",
        },
        isLoading: false,
        error: null,
      });

      vi.spyOn(useApprovalModule, "useApproval").mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
      });

      // ACT
      renderApprove();

      // ASSERT: Multiple back buttons exist
      const backButtons = screen.getAllByRole("button", { name: /back/i });
      expect(backButtons.length).toBeGreaterThan(0);
      expect(backButtons[0]).toBeInTheDocument();
    });
  });
});
