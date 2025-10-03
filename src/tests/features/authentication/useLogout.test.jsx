import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLogout } from "../../../features/authentication/useLogout";
import * as apiAuth from "../../../services/apiAuth";

// Mock the dependencies
vi.mock("../services/apiAuth");

// Mock React Router's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("useLogout Hook - Unit Tests", () => {
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
    it("returns logout function and isLoading state", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ASSERT
      expect(result.current.logout).toBeDefined();
      expect(typeof result.current.logout).toBe("function");
      expect(result.current.isLoading).toBe(false);
    });

    it("initializes with isLoading as false", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ASSERT
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ==================== SUCCESSFUL LOGOUT ====================
  describe("Successful Logout", () => {
    it("calls logout API when logout function is invoked", async () => {
      // ARRANGE
      const logoutSpy = vi.spyOn(apiAuth, "logout").mockResolvedValue();
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT
      await waitFor(() => {
        expect(logoutSpy).toHaveBeenCalledTimes(1);
      });
    });
    45;
    it("transitions isLoading state during logout operation", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 50))
      );
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT: Wait for isLoading to become true, then false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("removes all queries from cache on successful logout", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockResolvedValue();
      const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");

      // Set some dummy queries
      queryClient.setQueryData(["user"], { id: 1, name: "Test User" });
      queryClient.setQueryData(["papers"], [{ id: 1 }]);

      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT
      await waitFor(() => {
        expect(removeQueriesSpy).toHaveBeenCalled();
      });
    });

    it("navigates to login page on successful logout", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockResolvedValue();
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
      });
    });

    it("clears cache before navigating to login", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockResolvedValue();
      const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT: Ensure cache is cleared before navigation
      await waitFor(() => {
        expect(removeQueriesSpy).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalled();
      });

      // Verify order: removeQueries called before navigate
      const removeQueriesCallOrder =
        removeQueriesSpy.mock.invocationCallOrder[0];
      const navigateCallOrder = mockNavigate.mock.invocationCallOrder[0];
      expect(removeQueriesCallOrder).toBeLessThan(navigateCallOrder);
    });
  });

  // ==================== FAILED LOGOUT ====================
  describe("Failed Logout", () => {
    it("does not navigate when logout API fails", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockRejectedValue(new Error("Logout failed"));
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("does not clear cache when logout API fails", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockRejectedValue(new Error("Logout failed"));
      const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");

      // Set some dummy queries
      queryClient.setQueryData(["user"], { id: 1, name: "Test User" });

      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(removeQueriesSpy).not.toHaveBeenCalled();
      expect(queryClient.getQueryData(["user"])).toEqual({
        id: 1,
        name: "Test User",
      });
    });

    it("sets isLoading to false after failed logout", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("handles logout API error gracefully", async () => {
      // ARRANGE
      const errorMessage = "Session expired";
      vi.spyOn(apiAuth, "logout").mockRejectedValue(new Error(errorMessage));
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT: Should not throw and should handle error
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ==================== MULTIPLE CALLS ====================
  describe("Multiple Logout Calls", () => {
    it("handles multiple logout calls correctly", async () => {
      // ARRANGE
      const logoutSpy = vi.spyOn(apiAuth, "logout").mockResolvedValue();
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT: Call logout twice
      result.current.logout();
      result.current.logout();

      // ASSERT: API should be called twice
      await waitFor(() => {
        expect(logoutSpy).toHaveBeenCalledTimes(2);
      });
    });

    it("navigates only after successful logout completion", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockResolvedValue();
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT: Navigate not called immediately
      expect(mockNavigate).not.toHaveBeenCalled();

      // Wait for completion
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  // ==================== INTEGRATION WITH QUERY CLIENT ====================
  describe("Query Client Integration", () => {
    it("removes all user-related queries from cache", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockResolvedValue();

      // Set multiple queries
      queryClient.setQueryData(["user"], { id: 1 });
      queryClient.setQueryData(["papers"], [{ id: 1 }]);
      queryClient.setQueryData(["users"], [{ id: 1 }, { id: 2 }]);

      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT: All queries should be removed
      await waitFor(() => {
        expect(queryClient.getQueryData(["user"])).toBeUndefined();
        expect(queryClient.getQueryData(["papers"])).toBeUndefined();
        expect(queryClient.getQueryData(["users"])).toBeUndefined();
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles logout when no queries exist in cache", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockResolvedValue();
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT
      result.current.logout();

      // ASSERT: Should not throw error
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
      });
    });

    it("handles logout with empty query client", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "logout").mockResolvedValue();
      const { result } = renderHook(() => useLogout(), { wrapper });

      // ACT & ASSERT: Should not throw
      expect(() => result.current.logout()).not.toThrow();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });
});
