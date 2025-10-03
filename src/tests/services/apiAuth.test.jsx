import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  login,
  getCurrentUser,
  logout,
  updateCurrentUser,
  fetchUserData,
} from "../../services/apiAuth";
import supabase from "../../services/supabase";

// Mock Supabase client
vi.mock("../../services/supabase", () => ({
  default: {
    auth: {
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe("apiAuth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== LOGIN TESTS ====================

  describe("login", () => {
    it("logs in user successfully with valid credentials", async () => {
      // ARRANGE: Mock successful authentication and user data
      const mockAuthData = {
        user: { id: "auth-user-123", email: "user@example.com" },
        session: { access_token: "mock-token" },
      };

      const mockUserData = {
        id: 1,
        auth_user_id: "auth-user-123",
        employee_id: "emp123",
        username: "johndoe",
        role: "Faculty",
        deleted_at: null,
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUserData,
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT: Call login function
      const result = await login({
        email: "user@example.com",
        password: "password123",
      });

      // ASSERT: Verify successful login
      expect(result).toEqual(mockAuthData);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
      expect(supabase.from).toHaveBeenCalledWith("users");
      expect(mockQuery.eq).toHaveBeenCalledWith(
        "auth_user_id",
        "auth-user-123"
      );
    });

    it("throws error when authentication fails", async () => {
      // ARRANGE: Mock authentication error
      const mockError = new Error("Invalid credentials");

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // ACT & ASSERT: Expect login to throw error
      await expect(
        login({ email: "wrong@example.com", password: "wrongpass" })
      ).rejects.toThrow("Invalid credentials");

      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });

    it("throws error when user record not found in database", async () => {
      // ARRANGE: Auth succeeds but user data fails
      const mockAuthData = {
        user: { id: "auth-user-123", email: "user@example.com" },
        session: { access_token: "mock-token" },
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("No rows found"),
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT & ASSERT
      await expect(
        login({ email: "user@example.com", password: "password123" })
      ).rejects.toThrow("Account data not found.");
    });

    it("blocks login and signs out when user account is soft-deleted", async () => {
      // ARRANGE: User account is marked as deleted
      const mockAuthData = {
        user: { id: "auth-user-123", email: "user@example.com" },
        session: { access_token: "mock-token" },
      };

      const mockDeletedUser = {
        id: 1,
        auth_user_id: "auth-user-123",
        employee_id: "emp123",
        deleted_at: "2024-01-01T00:00:00Z", // Soft-deleted
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockDeletedUser,
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      supabase.auth.signOut.mockResolvedValue({ error: null });

      // ACT & ASSERT
      await expect(
        login({ email: "user@example.com", password: "password123" })
      ).rejects.toThrow("Your account has been deactivated.");

      // Verify signOut was called
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  // ==================== GET CURRENT USER TESTS ====================

  describe("getCurrentUser", () => {
    it("returns current user when session exists", async () => {
      // ARRANGE: Mock active session
      const mockUser = {
        id: "auth-user-123",
        email: "user@example.com",
      };

      supabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: "mock-token" } },
      });

      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // ACT
      const result = await getCurrentUser();

      // ASSERT
      expect(result).toEqual(mockUser);
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it("returns null when no session exists", async () => {
      // ARRANGE: No active session
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      });

      // ACT
      const result = await getCurrentUser();

      // ASSERT
      expect(result).toBeNull();
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
    });

    it("throws error when getUser fails", async () => {
      // ARRANGE: Session exists but getUser fails
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: "mock-token" } },
      });

      const mockError = new Error("Failed to get user");
      supabase.auth.getUser.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // ACT & ASSERT
      await expect(getCurrentUser()).rejects.toThrow("Failed to get user");
    });
  });

  // ==================== LOGOUT TESTS ====================

  describe("logout", () => {
    it("logs out user successfully", async () => {
      // ARRANGE: Mock successful signOut
      supabase.auth.signOut.mockResolvedValue({ error: null });

      // ACT
      await logout();

      // ASSERT
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it("throws error when logout fails", async () => {
      // ARRANGE: Mock signOut error
      const mockError = new Error("Logout failed");
      supabase.auth.signOut.mockResolvedValue({ error: mockError });

      // ACT & ASSERT
      await expect(logout()).rejects.toThrow("Logout failed");
    });
  });

  // ==================== UPDATE CURRENT USER TESTS ====================

  describe("updateCurrentUser", () => {
    it("updates user password successfully", async () => {
      // ARRANGE: Mock password update
      const mockUpdatedData = {
        user: { id: "auth-user-123", email: "user@example.com" },
      };

      supabase.auth.updateUser.mockResolvedValue({
        data: mockUpdatedData,
        error: null,
      });

      // ACT
      const result = await updateCurrentUser({ password: "newPassword123" });

      // ASSERT
      expect(result).toEqual(mockUpdatedData);
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: "newPassword123",
      });
    });

    it("updates user full name successfully", async () => {
      // ARRANGE: Mock fullName update
      const mockUpdatedData = {
        user: {
          id: "auth-user-123",
          user_metadata: { fullName: "John Doe Updated" },
        },
      };

      supabase.auth.updateUser.mockResolvedValue({
        data: mockUpdatedData,
        error: null,
      });

      // ACT
      const result = await updateCurrentUser({ fullName: "John Doe Updated" });

      // ASSERT
      expect(result).toEqual(mockUpdatedData);
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: { fullName: "John Doe Updated" },
      });
    });

    it("throws error when update fails", async () => {
      // ARRANGE: Mock update error
      const mockError = new Error("Update failed");
      supabase.auth.updateUser.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // ACT & ASSERT
      await expect(
        updateCurrentUser({ password: "newPassword" })
      ).rejects.toThrow("Update failed");
    });
  });

  // ==================== FETCH USER DATA TESTS ====================

  describe("fetchUserData", () => {
    it("fetches user data successfully", async () => {
      // ARRANGE: Mock authenticated user
      const mockAuthUser = { id: "auth-user-123" };
      const mockUserData = {
        employee_id: "emp123",
        username: "johndoe",
        role: "Faculty",
        department_name: "Computer Science",
      };

      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUserData,
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT
      const result = await fetchUserData();

      // ASSERT
      expect(result).toEqual(mockUserData);
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith("users");
      expect(mockQuery.eq).toHaveBeenCalledWith(
        "auth_user_id",
        "auth-user-123"
      );
    });

    it("throws error when no authenticated user found", async () => {
      // ARRANGE: No authenticated user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // ACT & ASSERT
      await expect(fetchUserData()).rejects.toThrow(
        "No authenticated user found!"
      );
    });

    it("throws error when user role not found in database", async () => {
      // ARRANGE: Auth user exists but no database record
      const mockAuthUser = { id: "auth-user-123" };

      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("No rows found"),
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT & ASSERT
      await expect(fetchUserData()).rejects.toThrow(
        "User role not found in database!"
      );
    });
  });
});
