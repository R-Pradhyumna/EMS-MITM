import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDepartments } from "../../hooks/useDepartments";
import * as apiCoE from "../../services/apiCoE";

// Create wrapper with retries DISABLED for predictable tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries so errors happen immediately
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDepartments Hook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ==================== SUCCESS CASE ====================

  it("returns isLoading true initially, then data after fetching", async () => {
    // ARRANGE: Mock API to return departments data
    const mockData = [
      { id: 1, name: "Computer Science" },
      { id: 2, name: "Mathematics" },
      { id: 3, name: "Physics" },
    ];
    vi.spyOn(apiCoE, "getDepartments").mockResolvedValue(mockData);

    // ACT: Render the hook
    const { result } = renderHook(() => useDepartments(), {
      wrapper: createWrapper(),
    });

    // ASSERT: Initial loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error == null).toBe(true); // null or undefined

    // WAIT: For async data load to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // ASSERT: Final state with data
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(apiCoE.getDepartments).toHaveBeenCalledTimes(1);
  });

  // ==================== ERROR CASE ====================

  it("returns error when query fails", async () => {
    // ARRANGE: Mock API to reject with an error
    const errorMessage = "Failed to fetch departments";
    vi.spyOn(apiCoE, "getDepartments").mockRejectedValue(
      new Error(errorMessage)
    );

    // ACT: Render the hook
    const { result } = renderHook(() => useDepartments(), {
      wrapper: createWrapper(),
    });

    // ASSERT: Initial loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error == null).toBe(true);

    // WAIT: For error state (with retry: false, this should be immediate)
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // ASSERT: Final error state
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe(errorMessage);
    expect(apiCoE.getDepartments).toHaveBeenCalledTimes(1);
  });

  // ==================== EMPTY DATA CASE ====================

  it("handles empty departments array", async () => {
    // ARRANGE: Mock API to return empty array
    const emptyData = [];
    vi.spyOn(apiCoE, "getDepartments").mockResolvedValue(emptyData);

    // ACT: Render the hook
    const { result } = renderHook(() => useDepartments(), {
      wrapper: createWrapper(),
    });

    // ASSERT: Initial loading
    expect(result.current.isLoading).toBe(true);

    // WAIT: For data load
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // ASSERT: Empty data is returned successfully
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
