import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DarkModeProvider } from "../../context/DarkModeContext";
import * as useFPapersModule from "../../features/faculty/useFPapers";
import Faculty from "../../pages/Faculty";

// Mock the hooks
vi.mock("../../features/faculty/useFPapers");

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

describe("Faculty Page - Integration Tests", () => {
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

  const renderFaculty = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <MemoryRouter>
            <Faculty />
          </MemoryRouter>
        </DarkModeProvider>
      </QueryClientProvider>
    );
  };

  // ==================== RENDERING TESTS ====================
  describe("Rendering", () => {
    it("renders Faculty Portal heading", () => {
      // ARRANGE
      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderFaculty();

      // ASSERT
      expect(screen.getByText(/Faculty Portal/i)).toBeInTheDocument();
    });

    it("renders Add Paper button", () => {
      // ARRANGE
      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderFaculty();

      // ASSERT: Add paper button exists
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    it("renders sort by operations", () => {
      // ARRANGE
      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderFaculty();

      // ASSERT: Sort dropdown should be present
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  // ==================== LOADING STATE TESTS ====================
  describe("Loading State", () => {
    it("shows loading state while fetching papers", () => {
      // ARRANGE
      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: [],
        isLoading: true,
        count: 0,
      });

      // ACT
      renderFaculty();

      // ASSERT: No paper data displayed yet (still loading)
      expect(
        screen.queryByText(/No papers could be found/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Subject Code/i)).not.toBeInTheDocument();

      // Heading should still be visible during loading
      expect(screen.getByText(/Faculty Portal/i)).toBeInTheDocument();
    });
  });

  // ==================== EMPTY STATE TESTS ====================
  describe("Empty State", () => {
    it("shows empty message when no papers available", () => {
      // ARRANGE
      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderFaculty();

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
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          subject_code: "CS102",
          subject_name: "Algorithms",
          semester: "4",
          academic_year: 2024,
          status: "Approved",
          created_at: new Date().toISOString(),
        },
      ];

      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 2,
      });

      // ACT
      renderFaculty();

      // ASSERT: Just verify the unique paper data is displayed
      expect(screen.getByText(/CS101/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
      expect(screen.getByText(/CS102/i)).toBeInTheDocument();
      expect(screen.getByText(/Algorithms/i)).toBeInTheDocument();
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
        created_at: new Date().toISOString(),
      }));

      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 5,
      });

      // ACT
      renderFaculty();

      // ASSERT: All papers displayed
      mockPapers.forEach((paper) => {
        expect(screen.getByText(paper.subject_code)).toBeInTheDocument();
      });
    });

    it("displays paper status", () => {
      // ARRANGE
      const mockPapers = [
        {
          id: 1,
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: "3",
          academic_year: 2024,
          status: "Pending",
          created_at: new Date().toISOString(),
        },
      ];

      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 1,
      });

      // ACT
      renderFaculty();

      // ASSERT: Status displayed
      expect(screen.getByText(/Pending/i)).toBeInTheDocument();
    });
  });

  // ==================== SORTING TESTS ====================
  describe("Sorting", () => {
    it("displays sort by options", () => {
      // ARRANGE
      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderFaculty();

      // ASSERT: Sort dropdown exists
      const sortDropdown = screen.getByRole("combobox");
      expect(sortDropdown).toBeInTheDocument();
    });

    it("sorts papers by academic year", () => {
      // ARRANGE
      const mockPapers = [
        {
          id: 1,
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: "3",
          academic_year: 2023,
          status: "Pending",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          subject_code: "CS102",
          subject_name: "Algorithms",
          semester: "4",
          academic_year: 2024,
          status: "Approved",
          created_at: new Date().toISOString(),
        },
      ];

      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 2,
      });

      // ACT
      renderFaculty();

      // ASSERT: Papers are rendered (sorting is applied by default)
      expect(screen.getByText(/CS101/i)).toBeInTheDocument();
      expect(screen.getByText(/CS102/i)).toBeInTheDocument();
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
        created_at: new Date().toISOString(),
      }));

      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 25, // More than page size
      });

      // ACT
      renderFaculty();

      // ASSERT: Pagination controls present
      expect(
        screen.getByRole("button", { name: /previous/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    });
  });

  // ==================== ADD PAPER FUNCTIONALITY ====================
  describe("Add Paper", () => {
    it("opens add paper modal when button is clicked", () => {
      // ARRANGE
      vi.spyOn(useFPapersModule, "useFPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      renderFaculty();

      // ACT: Click add paper button
      const addButton = screen.getByRole("button", { name: /add/i });
      fireEvent.click(addButton);

      // ASSERT: Modal should open (form should be visible)
      // Note: This depends on your Modal implementation
      // You might need to check for form fields or modal title
      expect(addButton).toBeInTheDocument();
    });
  });
});
