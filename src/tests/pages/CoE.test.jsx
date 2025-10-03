import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DarkModeProvider } from "../../context/DarkModeContext";
import * as useCPapersModule from "../../features/coe/useCPapers";
import * as useAcademicYearModule from "../../hooks/useAcademicYear";
import * as useDepartmentsModule from "../../hooks/useDepartments";
import CoE from "../../pages/CoE";

// Mock the hooks
vi.mock("../../features/coe/useCPapers");
vi.mock("../../hooks/useAcademicYear");
vi.mock("../../hooks/useDepartments");

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

describe("CoE Page - Integration Tests", () => {
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

  const renderCoE = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <MemoryRouter>
            <CoE />
          </MemoryRouter>
        </DarkModeProvider>
      </QueryClientProvider>
    );
  };

  // ==================== RENDERING TESTS ====================
  describe("Rendering", () => {
    it("renders CoE Portal heading", () => {
      // ARRANGE
      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [],
      });

      // ACT
      renderCoE();

      // ASSERT
      expect(screen.getByText(/CoE Portal/i)).toBeInTheDocument();
    });

    it("renders table operations (filters and search)", () => {
      // ARRANGE
      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: 2024 }, { academic_year: 2023 }],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }, { name: "Information Science" }],
      });

      // ACT
      renderCoE();

      // ASSERT: Filter options present
      expect(screen.getByText(/Departments/i)).toBeInTheDocument();
      expect(screen.getByText(/Academic Year/i)).toBeInTheDocument();
    });
  });

  // ==================== LOADING STATE TESTS ====================
  describe("Loading State", () => {
    it("shows loading state while fetching papers", () => {
      // ARRANGE
      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: [],
        isLoading: true,
        count: 0,
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [],
      });

      // ACT
      renderCoE();

      // ASSERT: No paper data displayed yet (still loading)
      expect(
        screen.queryByText(/No papers could be found/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Subject Code/i)).not.toBeInTheDocument();

      // Heading should still be visible during loading
      expect(screen.getByText(/CoE Portal/i)).toBeInTheDocument();
    });
  });

  // ==================== EMPTY STATE TESTS ====================
  describe("Empty State", () => {
    it("shows empty message when no papers available", () => {
      // ARRANGE
      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [],
      });

      // ACT
      renderCoE();

      // ASSERT: Empty state message
      expect(screen.getByText(/No papers could be found/i)).toBeInTheDocument();
    });
  });

  // ==================== DATA DISPLAY TESTS ====================
  describe("Data Display", () => {
    it("displays table with papers when data is loaded", () => {
      // ARRANGE
      const mockPapers = [
        {
          id: 1,
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: "3",
          academic_year: 2024,
          status: "Pending",
          department: "Computer Science",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          subject_code: "CS102",
          subject_name: "Algorithms",
          semester: "4",
          academic_year: 2024,
          status: "Approved",
          department: "Computer Science",
          created_at: new Date().toISOString(),
        },
      ];

      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 2,
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: 2024 }],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderCoE();

      // ASSERT: Paper data displayed
      expect(screen.getByText(/CS101/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
      expect(screen.getByText(/CS102/i)).toBeInTheDocument();
      expect(screen.getByText(/Algorithms/i)).toBeInTheDocument();

      // Also verify table structure exists
      expect(screen.getByText(/Subject Code/i)).toBeInTheDocument();
      expect(screen.getByText(/Subject Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Semester/i)).toBeInTheDocument();
    });

    it("displays correct count of papers", () => {
      // ARRANGE
      const mockPapers = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        subject_code: `CS10${i}`,
        subject_name: `Subject ${i}`,
        semester: "3",
        academic_year: 2024,
        status: "Pending",
        department: "Computer Science",
        created_at: new Date().toISOString(),
      }));

      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 5,
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: 2024 }],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderCoE();

      // ASSERT: All papers displayed
      mockPapers.forEach((paper) => {
        expect(screen.getByText(paper.subject_code)).toBeInTheDocument();
      });
    });
  });

  // ==================== FILTER TESTS ====================
  describe("Filtering", () => {
    it("displays department filter options", () => {
      // ARRANGE
      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [
          { name: "Computer Science" },
          { name: "Information Science" },
          { name: "Electronics" },
        ],
      });

      // ACT
      renderCoE();

      // ASSERT: Department filter available
      expect(screen.getByText(/Departments/i)).toBeInTheDocument();
      expect(screen.getByText(/Computer Science/i)).toBeInTheDocument();
      expect(screen.getByText(/Information Science/i)).toBeInTheDocument();
      expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
    });

    it("displays academic year filter options", () => {
      // ARRANGE
      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [
          { academic_year: 2024 },
          { academic_year: 2023 },
          { academic_year: 2022 },
        ],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [],
      });

      // ACT
      renderCoE();

      // ASSERT: Year filter available
      expect(screen.getByText(/Academic Year/i)).toBeInTheDocument();
      expect(screen.getByText(/2024/i)).toBeInTheDocument();
      expect(screen.getByText(/2023/i)).toBeInTheDocument();
    });

    it("displays status filter options", () => {
      // ARRANGE
      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [],
      });

      // ACT
      renderCoE();

      // ASSERT: Status filter dropdown should be present
      // Note: Exact status values depend on your Filter component options
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  // ==================== PAGINATION TESTS ====================
  describe("Pagination", () => {
    it("displays pagination when there are multiple pages", () => {
      // ARRANGE: More papers than fit on one page
      const mockPapers = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        subject_code: `CS10${i}`,
        subject_name: `Subject ${i}`,
        semester: "3",
        academic_year: 2024,
        status: "Pending",
        department: "Computer Science",
        created_at: new Date().toISOString(),
      }));

      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 25, // More than page size
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: 2024 }],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderCoE();

      // ASSERT: Pagination controls present
      expect(
        screen.getByRole("button", { name: /previous/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    });
  });

  // ==================== SEARCH FUNCTIONALITY ====================
  describe("Search", () => {
    it("renders search bar", () => {
      // ARRANGE
      vi.spyOn(useCPapersModule, "useCPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [],
      });

      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [],
      });

      // ACT
      renderCoE();

      // ASSERT: Search input present
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });
});
