import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import BPaperDataBox from "../../../features/boe/BPaperDataBox";

// Mock DataItem
vi.mock("../../../ui/DataItem", () => ({
  default: ({ icon, label, children }) => (
    <div data-testid="data-item">
      <span data-testid="label">{label}</span>
      <span data-testid="content">{children}</span>
    </div>
  ),
}));

// Mock react-icons
vi.mock("react-icons/hi2", () => ({
  HiOutlineDocumentText: () => <span>DocumentIcon</span>,
  HiOutlineAcademicCap: () => <span>AcademicIcon</span>,
  HiOutlineUser: () => <span>UserIcon</span>,
  HiOutlineBuilding: () => <span>BuildingIcon</span>,
  HiOutlineCalendar: () => <span>CalendarIcon</span>,
}));

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("BPaperDataBox - Unit Tests", () => {
  const mockPaper = {
    id: 1,
    status: "Submitted",
    subject_name: "Data Structures",
    subject_code: "CS101",
    department_name: "Computer Science",
    semester: "5th Semester",
    academic_year: "2024-25",
    uploaded_by: "John Doe",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-16T14:45:00Z",
    downloaded_at: null,
  };

  // ==================== RENDERING ====================
  describe("Rendering", () => {
    it("renders paper data box with all information", () => {
      // ARRANGE & ACT
      render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
      expect(screen.getAllByText(/CS101/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Computer Science/i)).toBeInTheDocument();
    });

    it("renders header with status badge", () => {
      // ARRANGE & ACT
      render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      expect(screen.getByText("Submitted")).toBeInTheDocument();
    });

    it("renders subject name and code", () => {
      // ARRANGE & ACT
      render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
      expect(screen.getByText(/\(CS101\)/i)).toBeInTheDocument();
    });

    it("renders uploaded by information", () => {
      // ARRANGE & ACT
      render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("renders department information", () => {
      // ARRANGE & ACT
      render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      expect(screen.getByText("Computer Science")).toBeInTheDocument();
    });

    it("renders semester and academic year", () => {
      // ARRANGE & ACT
      render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      expect(screen.getByText(/5th Semester, 2024-25/i)).toBeInTheDocument();
    });
  });

  // ==================== NULL/UNDEFINED HANDLING ====================
  describe("Null/Undefined Handling", () => {
    it("returns null when paper is null", () => {
      // ARRANGE & ACT
      const { container } = render(<BPaperDataBox paper={null} />);

      // ASSERT
      expect(container.firstChild).toBeNull();
    });

    it("returns null when paper is undefined", () => {
      // ARRANGE & ACT
      const { container } = render(<BPaperDataBox paper={undefined} />);

      // ASSERT
      expect(container.firstChild).toBeNull();
    });

    it("renders without subject code when not provided", () => {
      // ARRANGE
      const paperWithoutCode = { ...mockPaper, subject_code: null };

      // ACT
      render(<BPaperDataBox paper={paperWithoutCode} />);

      // ASSERT
      expect(screen.getByText("Data Structures")).toBeInTheDocument();
      expect(screen.queryByText(/\(CS101\)/i)).not.toBeInTheDocument();
    });
  });

  // ==================== STATUS BADGE ====================
  describe("Status Badge", () => {
    it("renders Submitted status badge correctly", () => {
      // ARRANGE
      const paperWithStatus = { ...mockPaper, status: "Submitted" };

      // ACT
      render(<BPaperDataBox paper={paperWithStatus} />);

      // ASSERT
      expect(screen.getByText("Submitted")).toBeInTheDocument();
    });

    it("renders CoE-approved status badge correctly", () => {
      // ARRANGE
      const paperWithStatus = { ...mockPaper, status: "CoE-approved" };

      // ACT
      const { container } = render(<BPaperDataBox paper={paperWithStatus} />);

      // ASSERT
      expect(container.textContent).toContain("CoE approved");
    });

    it("renders BoE-approved status badge correctly", () => {
      // ARRANGE
      const paperWithStatus = { ...mockPaper, status: "BoE-approved" };

      // ACT
      const { container } = render(<BPaperDataBox paper={paperWithStatus} />);

      // ASSERT
      expect(container.textContent).toContain("BoE approved");
    });

    it("renders Locked status badge correctly", () => {
      // ARRANGE
      const paperWithStatus = { ...mockPaper, status: "Locked" };

      // ACT
      render(<BPaperDataBox paper={paperWithStatus} />);

      // ASSERT
      expect(screen.getByText("Locked")).toBeInTheDocument();
    });

    it("renders Downloaded status badge correctly", () => {
      // ARRANGE
      const paperWithStatus = { ...mockPaper, status: "Downloaded" };

      // ACT
      render(<BPaperDataBox paper={paperWithStatus} />);

      // ASSERT
      expect(screen.getByText("Downloaded")).toBeInTheDocument();
    });
  });

  // ==================== HEADER SECTION ====================
  describe("Header Section", () => {
    it("renders paper details header", () => {
      // ARRANGE & ACT
      const { container } = render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      expect(container.textContent).toContain("CS101");
    });

    it("renders status badge in header", () => {
      // ARRANGE & ACT
      render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      expect(screen.getByText("Submitted")).toBeInTheDocument();
    });
  });

  // ==================== DATE FORMATTING ====================
  describe("Date Formatting", () => {
    it("renders created_at date when provided", () => {
      // ARRANGE & ACT
      render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      const dateElements = screen.getAllByTestId("content");
      const hasFormattedDate = dateElements.some((el) =>
        el.textContent.match(/Jan|Feb|Mar|2024/)
      );
      expect(hasFormattedDate).toBe(true);
    });

    it("renders updated_at date when different from created_at", () => {
      // ARRANGE
      const paperWithUpdate = {
        ...mockPaper,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      };

      // ACT
      render(<BPaperDataBox paper={paperWithUpdate} />);

      // ASSERT
      const labels = screen.getAllByTestId("label");
      expect(labels.some((el) => el.textContent.includes("Created"))).toBe(
        true
      );
      expect(labels.some((el) => el.textContent.includes("Updated"))).toBe(
        true
      );
    });

    it("does not render updated_at when same as created_at", () => {
      // ARRANGE
      const paperSameDates = {
        ...mockPaper,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
      };

      // ACT
      render(<BPaperDataBox paper={paperSameDates} />);

      // ASSERT
      const labels = screen.getAllByTestId("label");
      expect(labels.some((el) => el.textContent.includes("Updated"))).toBe(
        false
      );
    });

    it("renders downloaded_at date when provided", () => {
      // ARRANGE
      const paperWithDownload = {
        ...mockPaper,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
        downloaded_at: "2024-01-25T09:00:00Z",
      };

      // ACT
      render(<BPaperDataBox paper={paperWithDownload} />);

      // ASSERT
      const labels = screen.getAllByTestId("label");
      expect(labels.some((el) => el.textContent.includes("Approved"))).toBe(
        true
      );
    });
  });

  // ==================== TWO COLUMN LAYOUT ====================
  describe("Two Column Layout", () => {
    it("renders DataItem components", () => {
      // ARRANGE & ACT
      render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      const dataItems = screen.getAllByTestId("data-item");
      expect(dataItems.length).toBeGreaterThan(3);
    });

    it("renders all labels correctly", () => {
      // ARRANGE & ACT
      render(<BPaperDataBox paper={mockPaper} />);

      // ASSERT
      expect(screen.getByText(/Subject -/i)).toBeInTheDocument();
      expect(screen.getByText(/Uploaded by -/i)).toBeInTheDocument();
      expect(screen.getByText(/Department -/i)).toBeInTheDocument();
      expect(screen.getByText(/Semester, Year -/i)).toBeInTheDocument();
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles null dates gracefully", () => {
      // ARRANGE
      const paperWithNullDates = {
        ...mockPaper,
        created_at: null,
        updated_at: null,
        downloaded_at: null,
      };

      // ACT
      render(<BPaperDataBox paper={paperWithNullDates} />);

      // ASSERT
      const dataStructures = screen.getAllByText(/Data Structures/i);
      expect(dataStructures.length).toBeGreaterThan(0);
    });
  });
});
