import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getPapers, createEditPapers } from "../../services/apiFaculty";
import supabase from "../../services/supabase";
import { PAGE_SIZE } from "../../utils/constants";

// Mock the Supabase client
vi.mock("../../services/supabase", () => ({
  default: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

// Mock supabaseUrl
vi.mock("../../services/supabase", () => ({
  default: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
  supabaseUrl: "https://mock.supabase.co",
}));

describe("apiFaculty Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== getPapers TESTS ====================

  describe("getPapers", () => {
    it("fetches papers successfully without pagination", async () => {
      // ARRANGE: Mock data and Supabase chain
      const mockData = [
        {
          id: 1,
          subject_code: "CS101",
          academic_year: 2024,
          subject_name: "Data Structures",
          semester: 3,
          status: "Submitted",
        },
        {
          id: 2,
          subject_code: "CS102",
          academic_year: 2024,
          subject_name: "Algorithms",
          semester: 3,
          status: "CoE-approved",
        },
      ];
      const mockCount = 2;
      const employee_id = "emp123";

      // Mock the Supabase query chain
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
          count: mockCount,
        }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockQuery);
      supabase.from = vi.fn().mockReturnValue({ select: mockSelect });

      // ACT: Call the function
      const result = await getPapers({ employee_id });

      // ASSERT: Verify correct data returned
      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(mockCount);

      // Verify Supabase was called correctly
      expect(supabase.from).toHaveBeenCalledWith("exam_papers");
      expect(mockSelect).toHaveBeenCalledWith(
        "id, subject_code,academic_year,subject_name,semester,status",
        { count: "exact" }
      );
      expect(mockQuery.eq).toHaveBeenCalledWith("uploaded_by", employee_id);
      expect(mockQuery.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });

    it("fetches papers with pagination", async () => {
      // ARRANGE: Mock paginated data
      const page = 2;
      const employee_id = "emp123";
      const mockData = [{ id: 11, subject_code: "CS201" }];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
          count: 25,
        }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockQuery);
      supabase.from = vi.fn().mockReturnValue({ select: mockSelect });

      // ACT
      const result = await getPapers({ page, employee_id });

      // ASSERT
      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(25);

      // Verify pagination range calculation
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      expect(mockQuery.range).toHaveBeenCalledWith(from, to);
    });

    it("throws error when database query fails", async () => {
      // ARRANGE: Mock error response
      const employee_id = "emp123";
      const mockError = new Error("Database connection failed");

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
          count: null,
        }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockQuery);
      supabase.from = vi.fn().mockReturnValue({ select: mockSelect });

      // ACT & ASSERT: Expect function to throw
      await expect(getPapers({ employee_id })).rejects.toThrow(
        "Papers could not be loaded!"
      );
    });

    it("handles empty results", async () => {
      // ARRANGE: Mock empty data
      const employee_id = "emp123";
      const mockData = [];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
          count: 0,
        }),
      };

      const mockSelect = vi.fn().mockReturnValue(mockQuery);
      supabase.from = vi.fn().mockReturnValue({ select: mockSelect });

      // ACT
      const result = await getPapers({ employee_id });

      // ASSERT
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  // ==================== createEditPapers TESTS ====================

  describe("createEditPapers", () => {
    it("creates a new paper successfully (without file uploads)", async () => {
      // ARRANGE: Mock new paper data without files
      const newPaper = {
        subject_code: "CS101",
        subject_name: "Data Structures",
        semester: 3,
        academic_year: "2024",
        department_name: "Computer Science",
        qp_file: [],
        scheme_file: [],
        qp_file_url: null,
        scheme_file_url: null,
        qp_file_type: null,
        scheme_file_type: null,
        uploaded_by: "emp123",
      };

      const mockInsertedData = {
        id: 1,
        ...newPaper,
        academic_year: 2024,
        status: "Submitted",
      };

      // Mock Supabase insert chain
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockInsertedData,
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      const result = await createEditPapers(newPaper);

      // ASSERT
      expect(result).toEqual(mockInsertedData);
      expect(supabase.from).toHaveBeenCalledWith("exam_papers");
      expect(mockQuery.insert).toHaveBeenCalled();
    });

    it("updates an existing paper", async () => {
      // ARRANGE: Mock update data
      const existingId = 5;
      const updatePaper = {
        subject_code: "CS101",
        subject_name: "Updated Subject",
        semester: 4,
        academic_year: "2024",
        department_name: "Computer Science",
        qp_file: [],
        scheme_file: [],
        qp_file_url: "https://existing-qp.docx",
        scheme_file_url: "https://existing-scheme.docx",
        qp_file_type:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        scheme_file_type:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        uploaded_by: "emp123",
      };

      const mockUpdatedData = {
        id: existingId,
        ...updatePaper,
        academic_year: 2024,
        status: "Submitted",
      };

      // Mock Supabase update chain
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUpdatedData,
          error: null,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      const result = await createEditPapers(updatePaper, existingId);

      // ASSERT
      expect(result).toEqual(mockUpdatedData);
      expect(mockQuery.update).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith("id", existingId);
    });

    it("uploads files when creating a new paper", async () => {
      // ARRANGE: Mock new paper with files
      const mockQpFile = new File(["qp content"], "qp.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const mockSchemeFile = new File(["scheme content"], "scheme.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const newPaper = {
        subject_code: "CS101",
        subject_name: "Data Structures",
        semester: 3,
        academic_year: "2024",
        department_name: "Computer Science",
        qp_file: [mockQpFile],
        scheme_file: [mockSchemeFile],
        qp_file_url: null,
        scheme_file_url: null,
        qp_file_type: null,
        scheme_file_type: null,
        uploaded_by: "emp123",
      };

      // Mock storage upload
      const mockStorageFrom = vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
      });
      supabase.storage.from = mockStorageFrom;

      // Mock database insert
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1, status: "Submitted" },
          error: null,
        }),
      };
      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT
      const result = await createEditPapers(newPaper);

      // ASSERT
      expect(mockStorageFrom).toHaveBeenCalledWith("papers");
      expect(result).toBeDefined();
    });

    it("throws error when database insert fails", async () => {
      // ARRANGE: Mock insert error
      const newPaper = {
        subject_code: "CS101",
        subject_name: "Data Structures",
        semester: 3,
        academic_year: "2024",
        department_name: "Computer Science",
        qp_file: [],
        scheme_file: [],
        qp_file_url: null,
        scheme_file_url: null,
        qp_file_type: null,
        scheme_file_type: null,
        uploaded_by: "emp123",
      };

      const mockError = new Error("Database insert failed");

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      };

      supabase.from = vi.fn().mockReturnValue(mockQuery);

      // ACT & ASSERT
      await expect(createEditPapers(newPaper)).rejects.toThrow(
        "Could not save paper metadata in DB"
      );
    });
  });
});
