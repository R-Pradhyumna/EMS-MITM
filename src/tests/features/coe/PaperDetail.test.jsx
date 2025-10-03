import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PaperDetail from "../../../features/coe/PaperDetail";
import * as useCPaperModule from "../../../features/coe/useCPaper";
import * as useMoveBackModule from "../../../hooks/useMoveBack";

// Mock dependencies
vi.mock("../../../features/coe/useCPaper");
vi.mock("../../../features/coe/PaperDataBox", () => ({
  default: ({ paper }) => (
    <div data-testid="paper-data-box">
      <div>Subject: {paper?.subject_name}</div>
      <div>Code: {paper?.subject_code}</div>
      <div>Status: {paper?.status}</div>
    </div>
  ),
}));
vi.mock("../../../hooks/useMoveBack");
vi.mock("../../../ui/Spinner", () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));
vi.mock("../../../ui/Empty", () => ({
  default: () => <div data-testid="empty">No paper found</div>,
}));

// Mock window.matchMedia
beforeEach(() => {
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

describe("PaperDetail - Integration Tests", () => {
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
    vi.spyOn(useMoveBackModule, "useMoveBack").mockReturnValue(mockMoveBack);
  });

  const renderPaperDetail = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/papers/123"]}>
          <Routes>
            <Route path="/papers/:id" element={<PaperDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  // ==================== LOADING STATE ====================
  describe("Loading State", () => {
    it("shows spinner while paper is loading", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: null,
        isLoading: true,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
      expect(screen.queryByTestId("paper-data-box")).not.toBeInTheDocument();
    });
  });

  // ==================== EMPTY STATE ====================
  describe("Empty State", () => {
    it("shows empty component when paper is not found", () => {
      // ARRANGE
      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: null,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      expect(screen.getByTestId("empty")).toBeInTheDocument();
      expect(screen.queryByTestId("paper-data-box")).not.toBeInTheDocument();
    });
  });

  // ==================== SUCCESSFUL DATA LOADING ====================
  describe("Successful Data Loading", () => {
    it("renders paper details when paper is loaded", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Data Structures",
        subject_code: "CS101",
        status: "Submitted",
        department_name: "Computer Science",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId("paper-data-box")).toBeInTheDocument();
      });

      expect(screen.getByText(/Subject: Data Structures/i)).toBeInTheDocument();
      expect(screen.getByText(/Code: CS101/i)).toBeInTheDocument();
    });

    it("displays paper heading with paper ID", async () => {
      // ARRANGE
      const mockPaper = {
        id: 456,
        subject_name: "Algorithms",
        subject_code: "CS202",
        status: "CoE-approved",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/Paper 456/i)).toBeInTheDocument();
      });
    });

    it("displays status badge with correct status", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Operating Systems",
        subject_code: "CS301",
        status: "BoE-approved",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/BoE approved/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== STATUS VARIATIONS ====================
  describe("Status Variations", () => {
    const statuses = [
      "Submitted",
      "CoE-approved",
      "BoE-approved",
      "Locked",
      "Downloaded",
    ];

    statuses.forEach((status) => {
      it(`renders correctly for status: ${status}`, async () => {
        // ARRANGE
        const mockPaper = {
          id: 123,
          subject_name: "Test Subject",
          subject_code: "TEST101",
          status,
        };

        vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
          paper: mockPaper,
          isLoading: false,
          error: null,
        });

        // ACT
        renderPaperDetail();

        // ASSERT
        await waitFor(() => {
          const statusText = status.replace("-", " ");
          const elements = screen.getAllByText(new RegExp(statusText, "i"));
          expect(elements.length).toBeGreaterThan(0);
        });
      });
    });
  });

  // ==================== NAVIGATION BUTTONS ====================
  describe("Navigation Buttons", () => {
    it("renders back button text link", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Computer Networks",
        subject_code: "CS401",
        status: "Submitted",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        const backLinks = screen.getAllByText(/← Back/i);
        expect(backLinks.length).toBeGreaterThan(0);
      });
    });

    it("calls moveBack when back text link is clicked", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Database Systems",
        subject_code: "CS402",
        status: "Submitted",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();

      // ACT
      renderPaperDetail();

      await waitFor(() => {
        expect(screen.getAllByText(/← Back/i)[0]).toBeInTheDocument();
      });

      const backLink = screen.getAllByText(/← Back/i)[0];
      await user.click(backLink);

      // ASSERT
      expect(mockMoveBack).toHaveBeenCalled();
    });

    it("renders back button at bottom", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Software Engineering",
        subject_code: "CS403",
        status: "Submitted",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        const backButtons = screen.getAllByText(/Back/i);
        expect(backButtons.length).toBeGreaterThan(1);
      });
    });
  });

  // ==================== CONDITIONAL ACTION BUTTONS ====================
  describe("Conditional Action Buttons", () => {
    it("renders Approve button for Submitted status", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Web Development",
        subject_code: "CS404",
        status: "Submitted",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Approve/i })
        ).toBeInTheDocument();
      });
    });

    it("does not render Approve button for non-Submitted status", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Artificial Intelligence",
        subject_code: "CS405",
        status: "CoE-approved",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId("paper-data-box")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: /Approve/i })
      ).not.toBeInTheDocument();
    });

    it("renders Lock button for BoE-approved status", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Machine Learning",
        subject_code: "CS406",
        status: "BoE-approved",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Lock/i })
        ).toBeInTheDocument();
      });
    });

    it("does not render Lock button for non-BoE-approved status", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Cloud Computing",
        subject_code: "CS407",
        status: "Submitted",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId("paper-data-box")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: /Lock/i })
      ).not.toBeInTheDocument();
    });
  });

  // ==================== PAPER DATA BOX ====================
  describe("Paper Data Box", () => {
    it("passes paper data to PaperDataBox component", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Cyber Security",
        subject_code: "CS408",
        status: "Locked",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(
          screen.getByText(/Subject: Cyber Security/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/Code: CS408/i)).toBeInTheDocument();
        expect(screen.getByText(/Status: Locked/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== STATUS FORMATTING ====================
  describe("Status Formatting", () => {
    it("formats hyphenated status correctly", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Test Subject",
        subject_code: "TEST101",
        status: "CoE-approved",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        // Status should be displayed as "CoE approved" (with space)
        expect(screen.getByText(/CoE approved/i)).toBeInTheDocument();
      });
    });

    it("handles null status gracefully", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Test Subject",
        subject_code: "TEST101",
        status: null,
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/Unknown/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles paper without subject_code", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Test Subject",
        subject_code: null,
        status: "Submitted",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId("paper-data-box")).toBeInTheDocument();
        expect(screen.getByText(/Subject: Test Subject/i)).toBeInTheDocument();
      });
    });

    it("handles paper with all statuses correctly", async () => {
      // ARRANGE
      const mockPaper = {
        id: 999,
        subject_name: "Final Test",
        subject_code: "FIN999",
        status: "Downloaded",
      };

      vi.spyOn(useCPaperModule, "useCPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/Paper 999/i)).toBeInTheDocument();
        const elements = screen.getAllByText(/Downloaded/i);
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });
});
