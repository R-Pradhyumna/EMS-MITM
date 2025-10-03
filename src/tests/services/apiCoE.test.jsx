import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  approvePaper,
  getAcademicYear,
  getDepartments,
  getPaper,
  getPapers,
  getUsers,
} from "../../services/apiCoE";
import supabase from "../../services/supabase";

// Mock supabase client
vi.mock("../../services/supabase", () => ({
  default: {
    from: vi.fn(),
  },
}));

describe("apiCoE Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPapers", () => {
    it("fetches papers with basic filters", async () => {
      const mockData = [{ id: 1, subject_code: "CS101", status: "Approved" }];
      const mockCount = 1;

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
          count: mockCount,
        }),
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const result = await getPapers({ filters: [], search: "", page: 1 });

      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(mockCount);
    });

    it("throws error when query fails", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Query failed"),
          count: null,
        }),
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      await expect(
        getPapers({ filters: [], search: "", page: 1 })
      ).rejects.toThrow("Papers could not be loaded!");
    });
  });

  describe("getPaper", () => {
    it("fetches a single paper", async () => {
      const mockPaper = { id: 1, subject_code: "CS101" };

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPaper, error: null }),
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const result = await getPaper(1);

      expect(result).toEqual(mockPaper);
    });

    it("throws error if paper not found", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Not found") }),
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      await expect(getPaper(999)).rejects.toThrow("Paper not found!");
    });
  });

  describe("approvePaper", () => {
    it("updates paper", async () => {
      const paperId = 1;
      const updateObj = { status: "Locked" };
      const mockUpdated = { id: paperId, ...updateObj };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null }),
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await approvePaper(paperId, updateObj);

      expect(result).toEqual(mockUpdated);
    });

    it("throws error if update fails", async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Update failed") }),
      };

      supabase.from.mockReturnValue(mockQuery);

      await expect(approvePaper(1, { status: "Locked" })).rejects.toThrow(
        "Paper could not be locked!"
      );
    });
  });

  describe("getDepartments", () => {
    it("fetches departments", async () => {
      const mockDeps = [{ id: 1, name: "Computer Science" }];

      supabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockDeps, error: null }),
      });

      const result = await getDepartments();

      expect(result).toEqual(mockDeps);
    });

    it("throws error if fetch fails", async () => {
      supabase.from.mockReturnValue({
        select: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Failed") }),
      });

      await expect(getDepartments()).rejects.toThrow(
        "Departments could not be loaded!"
      );
    });
  });

  describe("getAcademicYear", () => {
    it("fetches academic years", async () => {
      const mockYears = [{ academic_year: 2025 }];

      supabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockYears, error: null }),
      });

      const result = await getAcademicYear();

      expect(result).toEqual(mockYears);
    });

    it("throws error if fetch fails", async () => {
      supabase.from.mockReturnValue({
        select: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Failed") }),
      });

      await expect(getAcademicYear()).rejects.toThrow(
        "Academic Year could not be loaded!"
      );
    });
  });

  describe("getUsers", () => {
    it("fetches users with pagination", async () => {
      const mockUsers = [
        { employee_id: "emp1", username: "user1", role: "BoE" },
        { employee_id: "emp2", username: "user2", role: "Principal" },
      ];
      const mockCount = 2;

      const mockQuery = {
        or: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockUsers,
          error: null,
          count: mockCount,
        }),
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const result = await getUsers({ page: 1 });

      expect(result.data).toEqual(mockUsers);
      expect(result.count).toBe(mockCount);
      expect(mockQuery.or).toHaveBeenCalledWith(
        "role.eq.BoE,role.eq.Principal"
      );
      expect(mockQuery.is).toHaveBeenCalledWith("deleted_at", null);
    });

    it("throws error if fetch fails", async () => {
      const mockQuery = {
        or: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Failed"),
          count: null,
        }),
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      await expect(getUsers({ page: 1 })).rejects.toThrow(
        "Users could not be loaded!"
      );
    });
  });
});
