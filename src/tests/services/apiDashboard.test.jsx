import Papa from "papaparse";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSchema,
  uploadExamScheduleFile,
  uploadSubjectsFile,
} from "../../services/apiDashboard";
import supabase from "../../services/supabase";

vi.mock("../../services/supabase", () => ({
  default: {
    from: vi.fn(),
  },
  supabaseUrl: "https://mock.supabase.co", // mock URL for upload functions
}));

describe("apiCoE Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSchema", () => {
    it("fetches schema papers with pagination", async () => {
      const mockData = [
        {
          subject_code: "CS101",
          academic_year: 2024,
          uploaded_by: "emp1",
          scheme_file_url: "url-to-scheme",
        },
      ];
      const mockCount = 1;

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
          count: mockCount,
        }),
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await getSchema({ page: 1 });

      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(mockCount);
      expect(mockQuery.eq).toHaveBeenCalledWith("is_downloaded", true);
      expect(mockQuery.range).toHaveBeenCalled();
    });

    it("throws error if query fails", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("DB failure"),
          count: null,
        }),
      };

      supabase.from.mockReturnValue(mockQuery);

      await expect(getSchema({ page: 1 })).rejects.toThrow(
        "SoV papers could not be loaded!"
      );
    });
  });

  describe("uploadSubjectsFile", () => {
    // Mock Papa.parse to simulate CSV parsing
    beforeEach(() => {
      vi.spyOn(Papa, "parse").mockImplementation((file, options) => {
        const mockCsvData = [
          {
            subject_code: "CS101",
            subject_name: "Data Structures",
            subject_type: "Theory",
            department_id: "1",
            instructions_url: "url1",
            syllabus_url: "url2",
            model_paper_url: "url3",
            declaration_url: "url4",
            see_template_url: "url5",
            scheme_template_url: "url6",
          },
          // Add an invalid row to test filtering
          {
            subject_code: "",
            subject_name: "Invalid Subject",
          },
        ];
        options.complete({ data: mockCsvData });
      });
    });

    it("parses and uploads CSV with valid rows only", async () => {
      const mockFile = new File(["csv content"], "subjects.csv");

      supabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ data: [{}], error: null }),
      });

      const result = await uploadSubjectsFile(mockFile);

      expect(result.processed).toBe(1); // 1 valid row processed
      expect(result.skipped).toBe(1); // 1 invalid row skipped
      expect(result.total).toBe(2);

      expect(supabase.from).toHaveBeenCalledWith("subjects");
    });

    it("rejects if no valid rows found", async () => {
      // Change Papa.parse to return only invalid rows
      Papa.parse.mockImplementationOnce((file, options) => {
        options.complete({
          data: [{ subject_code: "", subject_name: "" }],
        });
      });

      const mockFile = new File(["csv content"], "invalid.csv");

      await expect(uploadSubjectsFile(mockFile)).rejects.toThrow(
        "No valid rows found. All fields including document URLs must be present for every subject!"
      );
    });

    it("rejects if upsert fails", async () => {
      const mockFile = new File(["csv content"], "fail.csv");

      supabase.from.mockReturnValue({
        upsert: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Upsert error") }),
      });

      await expect(uploadSubjectsFile(mockFile)).rejects.toThrow(
        "Upsert error"
      );
    });
  });

  describe("uploadExamScheduleFile", () => {
    beforeEach(() => {
      vi.spyOn(Papa, "parse").mockImplementation((file, options) => {
        const data = [
          {
            exam_name: "Midterm",
            department_id: "1",
            semester: "3",
            scheme: "A",
            exam_datetime: "2023-07-01T10:00",
            subject_id: "2",
            academic_year: "2023",
          },
          {
            exam_name: "",
            department_id: "1",
            semester: "3",
            scheme: "A",
            exam_datetime: "2023-07-01T10:00",
            subject_id: "2",
            academic_year: "2023",
          }, // invalid row
        ];
        options.complete({ data });
      });
    });

    it("parses and inserts valid exam schedule rows", async () => {
      const mockFile = new File(["csv content"], "exams.csv");

      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: [{}], error: null }),
      });

      const result = await uploadExamScheduleFile(mockFile);
      expect(result).toHaveLength(1);
      expect(supabase.from).toHaveBeenCalledWith("exams");
    });

    it("rejects if no valid exam rows found", async () => {
      Papa.parse.mockImplementationOnce((file, options) => {
        options.complete({
          data: [
            {
              exam_name: "",
              department_id: "1",
              semester: "3",
              scheme: "A",
              exam_datetime: "2023-07-01T10:00",
              subject_id: "2",
              academic_year: "2023",
            },
          ],
        });
      });

      const mockFile = new File(["csv content"], "invalid.csv");
      await expect(uploadExamScheduleFile(mockFile)).rejects.toThrow(
        "No valid exam rows found. Each row must fill all required fields!"
      );
    });

    it("rejects on insert error", async () => {
      const mockFile = new File(["csv content"], "fail.csv");

      supabase.from.mockReturnValue({
        insert: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Insert failed") }),
      });

      await expect(uploadExamScheduleFile(mockFile)).rejects.toThrow(
        "Insert failed"
      );
    });
  });
});
