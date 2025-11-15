import { useUserData } from "../features/authentication/useUserData";
import PaperDetail from "../features/coe/PaperDetail";
import BPaperDetail from "./../features/boe/BPaperDetail";

function Paper() {
  const { role } = useUserData();
  return role === "BoE" ? <BPaperDetail /> : <PaperDetail />;
}

export default Paper;
