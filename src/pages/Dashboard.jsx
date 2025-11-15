import DashboardStats from "../features/dashboard/DashboardStats";
import DashboardTable from "../features/dashboard/DashboardTable";

import Heading from "../ui/Heading";
import Row from "../ui/Row";

function Dashboard() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">CoE Dashboard</Heading>
      </Row>
      <DashboardStats />
      <DashboardTable />
    </>
  );
}

export default Dashboard;
