import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as useUserDataModule from "../../../features/authentication/useUserData";
import { useBPapers } from "../../../features/boe/useBPapers";
import * as apiBoE from "../../../services/apiBoE";

// Mock the dependencies
vi.mock("../../services/apiBoE");
vi.mock("../../features/authentication/useUserData");

describe("useBPapers Hook - Unit Tests", () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    // Default mock for useUserData
    vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
      department_name: "Computer Science",
      role: "BoE",
      isLoading: false,
    });
  });

  const wrapper = ({ children, initialEntries = ["/"] }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  // ==================== HOOK INITIALIZATION ====================
  describe("Hook Initialization", () => {
    it("returns initial state with empty papers array", () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      const { result } = renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      expect(result.current.papers).toEqual([]);
      expect(result.current.count).toBe(0);
    });

    it("returns isLoading as true initially", () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPapers").mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // ACT
      const { result } = renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      expect(result.current.isLoading).toBe(true);
    });
  });

  // ==================== DATA FETCHING ====================
  describe("Data Fetching", () => {
    it("fetches papers successfully", async () => {
      // ARRANGE
      const mockPapers = [
        { id: 1, subject_code: "CS101", status: "Approved" },
        { id: 2, subject_code: "CS102", status: "Locked" },
      ];
      vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: mockPapers,
        count: 2,
      });

      // ACT
      const { result } = renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.papers).toEqual(mockPapers);
      expect(result.current.count).toBe(2);
    });

    it("calls getPapers with correct department_name", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            department_name: "Computer Science",
          })
        );
      });
    });

    it("sets isLoading to false after successful fetch", async () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      const { result } = renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  // ==================== FILTERING ====================
  describe("Filtering", () => {
    it("filters papers by academic year", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, initialEntries: ["/?academic_year=2024-25"] });

      // ACT
      renderHook(() => useBPapers(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: [{ field: "academic_year", value: "2024-25" }],
          })
        );
      });
    });

    it("filters papers by status", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, initialEntries: ["/?status=Approved"] });

      // ACT
      renderHook(() => useBPapers(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: [{ field: "status", value: "Approved" }],
          })
        );
      });
    });

    it("applies multiple filters simultaneously", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      const customWrapper = ({ children }) =>
        wrapper({
          children,
          initialEntries: ["/?academic_year=2024-25&status=Locked"],
        });

      // ACT
      renderHook(() => useBPapers(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.arrayContaining([
              { field: "academic_year", value: "2024-25" },
              { field: "status", value: "Locked" },
            ]),
          })
        );
      });
    });

    it("ignores filter with 'all' value", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, initialEntries: ["/?status=all"] });

      // ACT
      renderHook(() => useBPapers(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: [],
          })
        );
      });
    });
  });

  // ==================== SEARCHING ====================
  describe("Searching", () => {
    it("searches papers by subject code", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, initialEntries: ["/?subject_code=CS101"] });

      // ACT
      renderHook(() => useBPapers(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "CS101",
          })
        );
      });
    });

    it("uses empty string for search when no subject code provided", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "",
          })
        );
      });
    });
  });

  // ==================== PAGINATION ====================
  describe("Pagination", () => {
    it("defaults to page 1 when no page param provided", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          })
        );
      });
    });

    it("uses page number from URL params", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, initialEntries: ["/?page=3"] });

      // ACT
      renderHook(() => useBPapers(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 3,
          })
        );
      });
    });

    it("prefetches next page when not on last page", async () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: Array(10).fill({ id: 1 }),
        count: 25, // More than one page
      });
      const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery");

      // ACT
      renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(prefetchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            queryKey: expect.arrayContaining(["exam_papers"]),
          })
        );
      });
    });

    it("prefetches previous page when not on first page", async () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: Array(10).fill({ id: 1 }),
        count: 25,
      });
      const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery");

      const customWrapper = ({ children }) =>
        wrapper({ children, initialEntries: ["/?page=2"] });

      // ACT
      renderHook(() => useBPapers(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(prefetchSpy).toHaveBeenCalled();
      });
    });
  });

  // ==================== ERROR HANDLING ====================
  describe("Error Handling", () => {
    it("returns error when API call fails", async () => {
      // ARRANGE
      const errorMessage = "Papers could not be loaded!";
      vi.spyOn(apiBoE, "getPapers").mockRejectedValue(new Error(errorMessage));

      // ACT
      const { result } = renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });

    it("returns empty array when API call fails", async () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPapers").mockRejectedValue(
        new Error("Papers could not be loaded!")
      );

      // ACT
      const { result } = renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.papers).toEqual([]);
        expect(result.current.count).toBe(0);
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles undefined response from API", async () => {
      // ARRANGE
      vi.spyOn(apiBoE, "getPapers").mockResolvedValue(undefined);

      // ACT
      const { result } = renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.papers).toEqual([]);
        expect(result.current.count).toBe(0);
      });
    });

    it("handles null department_name", async () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        department_name: null,
        role: "BoE",
        isLoading: false,
      });
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            department_name: null,
          })
        );
      });
    });

    it("handles empty filters and search parameters", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiBoE, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      renderHook(() => useBPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith({
          filters: [],
          search: "",
          page: 1,
          department_name: "Computer Science",
        });
      });
    });
  });
});
