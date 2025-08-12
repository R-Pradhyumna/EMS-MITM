import { useCPaper } from "./../features/coe/useCPaper";
import { useBPaper } from "./../features/boe/useBPaper";
import ApprovePaper from "../features/paperActivities/ApprovePaper";
import Spinner from "../ui/Spinner";
import { useRole } from "../features/authentication/useRole";

function Approve() {
  const { role, isLoading } = useRole();

  if (isLoading) return <Spinner />;

  if (role !== "CoE" && role !== "BoE") {
    return <FullPage>Not Authorized</FullPage>;
  }
  console.log(role);
  const usePaperHook = role === "CoE" ? useCPaper : useBPaper;

  return <ApprovePaper role={role} usePaperHook={usePaperHook} />;
}

export default Approve;
