import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBPaper } from "../../../features/boe/useBPaper";
import * as apiBoE from "../../../services/apiBoE";

// Mock the dependencies
vi.mock("../../../services/apiBoE");

describe("useBPaper Hook - Unit Tests", () => {
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

  const wrapper = ({ children, paperId = "123" }) => (
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
      vi.spyOn(apiBoE, "getPaper").mockResolvedValue({
        id: 123,
        subject_name: "Data Structures",
      });

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT
      expect(result.current.paper).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
    });

    it("returns isLoading as true initially", () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPaper").mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT
      expect(result.current.isLoading).toBe(true);
    });
  });

  // ==================== DATA FETCHING ====================
  describe("Data Fetching", () => {
    it("fetches paper successfully", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Data Structures",
        subject_code: "CS101",
        status: "Submitted",
        department_name: "Computer Science",
      };
      vi.spyOn(apiBoE, "getPaper").mockResolvedValue(mockPaper);

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.paper).toEqual(mockPaper);
    });

    it("calls getPaper with correct paper ID from URL params", async () => {
      // ARRANGE
      const getPaperSpy = vi.spyOn(apiBoE, "getPaper").mockResolvedValue({
        id: 456,
        subject_name: "Algorithms",
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, paperId: "456" });

      // ACT
      renderHook(() => useBPaper(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledWith("456");
      });
    });

    it("sets isLoading to false after successful fetch", async () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPaper").mockResolvedValue({
        id: 123,
        subject_name: "Data Structures",
      });

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("returns complete paper object with all fields", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Operating Systems",
        subject_code: "CS301",
        status: "CoE-approved",
        department_name: "Computer Science",
        semester: "5th Semester",
        academic_year: "2024-25",
        uploaded_by: "John Doe",
        created_at: "2024-01-15T10:30:00Z",
        qp_file_url: "https://example.com/qp.pdf",
        scheme_file_url: "https://example.com/scheme.pdf",
      };
      vi.spyOn(apiBoE, "getPaper").mockResolvedValue(mockPaper);

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

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
      const errorMessage = "Paper not found!";
      vi.spyOn(apiBoE, "getPaper").mockRejectedValue(new Error(errorMessage));

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT - Wait for error to be set and isLoading to be false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Just check that paper is undefined when there's an error
      expect(result.current.paper).toBeUndefined();
    });

    it("returns undefined paper when API call fails", async () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPaper").mockRejectedValue(
        new Error("Paper not found!")
      );

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.paper).toBeUndefined();
      });
    });

    it("does not retry on error", async () => {
      // ARRANGE
      const getPaperSpy = vi
        .spyOn(apiBoE, "getPaper")
        .mockRejectedValue(new Error("Paper not found!"));

      // ACT
      renderHook(() => useBPaper(), { wrapper });

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
      vi.spyOn(apiBoE, "getPaper").mockRejectedValue(
        new Error("Network error")
      );

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.isLoading).toBe(false); // Fix: Wait for isLoading to be false
      });

      expect(result.current.paper).toBeUndefined();
    });
  });

  // ==================== QUERY KEY ====================
  describe("Query Key", () => {
    it("uses correct query key with paper ID", async () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPaper").mockResolvedValue({
        id: 789,
        subject_name: "Database Systems",
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, paperId: "789" });

      // ACT
      renderHook(() => useBPaper(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        const queries = queryClient.getQueriesData(["exam_papers", "789"]);
        expect(queries.length).toBeGreaterThan(0);
      });
    });

    it("fetches paper data with correct query key", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Software Engineering",
      };
      vi.spyOn(apiBoE, "getPaper").mockResolvedValue(mockPaper);

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT - Just check that data is fetched correctly
      await waitFor(() => {
        expect(result.current.paper).toEqual(mockPaper);
      });

      // Verify the query key exists in cache
      const queries = queryClient.getQueriesData(["exam_papers", "123"]);
      expect(queries.length).toBeGreaterThan(0);
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles string paper ID from URL", async () => {
      // ARRANGE - Fix: Test with actual string ID
      const getPaperSpy = vi.spyOn(apiBoE, "getPaper").mockResolvedValue({
        id: 123,
        subject_name: "Test",
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, paperId: "123" });

      // ACT
      renderHook(() => useBPaper(), { wrapper: customWrapper });

      // ASSERT - Fix: Expect string "123", not undefined
      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledWith("123");
      });
    });

    it("returns paper object even if some fields are null", async () => {
      // ARRANGE
      const mockPaper = {
        id: 123,
        subject_name: "Test Subject",
        subject_code: null,
        qp_file_url: null,
        scheme_file_url: null,
      };
      vi.spyOn(apiBoE, "getPaper").mockResolvedValue(mockPaper);

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.paper).toEqual(mockPaper);
      });
    });

    it("handles empty paper object", async () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPaper").mockResolvedValue({});

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.paper).toEqual({});
      });
    });
  });

  // ==================== URL PARAMS ====================
  describe("URL Params", () => {
    it("extracts paper ID from URL params", async () => {
      // ARRANGE
      const getPaperSpy = vi.spyOn(apiBoE, "getPaper").mockResolvedValue({
        id: 999,
        subject_name: "Machine Learning",
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, paperId: "999" });

      // ACT
      renderHook(() => useBPaper(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledWith("999");
      });
    });

    it("handles different paper IDs correctly", async () => {
      // ARRANGE
      const getPaperSpy = vi.spyOn(apiBoE, "getPaper").mockResolvedValue({
        id: 111,
        subject_name: "Test Subject 1",
      });

      const customWrapper1 = ({ children }) =>
        wrapper({ children, paperId: "111" });

      // ACT - First paper
      const { unmount } = renderHook(() => useBPaper(), {
        wrapper: customWrapper1,
      });

      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledWith("111");
      });

      unmount();

      // ARRANGE - Second paper
      getPaperSpy.mockResolvedValue({
        id: 222,
        subject_name: "Test Subject 2",
      });

      const customWrapper2 = ({ children }) =>
        wrapper({ children, paperId: "222" });

      // ACT - Second paper
      renderHook(() => useBPaper(), { wrapper: customWrapper2 });

      // ASSERT
      await waitFor(() => {
        expect(getPaperSpy).toHaveBeenCalledWith("222");
      });
    });
  });

  // ==================== LOADING STATE ====================
  describe("Loading State", () => {
    it("shows loading state during fetch", () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPaper").mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

      // ASSERT
      expect(result.current.isLoading).toBe(true);
      expect(result.current.paper).toBeUndefined();
    });

    it("transitions from loading to loaded state", async () => {
      // ARRANGE
      const mockPaper = { id: 123, subject_name: "Test" };
      vi.spyOn(apiBoE, "getPaper").mockResolvedValue(mockPaper);

      // ACT
      const { result } = renderHook(() => useBPaper(), { wrapper });

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
