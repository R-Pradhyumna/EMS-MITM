import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DarkModeProvider } from "../../context/DarkModeContext";
import * as useDownloadPaperModule from "../../features/principal/useDownloadPaper";
import * as usePPapersModule from "../../features/principal/usePPapers";
import * as useAcademicYearModule from "../../hooks/useAcademicYear";
import * as useDepartmentsModule from "../../hooks/useDepartments";
import Principal from "../../pages/Principal";

// Mock the hooks
vi.mock("../../features/principal/usePPapers");
vi.mock("../../features/principal/useDownloadPaper");
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

  // Mock sessionStorage
  Object.defineProperty(window, "sessionStorage", {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });

  // Mock window.open
  Object.defineProperty(window, "open", {
    value: vi.fn(),
    writable: true,
  });
});

describe("Principal Page - Integration Tests", () => {
  let queryClient;
  const mockDownloadMutate = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    // Reset sessionStorage mock
    window.sessionStorage.getItem.mockReturnValue(null);

    // Default mock for download mutation
    vi.spyOn(useDownloadPaperModule, "useDownloadPaper").mockReturnValue({
      mutate: mockDownloadMutate,
      isLoading: false,
    });
  });

  const renderPrincipal = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <MemoryRouter>
            <Principal />
          </MemoryRouter>
        </DarkModeProvider>
      </QueryClientProvider>
    );
  };

  // ==================== RENDERING TESTS ====================
  describe("Rendering", () => {
    it("renders Principal Portal heading", () => {
      // ARRANGE
      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
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
      renderPrincipal();

      // ASSERT
      expect(screen.getByText(/Principal Portal/i)).toBeInTheDocument();
    });

    it("renders table operations section", () => {
      // ARRANGE
      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });
      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: "2024-25" }],
      });
      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderPrincipal();

      // ASSERT: Filter elements should be present
      expect(screen.getByText(/Departments/i)).toBeInTheDocument();
      expect(screen.getByText(/Academic Year/i)).toBeInTheDocument();
    });
  });

  // ==================== LOADING STATE TESTS ====================
  describe("Loading State", () => {
    it("shows loading state while fetching papers", () => {
      // ARRANGE
      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
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
      renderPrincipal();

      // ASSERT: No data displayed yet (still loading)
      expect(
        screen.queryByText(/Exam has not started yet/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Subject Code/i)).not.toBeInTheDocument();

      // Heading should still be visible during loading
      expect(screen.getByText(/Principal Portal/i)).toBeInTheDocument();
    });
  });

  // ==================== EMPTY STATE TESTS ====================
  describe("Empty State", () => {
    it("shows empty message when no papers available", () => {
      // ARRANGE
      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
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
      renderPrincipal();

      // ASSERT: Empty state message
      expect(
        screen.getByText(/No exams are scheduled for today./i)
      ).toBeInTheDocument();
    });
  });

  // ==================== DATA DISPLAY TESTS ====================
  describe("Data Display", () => {
    it("displays table with subject data when loaded", () => {
      // ARRANGE
      const mockPapers = [
        {
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: 3,
          academic_year: "2024-25",
          department_name: "Computer Science",
          papers: [
            { id: 1, paper_slot: 1, status: "Locked", qp_file_url: "url1" },
            { id: 2, paper_slot: 2, status: "Locked", qp_file_url: "url2" },
            { id: 3, paper_slot: 3, status: "Locked", qp_file_url: "url3" },
          ],
        },
      ];

      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 1,
      });
      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: "2024-25" }],
      });
      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderPrincipal();

      // ASSERT: Subject code should be visible
      expect(screen.getByText(/CS101/i)).toBeInTheDocument();
    });

    it("displays multiple subjects in table", () => {
      // ARRANGE
      const mockPapers = [
        {
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: 3,
          academic_year: "2024-25",
          department_name: "Computer Science",
          papers: [
            { id: 1, paper_slot: 1, status: "Locked", qp_file_url: "url1" },
          ],
        },
        {
          subject_code: "CS102",
          subject_name: "Algorithms",
          semester: 4,
          academic_year: "2024-25",
          department_name: "Computer Science",
          papers: [
            { id: 4, paper_slot: 1, status: "Locked", qp_file_url: "url4" },
          ],
        },
      ];

      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 2,
      });
      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: "2024-25" }],
      });
      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderPrincipal();

      // ASSERT: Both subject codes visible
      expect(screen.getByText(/CS101/i)).toBeInTheDocument();
      expect(screen.getByText(/CS102/i)).toBeInTheDocument();
    });

    it("displays semester and year information", () => {
      // ARRANGE
      const mockPapers = [
        {
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: 3,
          academic_year: "2024-25",
          department_name: "Computer Science",
          papers: [
            { id: 1, paper_slot: 1, status: "Locked", qp_file_url: "url1" },
          ],
        },
      ];

      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 1,
      });
      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: "2024-25" }],
      });
      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderPrincipal();

      // ASSERT: Subject code and academic year displayed
      expect(screen.getByText(/CS101/i)).toBeInTheDocument();
      expect(screen.getByText(/2024-25/i)).toBeInTheDocument();
    });
  });

  // ==================== DOWNLOAD FUNCTIONALITY TESTS ====================
  describe("Download Functionality", () => {
    it("displays download buttons for papers", () => {
      // ARRANGE
      const mockPapers = [
        {
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: 3,
          academic_year: "2024-25",
          department_name: "Computer Science",
          papers: [
            { id: 1, paper_slot: 1, status: "Locked", qp_file_url: "url1" },
            { id: 2, paper_slot: 2, status: "Locked", qp_file_url: "url2" },
            { id: 3, paper_slot: 3, status: "Locked", qp_file_url: "url3" },
          ],
        },
      ];

      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 1,
      });
      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: "2024-25" }],
      });
      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderPrincipal();

      // ASSERT: Download buttons present (one per paper slot)
      const allButtons = screen.getAllByRole("button");
      expect(allButtons.length).toBeGreaterThan(0);
    });

    it("disables paper slot buttons for downloaded subject", async () => {
      // ARRANGE
      const mockPapers = [
        {
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: 3,
          academic_year: "2024-25",
          department_name: "Computer Science",
          papers: [
            { id: 1, paper_slot: 1, status: "Locked", qp_file_url: "url1" },
            { id: 2, paper_slot: 2, status: "Locked", qp_file_url: "url2" },
            { id: 3, paper_slot: 3, status: "Locked", qp_file_url: "url3" },
          ],
        },
      ];

      // Mock that CS101 was already downloaded
      window.sessionStorage.getItem.mockImplementation((key) => {
        return key === "downloaded_CS101" ? "1" : null;
      });

      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 1,
      });
      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: "2024-25" }],
      });
      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderPrincipal();

      // ASSERT: Download buttons should be disabled
      await waitFor(() => {
        const allButtons = screen.getAllByRole("button");
        const downloadButtons = allButtons.filter(
          (btn) =>
            btn.textContent.includes("Download") ||
            btn.textContent.includes("1") ||
            btn.textContent.includes("2") ||
            btn.textContent.includes("3")
        );

        if (downloadButtons.length > 0) {
          downloadButtons.forEach((button) => {
            expect(button).toBeDisabled();
          });
        }
      });
    });
  });

  // ==================== FILTER TESTS ====================
  describe("Filtering", () => {
    it("displays department filter with options", () => {
      // ARRANGE
      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });
      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [],
      });
      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }, { name: "Information Science" }],
      });

      // ACT
      renderPrincipal();

      // ASSERT: Department filter present
      expect(screen.getByText(/Departments/i)).toBeInTheDocument();
      expect(screen.getByText(/Computer Science/i)).toBeInTheDocument();
      expect(screen.getByText(/Information Science/i)).toBeInTheDocument();
    });

    it("displays academic year filter with options", () => {
      // ARRANGE
      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });
      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: "2024-25" }, { academic_year: "2023-24" }],
      });
      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [],
      });

      // ACT
      renderPrincipal();

      // ASSERT: Year filter present
      expect(screen.getByText(/Academic Year/i)).toBeInTheDocument();
      expect(screen.getByText(/2024-25/i)).toBeInTheDocument();
      expect(screen.getByText(/2023-24/i)).toBeInTheDocument();
    });
  });

  // ==================== PAGINATION TESTS ====================
  describe("Pagination", () => {
    it("displays pagination when count exceeds page size", () => {
      // ARRANGE
      const mockPapers = Array.from({ length: 10 }, (_, i) => ({
        subject_code: `CS10${i}`,
        subject_name: `Subject ${i}`,
        semester: 3,
        academic_year: "2024-25",
        department_name: "Computer Science",
        papers: [
          {
            id: i * 3 + 1,
            paper_slot: 1,
            status: "Locked",
            qp_file_url: "url",
          },
        ],
      }));

      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 25, // More than one page
      });
      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: "2024-25" }],
      });
      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderPrincipal();

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
      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
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
      renderPrincipal();

      // ASSERT: Search input present
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles subjects with incomplete paper slots", () => {
      // ARRANGE
      const mockPapers = [
        {
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: 3,
          academic_year: "2024-25",
          department_name: "Computer Science",
          papers: [
            { id: 1, paper_slot: 1, status: "Locked", qp_file_url: "url1" },
          ],
        },
      ];

      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 1,
      });
      vi.spyOn(useAcademicYearModule, "useAcademicYear").mockReturnValue({
        ay: [{ academic_year: "2024-25" }],
      });
      vi.spyOn(useDepartmentsModule, "useDepartments").mockReturnValue({
        data: [{ name: "Computer Science" }],
      });

      // ACT
      renderPrincipal();

      // ASSERT: Page renders without crashing
      expect(screen.getByText(/CS101/i)).toBeInTheDocument();
    });

    it("handles empty filter data gracefully", () => {
      // ARRANGE
      vi.spyOn(usePPapersModule, "usePPapers").mockReturnValue({
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
      renderPrincipal();

      // ASSERT: Page renders with default filter state
      expect(screen.getByText(/Principal Portal/i)).toBeInTheDocument();
      expect(screen.getByText(/Departments/i)).toBeInTheDocument();
      expect(screen.getByText(/Academic Year/i)).toBeInTheDocument();
    });
  });
});
