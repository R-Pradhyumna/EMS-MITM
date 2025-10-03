import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPapers, downloadPaper, getCoE } from "../../services/apiPrincipal";
import supabase from "../../services/supabase";
import { PAGE_SIZE } from "../../utils/constants";
import { groupPapersBySubject } from "../../features/principal/groupPapersBySubject";

// Mock Supabase
vi.mock("../../services/supabase", () => ({
  default: {
    from: vi.fn(),
  },
}));

// Mock grouping utility
vi.mock("../../features/principal/groupPapersBySubject", () => ({
  groupPapersBySubject: vi.fn((papers) => {
    // Simple mock: group papers by subject_code
    const groups = {};
    papers.forEach((paper) => {
      if (!groups[paper.subject_code]) {
        groups[paper.subject_code] = [];
      }
      groups[paper.subject_code].push(paper);
    });
    return Object.entries(groups).map(([subject_code, papers]) => ({
      subject_code,
      papers,
    }));
  }),
}));

describe("apiPrincipal Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== getPapers TESTS ====================

  describe("getPapers", () => {
    it("fetches and groups papers with pagination", async () => {
      // ARRANGE: Mock papers data
      const mockPapers = [
        {
          id: 1,
          subject_code: "CS101",
          status: "Locked",
          exam_datetime: "2024-10-02T10:00:00Z",
        },
        {
          id: 2,
          subject_code: "CS101",
          status: "Downloaded",
          exam_datetime: "2024-10-02T14:00:00Z",
        },
        {
          id: 3,
          subject_code: "CS102",
          status: "Locked",
          exam_datetime: "2024-10-02T16:00:00Z",
        },
      ];

      // Mock the complete Supabase query chain
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockResolvedValue({
          data: mockPapers,
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT: Call getPapers
      const result = await getPapers({
        filters: [{ field: "department_name", value: "Computer Science" }],
        search: "CS",
        page: 1,
        date: new Date("2024-10-02"),
      });

      // ASSERT: Verify Supabase was called correctly
      expect(supabase.from).toHaveBeenCalledWith("exam_papers");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.in).toHaveBeenCalledWith("status", [
        "Locked",
        "Downloaded",
      ]);
      expect(mockQuery.gte).toHaveBeenCalled();
      expect(mockQuery.lte).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith(
        "department_name",
        "Computer Science"
      );
      expect(mockQuery.ilike).toHaveBeenCalledWith("subject_code", "%CS%");

      // Verify grouping was called
      expect(groupPapersBySubject).toHaveBeenCalledWith(mockPapers);

      // Verify pagination
      expect(result.data.length).toBeLessThanOrEqual(PAGE_SIZE);
      expect(result.count).toBeGreaterThanOrEqual(0);
    });

    it("applies filters correctly", async () => {
      // ARRANGE: Mock with multiple filters
      const filters = [
        { field: "department_name", value: "CS" },
        { field: "academic_year", value: 2024 },
      ];

      // Create a thenable mock query that supports chaining
      const createChainableMock = (finalData) => {
        const mock = {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          // Make the object awaitable
          then: function (resolve) {
            resolve(finalData);
          },
        };

        // Make all methods return the same mock for chaining
        Object.keys(mock).forEach((key) => {
          if (typeof mock[key] === "function" && key !== "then") {
            mock[key].mockReturnValue(mock);
          }
        });

        return mock;
      };

      const mockQuery = createChainableMock({ data: [], error: null });
      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      await getPapers({
        filters,
        search: "",
        page: 1,
        date: new Date(),
      });

      // ASSERT: Both filters applied
      expect(mockQuery.eq).toHaveBeenCalledWith("department_name", "CS");
      expect(mockQuery.eq).toHaveBeenCalledWith("academic_year", 2024);
      expect(mockQuery.eq).toHaveBeenCalledTimes(2);
    });

    it("handles search correctly", async () => {
      // ARRANGE: Mock with search
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      await getPapers({
        filters: [],
        search: "  CS101  ",
        page: 1,
        date: new Date(),
      });

      // ASSERT: Search trimmed and applied
      expect(mockQuery.ilike).toHaveBeenCalledWith("subject_code", "%CS101%");
    });

    it("ignores empty search strings", async () => {
      // ARRANGE: Mock without search
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(), // ADD THIS LINE
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      await getPapers({
        filters: [],
        search: "   ",
        page: 1,
        date: new Date(),
      });

      // ASSERT: ilike was not called
      expect(mockQuery.ilike).not.toHaveBeenCalled();
    });

    it("uses current date when no date provided", async () => {
      // ARRANGE
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT: No date parameter
      await getPapers({
        filters: [],
        search: "",
        page: 1,
      });

      // ASSERT: gte and lte were called (using today's date)
      expect(mockQuery.gte).toHaveBeenCalledWith(
        "exam_datetime",
        expect.any(String)
      );
      mockQuery.lte.mockResolvedValue({
        data: [],
        error: null,
      });
    });

    it("throws error when query fails", async () => {
      // ARRANGE: Mock error
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Database error"),
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT & ASSERT
      await expect(
        getPapers({
          filters: [],
          search: "",
          page: 1,
          date: new Date(),
        })
      ).rejects.toThrow("Papers could not be loaded!");
    });

    it("handles empty results", async () => {
      // ARRANGE: Empty data
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      const result = await getPapers({
        filters: [],
        search: "",
        page: 1,
        date: new Date(),
      });

      // ASSERT
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("paginates grouped results correctly", async () => {
      // ARRANGE: Create enough papers to test pagination
      const mockPapers = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        subject_code: `CS${100 + Math.floor(i / 2)}`, // 2 papers per subject
        status: "Locked",
        exam_datetime: "2024-10-02T10:00:00Z",
      }));

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({
          data: mockPapers,
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT: Get page 2
      const result = await getPapers({
        filters: [],
        search: "",
        page: 2,
        date: new Date(),
      });

      // ASSERT: Should have at most PAGE_SIZE items
      expect(result.data.length).toBeLessThanOrEqual(PAGE_SIZE);
      expect(result.count).toBe(15); // 30 papers / 2 per subject = 15 subjects
    });
  });

  // ==================== downloadPaper TESTS ====================

  describe("downloadPaper", () => {
    it("updates paper status to Downloaded", async () => {
      // ARRANGE: Mock successful update
      const mockUpdatedPaper = {
        id: 1,
        status: "Downloaded",
        is_downloaded: true,
        downloaded_at: expect.any(String),
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [mockUpdatedPaper], // Note: Supabase returns array from .select()
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      const result = await downloadPaper(1);

      // ASSERT
      expect(supabase.from).toHaveBeenCalledWith("exam_papers");
      expect(mockQuery.update).toHaveBeenCalledWith({
        is_downloaded: true,
        downloaded_at: expect.any(String),
        status: "Downloaded",
      });
      expect(mockQuery.eq).toHaveBeenCalledWith("id", 1);
      expect(mockQuery.select).toHaveBeenCalled();
      expect(result).toEqual([mockUpdatedPaper]);
    });

    it("includes correct timestamp in update", async () => {
      // ARRANGE
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [{ id: 1 }],
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      await downloadPaper(1);

      // ASSERT: Check update was called with ISO timestamp
      expect(mockQuery.update).toHaveBeenCalledWith({
        is_downloaded: true,
        downloaded_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/), // ISO format
        status: "Downloaded",
      });
    });

    it("throws error when update fails", async () => {
      // ARRANGE: Mock error
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Update failed"),
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // Spy on console.error to verify it's called
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation();

      // ACT & ASSERT
      await expect(downloadPaper(1)).rejects.toThrow(
        "Could not record or mark download."
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // ==================== getCoE TESTS ====================

  describe("getCoE", () => {
    it("fetches CoE users with pagination", async () => {
      // ARRANGE: Mock CoE users
      const mockUsers = [
        {
          employee_id: "emp001",
          username: "john_coe",
          department_name: "Computer Science",
          role: "CoE",
        },
        {
          employee_id: "emp002",
          username: "jane_coe",
          department_name: "Mathematics",
          role: "CoE",
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockUsers,
          error: null,
          count: 2,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      const result = await getCoE({ page: 1 });

      // ASSERT
      expect(supabase.from).toHaveBeenCalledWith("users");
      expect(mockQuery.select).toHaveBeenCalledWith(
        "employee_id, username, department_name, role",
        { count: "exact" }
      );
      expect(mockQuery.eq).toHaveBeenCalledWith("role", "CoE");
      expect(mockQuery.is).toHaveBeenCalledWith("deleted_at", null);
      expect(mockQuery.range).toHaveBeenCalled();
      expect(result.data).toEqual(mockUsers);
      expect(result.count).toBe(2);
    });

    it("applies pagination correctly", async () => {
      // ARRANGE
      const page = 3;
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      await getCoE({ page });

      // ASSERT: Verify correct pagination range
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      expect(mockQuery.range).toHaveBeenCalledWith(from, to);
    });

    it("works without pagination", async () => {
      // ARRANGE: No page parameter
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT: No page provided
      await getCoE({});

      // ASSERT: range() was not called
      expect(mockQuery.range).toBeUndefined();
    });

    it("excludes soft-deleted users", async () => {
      // ARRANGE
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(), // ADD mockReturnThis()
        range: vi.fn().mockReturnThis(), // ADD THIS LINE
      };

      // ADD THIS - Resolve at range since page is provided
      mockQuery.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      await getCoE({ page: 1 });

      // ASSERT: Verifies soft-deleted users are filtered
      expect(mockQuery.is).toHaveBeenCalledWith("deleted_at", null);
      expect(mockQuery.range).toHaveBeenCalled(); // ADD THIS LINE
    });

    it("throws error when query fails", async () => {
      // ARRANGE: Mock error
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Database error"),
          count: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT & ASSERT
      await expect(getCoE({ page: 1 })).rejects.toThrow(
        "Users could not be loaded!"
      );
    });
  });
});
