import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCPaper } from "../../../features/coe/useCPaper";
import * as apiCoE from "../../../services/apiCoE";

// Mock the dependencies
vi.mock("../../../services/apiCoE");

describe("useCPaper Hook - Unit Tests", () => {
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

  const wrapper = ({ children, paperId = "456" }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/papers/${paperId}`]}>
        <Routes>
          <Route path="/papers/:id" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  // ==================== HOOK INITIALIZATION ====================
  describe("Hook Initialization", () => {
    it("returns initial state with undefined paper", () => {
      // ARRANGE
      vi.spyOn(apiCoE, "getPaper").mockResolvedValue({
        id: 456,
        subject_name: "Operating Systems",
      });

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      expect(result.current.paper).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
    });

    it("returns isLoading as true initially", () => {
      // ARRANGE
      vi.spyOn(apiCoE, "getPaper").mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      expect(result.current.isLoading).toBe(true);
    });
  });

  // ==================== DATA FETCHING ====================
  describe("Data Fetching", () => {
    it("fetches paper successfully", async () => {
      // ARRANGE
      const mockPaper = {
        id: 456,
        subject_name: "Operating Systems",
        subject_code: "CS301",
        status: "Submitted",
        department_name: "Computer Science",
      };
      vi.spyOn(apiCoE, "getPaper").mockResolvedValue(mockPaper);

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.paper).toEqual(mockPaper);
    });

    it("calls getPaper with correct paper ID from URL params", async () => {
      // ARRANGE
      const getPaperSpy = vi.spyOn(apiCoE, "getPaper").mockResolvedValue({
        id: 789,
        subject_name: "Database Systems",
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, paperId: "789" });

      // ACT
      renderHook(() => useCPaper(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledWith("789");
      });
    });

    it("sets isLoading to false after successful fetch", async () => {
      // ARRANGE
      vi.spyOn(apiCoE, "getPaper").mockResolvedValue({
        id: 456,
        subject_name: "Operating Systems",
      });

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("returns complete paper object with all fields", async () => {
      // ARRANGE
      const mockPaper = {
        id: 456,
        subject_name: "Computer Networks",
        subject_code: "CS401",
        status: "CoE-approved",
        department_name: "Computer Science",
        semester: "6th Semester",
        academic_year: "2024-25",
        uploaded_by: "Jane Smith",
        created_at: "2024-02-10T09:15:00Z",
        qp_file_url: "https://example.com/qp.pdf",
        scheme_file_url: "https://example.com/scheme.pdf",
      };
      vi.spyOn(apiCoE, "getPaper").mockResolvedValue(mockPaper);

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.paper).toEqual(mockPaper);
      });
    });
  });

  // ==================== ERROR HANDLING ====================
  describe("Error Handling", () => {
    it("returns error when API call fails", async () => {
      // ARRANGE
      vi.spyOn(apiCoE, "getPaper").mockRejectedValue(
        new Error("Paper not found!")
      );

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.paper).toBeUndefined();
    });

    it("returns undefined paper when API call fails", async () => {
      // ARRANGE
      vi.spyOn(apiCoE, "getPaper").mockRejectedValue(
        new Error("Paper not found!")
      );

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.paper).toBeUndefined();
      });
    });

    it("does not retry on error", async () => {
      // ARRANGE
      const getPaperSpy = vi
        .spyOn(apiCoE, "getPaper")
        .mockRejectedValue(new Error("Paper not found!"));

      // ACT
      renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledTimes(1);
      });

      // Wait a bit more to ensure no retry happened
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(getPaperSpy).toHaveBeenCalledTimes(1);
    });

    it("handles network errors gracefully", async () => {
      // ARRANGE
      vi.spyOn(apiCoE, "getPaper").mockRejectedValue(
        new Error("Network error")
      );

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.paper).toBeUndefined();
    });
  });

  // ==================== QUERY KEY ====================
  describe("Query Key", () => {
    it("uses correct query key with paper ID", async () => {
      // ARRANGE
      vi.spyOn(apiCoE, "getPaper").mockResolvedValue({
        id: 999,
        subject_name: "Software Testing",
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, paperId: "999" });

      // ACT
      renderHook(() => useCPaper(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        const queries = queryClient.getQueriesData(["exam_papers", "999"]);
        expect(queries.length).toBeGreaterThan(0);
      });
    });

    it("fetches paper data with correct query key", async () => {
      // ARRANGE
      const mockPaper = {
        id: 456,
        subject_name: "Cloud Computing",
      };
      vi.spyOn(apiCoE, "getPaper").mockResolvedValue(mockPaper);

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.paper).toEqual(mockPaper);
      });

      // Verify the query key exists in cache
      const queries = queryClient.getQueriesData(["exam_papers", "456"]);
      expect(queries.length).toBeGreaterThan(0);
    });
  });

  // ==================== URL PARAMS ====================
  describe("URL Params", () => {
    it("extracts paper ID from URL params", async () => {
      // ARRANGE
      const getPaperSpy = vi.spyOn(apiCoE, "getPaper").mockResolvedValue({
        id: 111,
        subject_name: "Artificial Intelligence",
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, paperId: "111" });

      // ACT
      renderHook(() => useCPaper(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledWith("111");
      });
    });

    it("handles different paper IDs correctly", async () => {
      // ARRANGE
      const getPaperSpy = vi.spyOn(apiCoE, "getPaper").mockResolvedValue({
        id: 222,
        subject_name: "Test Subject 1",
      });

      const customWrapper1 = ({ children }) =>
        wrapper({ children, paperId: "222" });

      // ACT - First paper
      const { unmount } = renderHook(() => useCPaper(), {
        wrapper: customWrapper1,
      });

      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledWith("222");
      });

      unmount();

      // ARRANGE - Second paper
      getPaperSpy.mockResolvedValue({
        id: 333,
        subject_name: "Test Subject 2",
      });

      const customWrapper2 = ({ children }) =>
        wrapper({ children, paperId: "333" });

      // ACT - Second paper
      renderHook(() => useCPaper(), { wrapper: customWrapper2 });

      // ASSERT
      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledWith("333");
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles string paper ID from URL", async () => {
      // ARRANGE
      const getPaperSpy = vi.spyOn(apiCoE, "getPaper").mockResolvedValue({
        id: 456,
        subject_name: "Test",
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, paperId: "456" });

      // ACT
      renderHook(() => useCPaper(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledWith("456");
      });
    });

    it("returns paper object even if some fields are null", async () => {
      // ARRANGE
      const mockPaper = {
        id: 456,
        subject_name: "Test Subject",
        subject_code: null,
        qp_file_url: null,
        scheme_file_url: null,
      };
      vi.spyOn(apiCoE, "getPaper").mockResolvedValue(mockPaper);

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.paper).toEqual(mockPaper);
      });
    });

    it("handles empty paper object", async () => {
      // ARRANGE
      vi.spyOn(apiCoE, "getPaper").mockResolvedValue({});

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.paper).toEqual({});
      });
    });
  });

  // ==================== LOADING STATE ====================
  describe("Loading State", () => {
    it("shows loading state during fetch", () => {
      // ARRANGE
      vi.spyOn(apiCoE, "getPaper").mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT
      expect(result.current.isLoading).toBe(true);
      expect(result.current.paper).toBeUndefined();
    });

    it("transitions from loading to loaded state", async () => {
      // ARRANGE
      const mockPaper = { id: 456, subject_name: "Test CoE Paper" };
      vi.spyOn(apiCoE, "getPaper").mockResolvedValue(mockPaper);

      // ACT
      const { result } = renderHook(() => useCPaper(), { wrapper });

      // ASSERT - Initially loading
      expect(result.current.isLoading).toBe(true);

      // ASSERT - After load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.paper).toEqual(mockPaper);
      });
    });
  });
});
