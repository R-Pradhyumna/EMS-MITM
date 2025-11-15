import { useUserData } from "../features/authentication/useUserData";
import ApprovePaper from "../features/paperActivities/ApprovePaper";
import Spinner from "../ui/Spinner";
import { useBPaper } from "./../features/boe/useBPaper";
import { useCPaper } from "./../features/coe/useCPaper";
import PageNotFound from "./PageNotFound";

function Approve() {
  const { role, isLoading } = useUserData();
  if (isLoading) return <Spinner />;

  if (role !== "CoE" && role !== "BoE") {
    return <PageNotFound />;
  }

  const usePaperHook = role === "CoE" ? useCPaper : useBPaper;

  return <ApprovePaper role={role} usePaperHook={usePaperHook} />;
}

export default Approve;
