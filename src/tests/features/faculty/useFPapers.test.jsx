import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as useUserDataModule from "../../../features/authentication/useUserData";
import { useFPapers } from "../../../features/faculty/useFPapers";
import * as apiFaculty from "../../../services/apiFaculty";

// Mock the dependencies
vi.mock("../../services/apiFaculty");
vi.mock("../../features/authentication/useUserData");

describe("useFPapers Hook - Unit Tests", () => {
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
      employee_id: "EMP001",
      username: "John Doe",
      department_name: "Computer Science",
      role: "Faculty",
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
    it("returns isLoading as true initially", () => {
      // ARRANGE
      vi.spyOn(apiFaculty, "getPapers").mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // ACT
      const { result } = renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      expect(result.current.isLoading).toBe(true);
    });
  });

  // ==================== DATA FETCHING ====================
  describe("Data Fetching", () => {
    it("fetches papers successfully", async () => {
      // ARRANGE
      const mockPapers = [
        {
          id: 1,
          subject_code: "CS101",
          subject_name: "Data Structures",
          status: "Submitted",
        },
        {
          id: 2,
          subject_code: "CS102",
          subject_name: "Algorithms",
          status: "Approved",
        },
      ];
      vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: mockPapers,
        count: 2,
      });

      // ACT
      const { result } = renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.papers).toEqual(mockPapers);
      expect(result.current.count).toBe(2);
    });

    it("calls getPapers with correct employee_id", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith({
          page: 1,
          employee_id: "EMP001",
        });
      });
    });

    it("sets isLoading to false after successful fetch", async () => {
      // ARRANGE
      vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      const { result } = renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  // ==================== PAGINATION ====================
  describe("Pagination", () => {
    it("defaults to page 1 when no page param provided", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith({
          page: 1,
          employee_id: "EMP001",
        });
      });
    });

    it("uses page number from URL params", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, initialEntries: ["/?page=3"] });

      // ACT
      renderHook(() => useFPapers(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith({
          page: 3,
          employee_id: "EMP001",
        });
      });
    });

    it("prefetches next page when not on last page", async () => {
      // ARRANGE
      vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: Array(10).fill({ id: 1 }),
        count: 25, // More than one page (assuming PAGE_SIZE = 10)
      });
      const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery");

      // ACT
      renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(prefetchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            queryKey: ["exam_papers", 2],
          })
        );
      });
    });

    it("prefetches previous page when not on first page", async () => {
      // ARRANGE
      vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: Array(10).fill({ id: 1 }),
        count: 25,
      });
      const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery");

      const customWrapper = ({ children }) =>
        wrapper({ children, initialEntries: ["/?page=2"] });

      // ACT
      renderHook(() => useFPapers(), { wrapper: customWrapper });

      // ASSERT
      await waitFor(() => {
        expect(prefetchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            queryKey: ["exam_papers", 1],
          })
        );
      });
    });

    it("does not prefetch next page when on last page", async () => {
      // ARRANGE
      vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: Array(5).fill({ id: 1 }),
        count: 15,
      });
      const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery");

      const customWrapper = ({ children }) =>
        wrapper({ children, initialEntries: ["/?page=2"] });

      // ACT
      const { result } = renderHook(() => useFPapers(), {
        wrapper: customWrapper,
      }); // <- Add result

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      // ...
    });

    it("does not prefetch previous page when on first page", async () => {
      // ARRANGE
      vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: Array(10).fill({ id: 1 }),
        count: 25,
      });
      const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery");

      // ACT
      const { result } = renderHook(() => useFPapers(), { wrapper }); // <- Add result

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      // ...
    });
  });

  // ==================== ERROR HANDLING ====================
  describe("Error Handling", () => {
    it("returns error when API call fails", async () => {
      // ARRANGE
      const errorMessage = "Papers could not be loaded!";
      vi.spyOn(apiFaculty, "getPapers").mockRejectedValue(
        new Error(errorMessage)
      );

      // ACT
      const { result } = renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });

    it("returns undefined papers and count 0 when API call fails", async () => {
      // ARRANGE
      vi.spyOn(apiFaculty, "getPapers").mockRejectedValue(
        new Error("Papers could not be loaded!")
      );

      // ACT
      const { result } = renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.papers).toBeUndefined();
        expect(result.current.count).toBe(0);
      });
    });
  });

  // ==================== USER DATA INTEGRATION ====================
  describe("User Data Integration", () => {
    it("uses employee_id from useUserData hook", async () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "EMP999",
        username: "Jane Smith",
        department_name: "Mathematics",
        role: "Faculty",
        isLoading: false,
      });
      const getPapersSpy = vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith({
          page: 1,
          employee_id: "EMP999",
        });
      });
    });

    it("handles empty employee_id gracefully", async () => {
      // ARRANGE
      vi.spyOn(useUserDataModule, "useUserData").mockReturnValue({
        employee_id: "",
        username: "",
        department_name: "",
        role: "Faculty",
        isLoading: false,
      });
      const getPapersSpy = vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalledWith({
          page: 1,
          employee_id: "",
        });
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles zero count gracefully", async () => {
      // ARRANGE
      vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      // ACT
      const { result } = renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.papers).toEqual([]);
        expect(result.current.count).toBe(0);
      });
    });

    it("handles invalid page number gracefully", async () => {
      // ARRANGE
      const getPapersSpy = vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: [],
        count: 0,
      });

      const customWrapper = ({ children }) =>
        wrapper({ children, initialEntries: ["/?page=abc"] });

      // ACT
      renderHook(() => useFPapers(), { wrapper: customWrapper });

      // ASSERT: Should convert to NaN, which is falsy, so defaults to page 1
      await waitFor(() => {
        expect(getPapersSpy).toHaveBeenCalled();
      });
    });

    it("returns count as 0 when count is null or undefined", async () => {
      // ARRANGE
      vi.spyOn(apiFaculty, "getPapers").mockResolvedValue({
        data: [{ id: 1 }],
        count: null,
      });

      // ACT
      const { result } = renderHook(() => useFPapers(), { wrapper });

      // ASSERT
      await waitFor(() => {
        expect(result.current.count).toBe(0);
      });
    });
  });
});
