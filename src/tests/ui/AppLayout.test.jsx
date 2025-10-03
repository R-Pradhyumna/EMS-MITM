import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppLayout from "../../ui/AppLayout";

// Mock the child components since we're testing the layout structure
vi.mock("../../ui/Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock("../../ui/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("../../ui/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

describe("AppLayout Component", () => {
  // Helper function to render AppLayout with routing context
  const renderWithRouter = (ui, { route = "/" } = {}) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={ui} />
        </Routes>
      </MemoryRouter>
    );
  };

  // ==================== BASIC RENDERING ====================

  it("renders all layout components", () => {
    // ARRANGE: Set up AppLayout with router context
    renderWithRouter(<AppLayout />);

    // ACT: Query for all layout parts
    const header = screen.getByTestId("header");
    const sidebar = screen.getByTestId("sidebar");
    const footer = screen.getByTestId("footer");

    // ASSERT: Verify all parts are rendered
    expect(header).toBeInTheDocument();
    expect(sidebar).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  // ==================== HEADER RENDERING ====================

  it("renders Header component", () => {
    // ARRANGE: Render AppLayout
    renderWithRouter(<AppLayout />);

    // ACT: Find the header
    const header = screen.getByTestId("header");

    // ASSERT: Header exists
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent("Header");
  });

  // ==================== SIDEBAR RENDERING ====================

  it("renders Sidebar component", () => {
    // ARRANGE: Render AppLayout
    renderWithRouter(<AppLayout />);

    // ACT: Find the sidebar
    const sidebar = screen.getByTestId("sidebar");

    // ASSERT: Sidebar exists
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveTextContent("Sidebar");
  });

  // ==================== FOOTER RENDERING ====================

  it("renders Footer component", () => {
    // ARRANGE: Render AppLayout
    renderWithRouter(<AppLayout />);

    // ACT: Find the footer
    const footer = screen.getByTestId("footer");

    // ASSERT: Footer exists
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent("Footer");
  });

  // ==================== OUTLET RENDERING ====================

  it("renders Outlet for nested routes", () => {
    // ARRANGE: Create a test component to render in the outlet
    const TestPage = () => <div>Test Page Content</div>;

    render(
      <MemoryRouter initialEntries={["/test"]}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="test" element={<TestPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // ACT: Find the nested route content
    const pageContent = screen.getByText("Test Page Content");

    // ASSERT: Outlet renders the nested route
    expect(pageContent).toBeInTheDocument();
  });

  it("renders Home Page content in Outlet when on /home route", () => {
    // ARRANGE: Set up home route
    const HomePage = () => <div>Home Page</div>;
    const AboutPage = () => <div>About Page</div>;

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="home" element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // ACT: Query for home page content
    const homeContent = screen.getByText("Home Page");

    // ASSERT: Home page renders, About page doesn't
    expect(homeContent).toBeInTheDocument();
    expect(screen.queryByText("About Page")).not.toBeInTheDocument();
  });

  it("renders About Page content in Outlet when on /about route", () => {
    // ARRANGE: Set up about route
    const HomePage = () => <div>Home Page</div>;
    const AboutPage = () => <div>About Page</div>;

    render(
      <MemoryRouter initialEntries={["/about"]}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="home" element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // ACT: Query for about page content
    const aboutContent = screen.getByText("About Page");

    // ASSERT: About page renders, Home page doesn't
    expect(aboutContent).toBeInTheDocument();
    expect(screen.queryByText("Home Page")).not.toBeInTheDocument();
  });

  // ==================== LAYOUT STRUCTURE ====================

  it("has proper layout structure with all sections", () => {
    // ARRANGE: Render the layout
    renderWithRouter(<AppLayout />);

    // ACT: Get all main sections
    const header = screen.getByTestId("header");
    const sidebar = screen.getByTestId("sidebar");
    const footer = screen.getByTestId("footer");

    // ASSERT: All sections are present simultaneously
    expect(header).toBeInTheDocument();
    expect(sidebar).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  // ==================== INTEGRATION WITH NESTED COMPONENTS ====================

  it("integrates all components together correctly", () => {
    // ARRANGE: Create a realistic nested route
    const DashboardPage = () => <div>Dashboard Content</div>;

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // ACT: Query for all elements
    const header = screen.getByTestId("header");
    const sidebar = screen.getByTestId("sidebar");
    const footer = screen.getByTestId("footer");
    const content = screen.getByText("Dashboard Content");

    // ASSERT: All parts render together
    expect(header).toBeInTheDocument();
    expect(sidebar).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  // ==================== EMPTY OUTLET ====================

  it("renders layout even when Outlet has no content", () => {
    // ARRANGE: Render without nested route
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AppLayout />} />
        </Routes>
      </MemoryRouter>
    );

    // ACT: Check layout components still render
    const header = screen.getByTestId("header");
    const sidebar = screen.getByTestId("sidebar");
    const footer = screen.getByTestId("footer");

    // ASSERT: Layout components exist without content
    expect(header).toBeInTheDocument();
    expect(sidebar).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  // ==================== MULTIPLE NESTED ROUTES ====================

  it("handles multiple nested route components", () => {
    // ARRANGE: Set up complex routing
    const FacultyPage = () => <div>Faculty Dashboard</div>;
    const CoEPage = () => <div>CoE Dashboard</div>;

    render(
      <MemoryRouter initialEntries={["/faculty"]}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="coe" element={<CoEPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // ACT: Find faculty content
    const facultyContent = screen.getByText("Faculty Dashboard");

    // ASSERT: Correct route content is displayed
    expect(facultyContent).toBeInTheDocument();
    expect(screen.queryByText("CoE Dashboard")).not.toBeInTheDocument();
  });
});
