import { HiOutlineLogout } from "react-icons/hi";

import ButtonIcon from "./../../ui/ButtonIcon";
import SpinnerMini from "./../../ui/SpinnerMini";

import { useLogout } from "./useLogout";

function Logout() {
  const { logout, isLoading } = useLogout();
  return (
    <ButtonIcon disabled={isLoading} onClick={logout} title="Sign Out">
      {!isLoading ? <HiOutlineLogout /> : <SpinnerMini />}
    </ButtonIcon>
  );
}

export default Logout;
