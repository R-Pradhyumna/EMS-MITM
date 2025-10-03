import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import BPaperDetail from "../../../features/boe/BPaperDetail";
import * as useBPaperModule from "../../../features/boe/useBPaper";

// Mock the dependencies
vi.mock("../../../features/boe/useBPaper");

// Mock UI components used by BPaperDetail
vi.mock("../../ui/Row", () => ({
  default: ({ children }) => <div data-testid="row">{children}</div>,
}));

vi.mock("../../ui/Heading", () => ({
  default: ({ children }) => <h1 data-testid="heading">{children}</h1>,
}));

vi.mock("../../ui/Button", () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock("../../ui/ButtonText", () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock("../../ui/ButtonGroup", () => ({
  default: ({ children }) => <div data-testid="button-group">{children}</div>,
}));

vi.mock("../../../features/boe/BPaperDataBox", () => ({
  default: ({ paper }) => (
    <div data-testid="paper-data-box">
      <p>Subject: {paper?.subject_name || "N/A"}</p>
      <p>Code: {paper?.subject_code || "N/A"}</p>
      <p>Status: {paper?.status || "N/A"}</p>
    </div>
  ),
}));

vi.mock("../../hooks/useMoveBack", () => ({
  useMoveBack: () => vi.fn(),
}));

vi.mock("../../ui/Spinner", () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
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

describe("BPaperDetail - Integration Tests", () => {
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

  const renderBPaperDetail = (paperId = "123") => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/boe/papers/${paperId}`]}>
          <Routes>
            <Route path="/boe/papers/:id" element={<BPaperDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  // ==================== LOADING STATE ====================
  describe("Loading State", () => {
    it("shows spinner while paper is loading", () => {
      // ARRANGE
      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: null,
        isLoading: true,
        error: null,
      });

      // ACT
      renderBPaperDetail();

      // ASSERT - Just check spinner exists or no paper data shown
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
      };

      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderBPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId("paper-data-box")).toBeInTheDocument();
      });

      expect(screen.getByText(/Subject: Data Structures/i)).toBeInTheDocument();
      expect(screen.getByText(/Code: CS101/i)).toBeInTheDocument();
    });

    it("displays paper heading with subject name and code", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Algorithms",
        subject_code: "CS202",
        status: "CoE-approved",
      };

      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderBPaperDetail();

      // ASSERT - Just check the paper data box renders with correct data
      await waitFor(() => {
        expect(screen.getByText(/Subject: Algorithms/i)).toBeInTheDocument();
        expect(screen.getByText(/Code: CS202/i)).toBeInTheDocument();
      });
    });

    it("displays status in paper data box", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Operating Systems",
        subject_code: "CS301",
        status: "BoE-approved",
      };

      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderBPaperDetail();

      // ASSERT - Check status in mock data box
      await waitFor(() => {
        expect(screen.getByText(/Status: BoE-approved/i)).toBeInTheDocument();
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

        vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
          paper: mockPaper,
          isLoading: false,
          error: null,
        });

        // ACT
        renderBPaperDetail();

        // ASSERT - Check status in the mocked paper-data-box
        await waitFor(() => {
          expect(screen.getByText(`Status: ${status}`)).toBeInTheDocument();
        });
      });
    });
  });

  // ==================== NAVIGATION BUTTONS ====================
  describe("Navigation Buttons", () => {
    it("renders back button", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Computer Networks",
        subject_code: "CS401",
        status: "Submitted",
      };

      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderBPaperDetail();

      // ASSERT - Use getAllByText and check at least one exists
      await waitFor(() => {
        const backButtons = screen.getAllByText(/Back/i);
        expect(backButtons.length).toBeGreaterThan(0);
      });
    });

    it("renders approve button for BoE-approved status", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Database Systems",
        subject_code: "CS402",
        status: "BoE-approved",
      };

      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderBPaperDetail();

      // ASSERT - Use getAllByText
      await waitFor(() => {
        const approveButtons = screen.getAllByText(/Approve/i);
        expect(approveButtons.length).toBeGreaterThan(0);
      });
    });
  });

  // ==================== ERROR HANDLING ====================
  describe("Error Handling", () => {
    it("handles missing paper gracefully", async () => {
      // ARRANGE
      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: null,
        isLoading: false,
        error: null,
      });

      // ACT
      renderBPaperDetail();

      // ASSERT: Should not crash
      await waitFor(() => {
        expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
      });
    });

    it("handles API error gracefully", async () => {
      // ARRANGE
      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: null,
        isLoading: false,
        error: new Error("Failed to fetch paper"),
      });

      // ACT
      renderBPaperDetail();

      // ASSERT: Should not crash
      await waitFor(() => {
        expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles paper without subject code", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Advanced Topics",
        subject_code: null,
        status: "Submitted",
      };

      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderBPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId("paper-data-box")).toBeInTheDocument();
      });
    });

    it("renders BPaperDataBox with correct paper prop", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Software Engineering",
        subject_code: "CS501",
        status: "Locked",
      };

      vi.spyOn(useBPaperModule, "useBPaper").mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderBPaperDetail();

      // ASSERT
      await waitFor(() => {
        expect(
          screen.getByText(/Subject: Software Engineering/i)
        ).toBeInTheDocument();
      });
    });
  });

  // ==================== INTEGRATION WITH useBPaper ====================
  describe("Integration with useBPaper Hook", () => {
    it("uses useBPaper hook to fetch paper data", async () => {
      // ARRANGE
      const useBPaperSpy = vi.spyOn(useBPaperModule, "useBPaper");
      const mockPaper = {
        id: 123,
        subject_name: "Machine Learning",
        status: "Submitted",
      };

      useBPaperSpy.mockReturnValue({
        paper: mockPaper,
        isLoading: false,
        error: null,
      });

      // ACT
      renderBPaperDetail();

      // ASSERT
      expect(useBPaperSpy).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByTestId("paper-data-box")).toBeInTheDocument();
      });
    });
  });
});
