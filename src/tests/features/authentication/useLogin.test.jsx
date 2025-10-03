import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLogin } from "../../../features/authentication/useLogin";
import * as apiAuth from "../../../services/apiAuth";

// Mock the dependencies
vi.mock("../../services/apiAuth");
vi.mock("react-hot-toast");

// Mock React Router's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("useLogin Hook - Unit Tests", () => {
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
    it("returns login function and isLoading state", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ASSERT
      expect(result.current.login).toBeDefined();
      expect(typeof result.current.login).toBe("function");
      expect(result.current.isLoading).toBe(false);
    });

    it("initializes with isLoading as false", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ASSERT
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ==================== SUCCESSFUL LOGIN ====================
  describe("Successful Login", () => {
    it("calls login API with correct credentials", async () => {
      // ARRANGE
      const mockUser = {
        user: { id: 1, email: "test@example.com" },
      };
      const loginSpy = vi.spyOn(apiAuth, "login").mockResolvedValue(mockUser);
      const { result } = renderHook(() => useLogin(), { wrapper });

      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      // ACT
      result.current.login(credentials);

      // ASSERT
      await waitFor(() => {
        expect(loginSpy).toHaveBeenCalledWith(credentials);
      });
    });

    it("sets user data in query cache on successful login", async () => {
      // ARRANGE
      const mockUser = {
        user: { id: 1, email: "test@example.com" },
      };
      vi.spyOn(apiAuth, "login").mockResolvedValue(mockUser);
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({
        email: "test@example.com",
        password: "password123",
      });

      // ASSERT
      await waitFor(() => {
        const userData = queryClient.getQueryData(["user"]);
        expect(userData).toEqual(mockUser.user);
      });
    });

    it("shows success toast on successful login", async () => {
      // ARRANGE
      const mockUser = {
        user: { id: 1, email: "test@example.com" },
      };
      vi.spyOn(apiAuth, "login").mockResolvedValue(mockUser);
      const toastSuccessSpy = vi.spyOn(toast, "success");
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({
        email: "test@example.com",
        password: "password123",
      });

      // ASSERT
      await waitFor(() => {
        expect(toastSuccessSpy).toHaveBeenCalledWith("Login Successful");
      });
    });

    it("navigates to homepage on successful login", async () => {
      // ARRANGE
      const mockUser = {
        user: { id: 1, email: "test@example.com" },
      };
      vi.spyOn(apiAuth, "login").mockResolvedValue(mockUser);
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({
        email: "test@example.com",
        password: "password123",
      });

      // ASSERT
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/homepage", {
          replace: true,
        });
      });
    });

    it("sets cache, shows toast, then navigates in correct order", async () => {
      // ARRANGE
      const mockUser = {
        user: { id: 1, email: "test@example.com" },
      };
      vi.spyOn(apiAuth, "login").mockResolvedValue(mockUser);
      const toastSuccessSpy = vi.spyOn(toast, "success");
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({
        email: "test@example.com",
        password: "password123",
      });

      // ASSERT
      await waitFor(() => {
        expect(queryClient.getQueryData(["user"])).toEqual(mockUser.user);
        expect(toastSuccessSpy).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  // ==================== FAILED LOGIN ====================
  describe("Failed Login", () => {
    it("shows error toast for invalid credentials", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "login").mockRejectedValue(
        new Error("Invalid login credentials")
      );
      const toastErrorSpy = vi.spyOn(toast, "error");
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({ email: "wrong@example.com", password: "wrong" });

      // ASSERT
      await waitFor(() => {
        expect(toastErrorSpy).toHaveBeenCalledWith(
          "Provided email or password is incorrect"
        );
      });
    });

    it("shows generic error toast for other errors", async () => {
      // ARRANGE
      const errorMessage = "Network error";
      vi.spyOn(apiAuth, "login").mockRejectedValue(new Error(errorMessage));
      const toastErrorSpy = vi.spyOn(toast, "error");
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({
        email: "test@example.com",
        password: "password123",
      });

      // ASSERT
      await waitFor(() => {
        expect(toastErrorSpy).toHaveBeenCalledWith(errorMessage);
      });
    });

    it("does not navigate on failed login", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "login").mockRejectedValue(
        new Error("Invalid login credentials")
      );
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({ email: "wrong@example.com", password: "wrong" });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("does not set user data in cache on failed login", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "login").mockRejectedValue(
        new Error("Invalid login credentials")
      );
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({ email: "wrong@example.com", password: "wrong" });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(queryClient.getQueryData(["user"])).toBeUndefined();
    });

    it("sets isLoading to false after failed login", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "login").mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({
        email: "test@example.com",
        password: "password123",
      });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  // ==================== DEACTIVATED ACCOUNT ====================
  describe("Deactivated Account", () => {
    it("shows deactivated account error message", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "login").mockRejectedValue(
        new Error("Your account has been deactivated.")
      );
      const toastErrorSpy = vi.spyOn(toast, "error");
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({
        email: "deactivated@example.com",
        password: "password123",
      });

      // ASSERT
      await waitFor(() => {
        expect(toastErrorSpy).toHaveBeenCalledWith(
          "Your account has been deactivated."
        );
      });
    });

    it("does not navigate when account is deactivated", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "login").mockRejectedValue(
        new Error("Your account has been deactivated.")
      );
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({
        email: "deactivated@example.com",
        password: "password123",
      });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ==================== LOADING STATE ====================
  describe("Loading State", () => {
    it("transitions isLoading state during login operation", async () => {
      // ARRANGE
      const mockUser = {
        user: { id: 1, email: "test@example.com" },
      };
      vi.spyOn(apiAuth, "login").mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockUser), 50))
      );
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({
        email: "test@example.com",
        password: "password123",
      });

      // ASSERT: Wait for isLoading to become true, then false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  // ==================== MULTIPLE LOGIN CALLS ====================
  describe("Multiple Login Calls", () => {
    it("handles multiple login attempts correctly", async () => {
      // ARRANGE
      const mockUser = {
        user: { id: 1, email: "test@example.com" },
      };
      const loginSpy = vi.spyOn(apiAuth, "login").mockResolvedValue(mockUser);
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT: Call login twice
      result.current.login({
        email: "test1@example.com",
        password: "password1",
      });
      result.current.login({
        email: "test2@example.com",
        password: "password2",
      });

      // ASSERT: API should be called twice
      await waitFor(() => {
        expect(loginSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles missing user data in response", async () => {
      // ARRANGE
      vi.spyOn(apiAuth, "login").mockRejectedValue(
        new Error("Account data not found.")
      );
      const toastErrorSpy = vi.spyOn(toast, "error");
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({
        email: "test@example.com",
        password: "password123",
      });

      // ASSERT
      await waitFor(() => {
        expect(toastErrorSpy).toHaveBeenCalledWith("Account data not found.");
      });
    });

    it("handles empty credentials", async () => {
      // ARRANGE
      const loginSpy = vi
        .spyOn(apiAuth, "login")
        .mockRejectedValue(new Error("Email and password required"));
      const { result } = renderHook(() => useLogin(), { wrapper });

      // ACT
      result.current.login({ email: "", password: "" });

      // ASSERT
      await waitFor(() => {
        expect(loginSpy).toHaveBeenCalledWith({ email: "", password: "" });
      });
    });
  });
});
