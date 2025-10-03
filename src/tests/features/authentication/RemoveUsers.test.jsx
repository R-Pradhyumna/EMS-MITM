import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RemoveUser from "../../../features/authentication/RemoveUsers";
import supabase from "../../../services/supabase";

// Mock dependencies
vi.mock("react-hot-toast");
vi.mock("../../../services/supabase", () => ({
  default: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe("RemoveUser Hook - Unit Tests", () => {
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

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // ==================== HOOK INITIALIZATION ====================
  describe("Hook Initialization", () => {
    it("returns mutation object with correct properties", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ASSERT
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it("initializes with idle status", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ASSERT
      expect(result.current.status).toBe("idle");
    });
  });

  // ==================== SUCCESSFUL DELETION ====================
  describe("Successful Deletion", () => {
    it("calls supabase function with correct employee_id", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP123");

      // ASSERT
      await waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalledWith("removeUsers", {
          body: JSON.stringify({ employee_id: "EMP123" }),
        });
      });
    });

    it("displays success toast on successful deletion", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP456");

      // ASSERT
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("User successfully deleted");
      });
    });

    it("invalidates users queries on success", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      // Seed some user queries in cache
      queryClient.setQueryData(["users", 1], { data: [] });
      queryClient.setQueryData(["users", 2], { data: [] });
      queryClient.setQueryData(["other", 1], { data: [] });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP789");

      // ASSERT
      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalled();
      });
    });

    it("sets isSuccess to true after successful deletion", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP999");

      // ASSERT
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it("returns data from successful deletion", async () => {
      // ARRANGE
      const mockData = { success: true, message: "User removed" };
      const mockResponse = { data: mockData, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP111");

      // ASSERT
      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });
    });
  });

  // ==================== ERROR HANDLING ====================
  describe("Error Handling", () => {
    it("displays error toast when deletion fails", async () => {
      // ARRANGE
      const mockError = new Error("Failed to delete user");
      const mockResponse = { data: null, error: mockError };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP222");

      // ASSERT
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to delete user");
      });
    });

    it("displays custom error message from error object", async () => {
      // ARRANGE
      const mockError = new Error("User not found");
      const mockResponse = { data: null, error: mockError };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP333");

      // ASSERT
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("User not found");
      });
    });

    it("sets isError to true on deletion failure", async () => {
      // ARRANGE
      const mockError = new Error("Deletion failed");
      const mockResponse = { data: null, error: mockError };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP444");

      // ASSERT
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it("does not invalidate queries on error", async () => {
      // ARRANGE
      const mockError = new Error("Deletion failed");
      const mockResponse = { data: null, error: mockError };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP555");

      // ASSERT
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // invalidateQueries should not be called on error
      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("handles network errors gracefully", async () => {
      // ARRANGE
      supabase.functions.invoke.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP666");

      // ASSERT
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  // ==================== LOADING STATE ====================
  describe("Loading State", () => {
    it("sets isLoading to true during deletion", async () => {
      // ARRANGE
      supabase.functions.invoke.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP777");

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
    });

    it("transitions from loading to success state", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP888");

      // ASSERT - Eventually succeeds
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  // ==================== QUERY INVALIDATION ====================
  describe("Query Invalidation", () => {
    it("invalidates only user queries with correct format", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      // Set up various queries
      queryClient.setQueryData(["users", 1], { data: [] });
      queryClient.setQueryData(["users", 2], { data: [] });
      queryClient.setQueryData(["users", "invalid"], { data: [] }); // Should not match
      queryClient.setQueryData(["papers", 1], { data: [] }); // Should not match

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP999");

      // ASSERT
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify query invalidation with predicate
      const userQueries = queryClient.getQueriesData(["users"]);
      expect(userQueries.length).toBeGreaterThan(0);
    });

    it("uses correct predicate for query invalidation", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP101");

      // ASSERT
      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalled();
      });

      // Check that predicate function was used
      const callArgs = invalidateSpy.mock.calls[0][0];
      expect(callArgs.predicate).toBeDefined();
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles empty employee_id", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("");

      // ASSERT
      await waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalledWith("removeUsers", {
          body: JSON.stringify({ employee_id: "" }),
        });
      });
    });

    it("handles null employee_id", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate(null);

      // ASSERT
      await waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalledWith("removeUsers", {
          body: JSON.stringify({ employee_id: null }),
        });
      });
    });

    it("handles error without message property", async () => {
      // ARRANGE
      const mockError = {}; // Error without message
      const mockResponse = { data: null, error: mockError };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP202");

      // ASSERT
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to delete user");
      });
    });
  });

  // ==================== MULTIPLE DELETIONS ====================
  describe("Multiple Deletions", () => {
    it("can handle multiple sequential deletions", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT - First deletion
      result.current.mutate("EMP301");
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // ACT - Second deletion
      result.current.mutate("EMP302");
      await waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
      });
    });

    it("maintains correct status after successful deletion", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP401");

      // ASSERT
      await waitFor(() => {
        expect(result.current.status).toBe("success");
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  // ==================== SUPABASE FUNCTION CALL ====================
  describe("Supabase Function Call", () => {
    it("calls removeUsers edge function with correct structure", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP501");

      // ASSERT
      await waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalledWith(
          "removeUsers",
          expect.objectContaining({
            body: expect.any(String),
          })
        );
      });
    });

    it("stringifies employee_id correctly", async () => {
      // ARRANGE
      const mockResponse = { data: { success: true }, error: null };
      supabase.functions.invoke.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => RemoveUser(), { wrapper });

      // ACT
      result.current.mutate("EMP601");

      // ASSERT
      await waitFor(() => {
        const callArgs = supabase.functions.invoke.mock.calls[0][1];
        const parsedBody = JSON.parse(callArgs.body);
        expect(parsedBody).toEqual({ employee_id: "EMP601" });
      });
    });
  });
});
