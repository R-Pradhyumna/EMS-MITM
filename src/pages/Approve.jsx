import { useCPaper } from "./../features/coe/useCPaper";
import { useBPaper } from "./../features/boe/useBPaper";
import ApprovePaper from "../features/paperActivities/ApprovePaper";
import Spinner from "../ui/Spinner";
function Approve() {
  const role = "boe";
  const usePaperHook = role === "coe" ? useCPaper : useBPaper;

  if (!role) return <Spinner />;
  return <ApprovePaper role={role} usePaperHook={usePaperHook} />;
}

export default Approve;
