import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DarkModeProvider } from "../../context/DarkModeContext";
import * as useCPaperModule from "../../features/coe/useCPaper";
import * as useMoveBackModule from "../../hooks/useMoveBack";
import Paper from "../../pages/Paper";

// Mock the hooks
vi.mock("../../features/coe/useCPaper");
vi.mock("../../hooks/useMoveBack");

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

describe("Paper Page - Integration Tests", () => {
  let queryClient;
  const mockMoveBack = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    // Mock useMoveBack
    vi.spyOn(useMoveBackModule, "useMoveBack").mockReturnValue(mockMoveBack);
  });

  const renderPaper = (paperId = "123") => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <MemoryRouter initialEntries={[`/paper/${paperId}`]}>
            <Routes>
              <Route path="/paper/:paperId" element={<Paper />} />
            </Routes>
          </MemoryRouter>
        </DarkModeProvider>
      </QueryClientProvider>
    );
  };

  // ==================== RENDERING TESTS ====================
  describe("Rendering", () => {
    it("renders paper heading with paper ID", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 123,
          status: "Submitted",
          subject: "Mathematics",
          department: "Science",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("123");

      // ASSERT
      expect(screen.getByText(/Paper 123/i)).toBeInTheDocument();
    });

    it("renders back button", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 123,
          status: "Submitted",
          subject: "Mathematics",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("123");

      // ASSERT
      const backButtons = screen.getAllByRole("button", { name: /back/i });
      expect(backButtons.length).toBeGreaterThan(0);
    });
  });

  // ==================== LOADING STATE TESTS ====================
  describe("Loading State", () => {
    it("shows loading state while fetching paper", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: null,
        isLoading: true,
      });

      // ACT
      renderPaper("123");

      // ASSERT: Loading spinner displayed, no paper details
      expect(screen.queryByText(/Paper 123/i)).not.toBeInTheDocument();
    });
  });

  // ==================== EMPTY STATE TESTS ====================
  describe("Empty State", () => {
    it("shows empty message when no paper data exists", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: null,
        isLoading: false,
      });

      // ACT
      renderPaper("123");

      // ASSERT: Empty state message
      expect(screen.getByText(/No paper could be found/i)).toBeInTheDocument();
    });
  });

  // ==================== DATA DISPLAY TESTS ====================
  describe("Data Display", () => {
    it("displays paper details when data is loaded", () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        status: "Submitted",
        subject: "Mathematics",
        department: "Science",
        created_at: "2025-10-01T10:00:00Z",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
      });

      // ACT
      renderPaper("123");

      // ASSERT: Paper data displayed
      expect(screen.getByText(/Paper 123/i)).toBeInTheDocument();
      const statusElements = screen.getAllByText(/Submitted/i);
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it("displays correct status badge for Submitted papers", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 123,
          status: "Submitted",
          subject: "Physics",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("123");

      // ASSERT: Status badge - use getAllByText since status appears in multiple places
      const statusElements = screen.getAllByText(/Submitted/i);
      expect(statusElements.length).toBeGreaterThan(0);
      expect(statusElements[0]).toBeInTheDocument();
    });

    it("displays correct status badge for CoE-approved papers", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 456,
          status: "CoE-approved",
          subject: "Chemistry",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("456");

      // ASSERT: Status badge with proper formatting
      const statusElements = screen.getAllByText(/CoE approved/i);
      expect(statusElements.length).toBeGreaterThan(0);
      expect(statusElements[0]).toBeInTheDocument();
    });

    it("displays correct status badge for BoE-approved papers", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 789,
          status: "BoE-approved",
          subject: "Biology",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("789");

      // ASSERT: Status badge
      const statusElements = screen.getAllByText(/BoE approved/i);
      expect(statusElements.length).toBeGreaterThan(0);
      expect(statusElements[0]).toBeInTheDocument();
    });

    it("displays correct status badge for Locked papers", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 999,
          status: "Locked",
          subject: "English",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("999");

      // ASSERT: Status badge
      const statusElements = screen.getAllByText(/Locked/i);
      expect(statusElements.length).toBeGreaterThan(0);
      expect(statusElements[0]).toBeInTheDocument();
    });
  });

  // ==================== ACTION BUTTONS TESTS ====================
  describe("Action Buttons", () => {
    it("displays Approve button for Submitted papers", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 123,
          status: "Submitted",
          subject: "Mathematics",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("123");

      // ASSERT: Approve button present, Lock button not present
      expect(
        screen.getByRole("button", { name: /approve/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /lock/i })
      ).not.toBeInTheDocument();
    });

    it("displays Lock button for BoE-approved papers", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 456,
          status: "BoE-approved",
          subject: "Chemistry",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("456");

      // ASSERT: Lock button present, Approve button not present
      expect(screen.getByRole("button", { name: /lock/i })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /approve/i })
      ).not.toBeInTheDocument();
    });

    it("does not display action buttons for CoE-approved papers", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 789,
          status: "CoE-approved",
          subject: "Biology",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("789");

      // ASSERT: No action buttons
      expect(
        screen.queryByRole("button", { name: /approve/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /lock/i })
      ).not.toBeInTheDocument();
    });

    it("does not display action buttons for Locked papers", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 999,
          status: "Locked",
          subject: "English",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("999");

      // ASSERT: No action buttons except Back
      expect(
        screen.queryByRole("button", { name: /approve/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /lock/i })
      ).not.toBeInTheDocument();

      const backButtons = screen.getAllByRole("button", { name: /back/i });
      expect(backButtons.length).toBeGreaterThan(0);
    });
  });

  // ==================== USER INTERACTION TESTS ====================
  describe("User Interactions", () => {
    it("calls moveBack when Back button is clicked", async () => {
      // ARRANGE
      const user = userEvent.setup();

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 123,
          status: "Submitted",
          subject: "Mathematics",
        },
        isLoading: false,
      });

      renderPaper("123");
      // Get the first Back button (from ButtonText in heading area)
      const backButtons = screen.getAllByRole("button", { name: /back/i });
      const backButton = backButtons[0];

      // ACT
      await user.click(backButton);

      // ASSERT
      expect(mockMoveBack).toHaveBeenCalledTimes(1);
    });

    it("Approve button is clickable for Submitted papers", async () => {
      // ARRANGE
      const user = userEvent.setup();

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 123,
          status: "Submitted",
          subject: "Mathematics",
        },
        isLoading: false,
      });

      renderPaper("123");
      const approveButton = screen.getByRole("button", { name: /approve/i });

      // ACT & ASSERT: Button should be enabled and clickable
      expect(approveButton).toBeEnabled();
      await user.click(approveButton);
    });

    it("Lock button is clickable for BoE-approved papers", async () => {
      // ARRANGE
      const user = userEvent.setup();

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 456,
          status: "BoE-approved",
          subject: "Chemistry",
        },
        isLoading: false,
      });

      renderPaper("456");
      const lockButton = screen.getByRole("button", { name: /lock/i });

      // ACT & ASSERT: Button should be enabled and clickable
      expect(lockButton).toBeEnabled();
      await user.click(lockButton);
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles different paper IDs correctly", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 99999,
          status: "Submitted",
          subject: "Advanced Topics",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("99999");

      // ASSERT
      expect(screen.getByText(/Paper 99999/i)).toBeInTheDocument();
    });

    it("displays paper data without optional fields", () => {
      // ARRANGE
      const minimalPaper = {
        id: 123,
        status: "Submitted",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: minimalPaper,
        isLoading: false,
      });

      // ACT
      renderPaper("123");

      // ASSERT: Page renders without crashing
      expect(screen.getByText(/Paper 123/i)).toBeInTheDocument();
      const statusElements = screen.getAllByText(/Submitted/i);
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it("handles null or undefined status gracefully", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: {
          id: 123,
          status: null,
          subject: "Test Subject",
        },
        isLoading: false,
      });

      // ACT
      renderPaper("123");

      // ASSERT: Should show "Unknown" status
      const statusElements = screen.getAllByText(/Unknown/i);
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });
});
