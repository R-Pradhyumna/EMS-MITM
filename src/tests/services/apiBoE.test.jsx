import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPapers,
  getPaper,
  approvePaper,
  uploadScrutinizedFiles,
  getFaculties,
} from "../../services/apiBoE";
import supabase from "../../services/supabase";
import { PAGE_SIZE } from "../../utils/constants";

// Mock Supabase client
vi.mock("../../services/supabase", () => ({
  default: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
  supabaseUrl: "https://mock.supabase.co",
}));

describe("apiCoE Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== getPapers TESTS ====================

  describe("getPapers", () => {
    it("fetches papers with basic filters", async () => {
      // ARRANGE: Mock data and query chain
      const mockData = [
        { id: 1, subject_code: "CS101", status: "CoE-approved" },
        { id: 2, subject_code: "CS102", status: "CoE-approved" },
      ];
      const mockCount = 2;

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

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT
      const result = await getPapers({
        department_name: "Computer Science",
        page: 1,
      });

      // ASSERT
      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(mockCount);
      expect(supabase.from).toHaveBeenCalledWith("exam_papers");
      expect(mockQuery.eq).toHaveBeenCalledWith(
        "department_name",
        "Computer Science"
      );
      expect(mockQuery.neq).toHaveBeenCalledWith("status", "Submitted");
    });

    it("applies filters array correctly", async () => {
      // ARRANGE: Mock with filters
      const filters = [
        { field: "semester", value: "3" },
        { field: "academic_year", value: 2024 },
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT
      await getPapers({
        department_name: "Computer Science",
        filters,
        page: 1,
      });

      // ASSERT: Verify filters were applied
      expect(mockQuery.eq).toHaveBeenCalledWith("semester", "3");
      expect(mockQuery.eq).toHaveBeenCalledWith("academic_year", 2024);
    });

    it("applies search by subject_code", async () => {
      // ARRANGE: Mock with search
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [{ id: 1, subject_code: "CS101" }],
          error: null,
          count: 1,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT
      await getPapers({
        department_name: "Computer Science",
        search: "CS101",
        page: 1,
      });

      // ASSERT: Search was applied
      expect(mockQuery.eq).toHaveBeenCalledWith("subject_code", "CS101");
    });

    it("ignores empty search strings", async () => {
      // ARRANGE: Mock with empty search
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT
      await getPapers({
        department_name: "Computer Science",
        search: "   ",
        page: 1,
      });

      // ASSERT: Search by subject_code was NOT called (only department_name eq)
      const subjectCodeCalls = mockQuery.eq.mock.calls.filter(
        (call) => call[0] === "subject_code"
      );
      expect(subjectCodeCalls.length).toBe(0);
    });

    it("applies pagination correctly", async () => {
      // ARRANGE
      const page = 3;
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT
      await getPapers({
        department_name: "Computer Science",
        page,
      });

      // ASSERT: Pagination range calculated correctly
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      expect(mockQuery.range).toHaveBeenCalledWith(from, to);
    });

    it("works without pagination", async () => {
      // ARRANGE: No page parameter
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        neq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT
      await getPapers({
        department_name: "Computer Science",
      });

      // ASSERT: range() was not called
      expect(mockQuery.range).toBeUndefined();
    });

    it("throws error when query fails", async () => {
      // ARRANGE: Mock error
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Database error"),
          count: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT & ASSERT
      await expect(
        getPapers({ department_name: "Computer Science", page: 1 })
      ).rejects.toThrow("Papers could not be loaded!");
    });
  });

  // ==================== getPaper TESTS ====================

  describe("getPaper", () => {
    it("fetches a single paper by id", async () => {
      // ARRANGE
      const mockPaper = {
        id: 1,
        subject_code: "CS101",
        subject_name: "Data Structures",
      };

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockPaper,
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT
      const result = await getPaper(1);

      // ASSERT
      expect(result).toEqual(mockPaper);
      expect(supabase.from).toHaveBeenCalledWith("exam_papers");
      expect(mockQuery.eq).toHaveBeenCalledWith("id", 1);
      expect(mockQuery.single).toHaveBeenCalled();
    });

    it("throws error when paper not found", async () => {
      // ARRANGE
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Not found"),
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT & ASSERT
      await expect(getPaper(999)).rejects.toThrow("Paper not found!");
    });
  });

  // ==================== approvePaper TESTS ====================

  describe("approvePaper", () => {
    it("updates paper with approval data", async () => {
      // ARRANGE
      const paperId = 1;
      const updateObj = {
        status: "CoE-approved",
        approved_at: new Date().toISOString(),
      };
      const mockUpdatedPaper = { id: paperId, ...updateObj };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUpdatedPaper,
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      const result = await approvePaper(paperId, updateObj);

      // ASSERT
      expect(result).toEqual(mockUpdatedPaper);
      expect(supabase.from).toHaveBeenCalledWith("exam_papers");
      expect(mockQuery.update).toHaveBeenCalledWith(updateObj);
      expect(mockQuery.eq).toHaveBeenCalledWith("id", paperId);
    });

    it("throws error when update fails", async () => {
      // ARRANGE
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Update failed"),
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT & ASSERT
      await expect(approvePaper(1, { status: "approved" })).rejects.toThrow(
        "Paper could not be locked!"
      );
    });
  });

  // ==================== uploadScrutinizedFiles TESTS ====================

  describe("uploadScrutinizedFiles", () => {
    it("uploads both QP and Schema files successfully", async () => {
      // ARRANGE
      const mockPaper = {
        storage_folder_path: "Academic Year 2024/CS/Sem3/DS",
      };
      const mockQpFile = new File(["qp content"], "qp.docx");
      const mockSchemaFile = new File(["schema content"], "schema.docx");

      const mockStorageFrom = vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
      });
      supabase.storage.from = mockStorageFrom;

      // ACT
      const result = await uploadScrutinizedFiles(
        mockPaper,
        mockQpFile,
        mockSchemaFile
      );

      // ASSERT
      expect(result).toHaveProperty("qp_file_url");
      expect(result).toHaveProperty("scheme_file_url");
      expect(result.qp_file_url).toContain("QP.docx");
      expect(result.scheme_file_url).toContain("Scheme.docx");
      expect(mockStorageFrom).toHaveBeenCalledWith("papers");
    });

    it("throws error when QP file is missing", async () => {
      // ARRANGE
      const mockPaper = { storage_folder_path: "test/path" };
      const mockSchemaFile = new File(["schema"], "schema.docx");

      // ACT & ASSERT
      await expect(
        uploadScrutinizedFiles(mockPaper, null, mockSchemaFile)
      ).rejects.toThrow("QP and Schema files are required");
    });

    it("throws error when Schema file is missing", async () => {
      // ARRANGE
      const mockPaper = { storage_folder_path: "test/path" };
      const mockQpFile = new File(["qp"], "qp.docx");

      // ACT & ASSERT
      await expect(
        uploadScrutinizedFiles(mockPaper, mockQpFile, null)
      ).rejects.toThrow("QP and Schema files are required");
    });

    it("removes QP file when Schema upload fails", async () => {
      // ARRANGE
      const mockPaper = {
        storage_folder_path: "Academic Year 2024/CS/Sem3/DS",
      };
      const mockQpFile = new File(["qp"], "qp.docx");
      const mockSchemaFile = new File(["schema"], "schema.docx");

      const mockRemove = vi.fn().mockResolvedValue({ error: null });
      const mockUpload = vi
        .fn()
        .mockResolvedValueOnce({ error: null }) // QP succeeds
        .mockResolvedValueOnce({ error: new Error("Schema upload failed") }); // Schema fails

      supabase.storage.from = vi.fn().mockReturnValue({
        upload: mockUpload,
        remove: mockRemove,
      });

      // ACT & ASSERT
      await expect(
        uploadScrutinizedFiles(mockPaper, mockQpFile, mockSchemaFile)
      ).rejects.toThrow("Failed to upload corrected Scheme of Valuation");

      // Verify QP was removed after Schema failure
      expect(mockRemove).toHaveBeenCalled();
    });
  });

  // ==================== getFaculties TESTS ====================

  describe("getFaculties", () => {
    it("fetches faculties for a department", async () => {
      // ARRANGE
      const mockFaculties = [
        {
          employee_id: "emp001",
          username: "john_doe",
          department_name: "Computer Science",
          role: "faculty",
        },
        {
          employee_id: "emp002",
          username: "jane_smith",
          department_name: "Computer Science",
          role: "faculty",
        },
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockFaculties,
          error: null,
          count: 2,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT
      const result = await getFaculties({
        department_name: "Computer Science",
        page: 1,
      });

      // ASSERT
      expect(result.data).toEqual(mockFaculties);
      expect(result.count).toBe(2);
      expect(mockQuery.eq).toHaveBeenCalledWith(
        "department_name",
        "Computer Science"
      );
      expect(mockQuery.eq).toHaveBeenCalledWith("role", "faculty");
      expect(mockQuery.is).toHaveBeenCalledWith("deleted_at", null);
    });

    it("applies pagination", async () => {
      // ARRANGE
      const page = 2;
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT
      await getFaculties({
        department_name: "Computer Science",
        page,
      });

      // ASSERT
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      expect(mockQuery.range).toHaveBeenCalledWith(from, to);
    });

    it("throws error when query fails", async () => {
      // ARRANGE
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Database error"),
          count: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      // ACT & ASSERT
      await expect(
        getFaculties({ department_name: "Computer Science", page: 1 })
      ).rejects.toThrow("Faculties could not be loaded!");
    });
  });
});
