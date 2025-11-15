import CoERow from "./CoERow";

import Empty from "../../ui/Empty";
import Menus from "../../ui/Menus";
import Pagination from "../../ui/Pagination";
import Table from "../../ui/Table";
import TableSkeleton from "../../ui/TableSkeleton";

import { useCPapers } from "./useCPapers";

/**
 * CoETable
 * ----------
 * Renders the Committee of Examinations (CoE) view/table for exam papers.
 * Handles:
 *  - Fetching all (paginated) papers via useCPapers
 *  - Displays skeleton while loading, "empty" state if none
 *  - Shows paginated, interactive table with row-level menus/actions
 *  - Integrates with CoERow for per-paper logic and conditional menu actions
 */
function CoETable() {
  // Custom hook loads data, loading state, and total count for pagination
  const { papers = [], isLoading, count } = useCPapers();

  // Show custom "empty" state if there are no papers after loading
  if (!isLoading && !papers.length) {
    return <Empty resourceName="papers" />;
  }

  // Main render: interactive table with custom columns for CoE workflow
  return (
    <Menus>
      <Table columns="1.4fr 1.8fr 2.2fr 1fr 1fr 1fr">
        <Table.Header>
          <div>Subject Code</div>
          <div>Academic Year</div>
          <div>Subject Name</div>
          <div>Semester</div>
          <div>Status</div>
          <div></div> {/* Empty for row actions */}
        </Table.Header>

        {/* Render skeleton or actual rows */}
        {isLoading ? (
          <TableSkeleton numRows={papers.length || 5} />
        ) : (
          <Table.Body
            data={papers}
            render={(paper) => <CoERow key={paper.id} paper={paper} />}
          />
        )}

        <Table.Footer>
          {/* Show pagination only when not loading */}
          {!isLoading && <Pagination count={count} />}
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default CoETable;

// import CoERow from "./CoERow";

// import Empty from "../../ui/Empty";
// import Menus from "../../ui/Menus";
// import Pagination from "../../ui/Pagination";
// import Table from "../../ui/Table";
// import TableSkeleton from "../../ui/TableSkeleton";

// import { useCPapers } from "./useCPapers";

// /**
//  * CoETable
//  * ----------
//  * Renders the Committee of Examinations (CoE) view/table for exam papers.
//  * Handles:
//  *  - Fetching all (paginated) papers via useCPapers
//  *  - Displays spinner while loading, "empty" state if none
//  *  - Shows paginated, interactive table with row-level menus/actions
//  *  - Integrates with CoERow for per-paper logic and conditional menu actions
//  */
// function CoETable() {
//   // Custom hook loads data, loading state, and total count for pagination
//   const { papers = [], isLoading, count } = useCPapers();

//   // Show custom "empty" state if there are no papers returned after loading
//   if (!papers.length) return <Empty resourceName="papers" />;

//   // Main render: interactive table with custom columns for CoE workflow
//   return (
//     <Menus>
//       {/* <Table columns="1.4fr 2fr 2.4fr 1.4fr 1fr 3.2rem"> */}
//       <Table columns="1.4fr 1.8fr 2.2fr 1fr 1fr 1fr">
//         <Table.Header>
//           <div>Subject Code</div>
//           <div>Academic Year</div>
//           <div>Subject Name</div>
//           <div>Semester</div>
//           <div>Status</div>
//           <div></div> {/* Empty for row actions */}
//         </Table.Header>

//         {/* Render all rows. Each row handles its own actions/logic via CoERow */}
//         {isLoading ? (
//           <TableSkeleton numRows={papers.length || 5} />
//         ) : (
//           <Table.Body
//             data={papers}
//             render={(paper) => <CoERow key={paper.id} paper={paper} />}
//           />
//         )}
//         {/* <Table.Body
//           data={papers}
//           render={(paper) => <CoERow key={paper.id} paper={paper} />}
//         /> */}

//         {/* Paginate using total count (provided by useCPapers) */}
//         <Table.Footer>
//           <Pagination count={count} />
//         </Table.Footer>
//       </Table>
//     </Menus>
//   );
// }

// export default CoETable;
