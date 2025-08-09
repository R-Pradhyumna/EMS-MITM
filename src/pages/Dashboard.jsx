import Row from "../ui/Row";
import Heading from "../ui/Heading";
import DashboardTable from "../features/dashboard/DashboardTable";
import DashboardTableOperations from "../features/dashboard/DashboardTableOperations";

function Dashboard() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">CoE Dashboard</Heading>
        <DashboardTableOperations />
      </Row>
      <DashboardTable />
    </>
  );
}

export default Dashboard;
