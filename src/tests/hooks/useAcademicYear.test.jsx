import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAcademicYear } from "../../hooks/useAcademicYear"; // adjust path
import * as apiCoE from "../../services/apiCoE";

// Wrap hook so it can use React Query context
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // disable retries for tests
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useAcademicYear Hook", () => {
  // ============ ARRANGE ============
  // Mock the getAcademicYear API function to control what data it returns
  const mockData = { year: "2025-2026" };

  beforeEach(() => {
    vi.spyOn(apiCoE, "getAcademicYear").mockResolvedValue(mockData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns isLoading true initially, then data after fetching", async () => {
    // ============ ACT ============
    const { result } = renderHook(() => useAcademicYear(), {
      wrapper: createWrapper(),
    });

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.ay).toBeUndefined();
    expect(result.current.error).toBeNull();

    // Wait for async query to finish
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // ============ ASSERT ============
    expect(result.current.ay).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("returns error when query fails", async () => {
    // ============ ARRANGE ============
    const errorMessage = "API failure";
    vi.spyOn(apiCoE, "getAcademicYear").mockRejectedValue(
      new Error(errorMessage)
    );

    // ============ ACT ============
    const { result } = renderHook(() => useAcademicYear(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for error state
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // ============ ASSERT ============
    expect(result.current.ay).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe(errorMessage);
  });
});
