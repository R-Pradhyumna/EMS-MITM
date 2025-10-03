import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DarkModeProvider } from "../../context/DarkModeContext";
import * as useDPapersModule from "../../features/dashboard/useDPapers";
import Dashboard from "../../pages/Dashboard";

// Mock the hooks
vi.mock("../../features/dashboard/useDPapers");

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

describe("Dashboard Page - Integration Tests", () => {
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

  const renderDashboard = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </DarkModeProvider>
      </QueryClientProvider>
    );
  };

  // ==================== RENDERING TESTS ====================
  describe("Rendering", () => {
    it("renders Dashboard heading", () => {
      // ARRANGE
      vi.spyOn(useDPapersModule, "useDPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderDashboard();

      // ASSERT
      expect(screen.getByText(/CoE Dashboard/i)).toBeInTheDocument();
    });

    it("renders table operations (upload buttons)", () => {
      // ARRANGE
      vi.spyOn(useDPapersModule, "useDPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderDashboard();

      // ASSERT: Upload operations should be present
      // Check for upload-related buttons (UploadExams, UploadSubjects, UploadUsers)
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  // ==================== LOADING STATE TESTS ====================
  describe("Loading State", () => {
    it("shows loading state while fetching papers", () => {
      // ARRANGE
      vi.spyOn(useDPapersModule, "useDPapers").mockReturnValue({
        papers: [],
        isLoading: true,
        count: 0,
      });

      // ACT
      renderDashboard();

      // ASSERT: No paper data displayed yet (still loading)
      expect(
        screen.queryByText(/No papers could be found/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Subject Code/i)).not.toBeInTheDocument();

      // Heading should still be visible during loading
      expect(screen.getByText(/CoE Dashboard/i)).toBeInTheDocument();
    });
  });

  // ==================== EMPTY STATE TESTS ====================
  describe("Empty State", () => {
    it("shows empty message when no papers available", () => {
      // ARRANGE
      vi.spyOn(useDPapersModule, "useDPapers").mockReturnValue({
        papers: [],
        isLoading: false,
        count: 0,
      });

      // ACT
      renderDashboard();

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
          uploaded_by: "John Doe",
          schema_file: "schema_cs101.pdf",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          subject_code: "CS102",
          subject_name: "Algorithms",
          semester: "4",
          academic_year: 2024,
          uploaded_by: "Jane Smith",
          schema_file: "schema_cs102.pdf",
          created_at: new Date().toISOString(),
        },
      ];

      vi.spyOn(useDPapersModule, "useDPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 2,
      });

      // ACT
      renderDashboard();

      // ASSERT: Table headers displayed
      expect(screen.getByText(/Subject Code/i)).toBeInTheDocument();
      expect(screen.getByText(/Academic Year/i)).toBeInTheDocument();
      expect(screen.getByText(/Subject Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Semester/i)).toBeInTheDocument();
      expect(screen.getByText(/Uploaded By/i)).toBeInTheDocument();
      expect(screen.getByText(/Schema File/i)).toBeInTheDocument();

      // ASSERT: Paper data displayed
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
        uploaded_by: "Test User",
        schema_file: `schema_${i}.pdf`,
        created_at: new Date().toISOString(),
      }));

      vi.spyOn(useDPapersModule, "useDPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 5,
      });

      // ACT
      renderDashboard();

      // ASSERT: All papers displayed
      mockPapers.forEach((paper) => {
        expect(screen.getByText(paper.subject_code)).toBeInTheDocument();
      });
    });

    it("displays uploaded by information", () => {
      // ARRANGE
      const mockPapers = [
        {
          id: 1,
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: "3",
          academic_year: 2024,
          uploaded_by: "John Doe",
          schema_file: "schema.pdf",
          created_at: new Date().toISOString(),
        },
      ];

      vi.spyOn(useDPapersModule, "useDPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 1,
      });

      // ACT
      renderDashboard();

      // ASSERT: Uploader name displayed
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
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
        uploaded_by: "Test User",
        schema_file: `schema_${i}.pdf`,
        created_at: new Date().toISOString(),
      }));

      vi.spyOn(useDPapersModule, "useDPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 25, // More than page size
      });

      // ACT
      renderDashboard();

      // ASSERT: Pagination controls present
      expect(
        screen.getByRole("button", { name: /previous/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    });
  });

  // ==================== TABLE STRUCTURE TESTS ====================
  describe("Table Structure", () => {
    it("displays all required table columns", () => {
      // ARRANGE
      const mockPapers = [
        {
          id: 1,
          subject_code: "CS101",
          subject_name: "Data Structures",
          semester: "3",
          academic_year: 2024,
          uploaded_by: "John Doe",
          schema_file: "schema.pdf",
          created_at: new Date().toISOString(),
        },
      ];

      vi.spyOn(useDPapersModule, "useDPapers").mockReturnValue({
        papers: mockPapers,
        isLoading: false,
        count: 1,
      });

      // ACT
      renderDashboard();

      // ASSERT: All column headers present
      const headers = [
        "Subject Code",
        "Academic Year",
        "Subject Name",
        "Semester",
        "Uploaded By",
        "Schema File",
      ];

      headers.forEach((header) => {
        expect(screen.getByText(header)).toBeInTheDocument();
      });
    });
  });
});
