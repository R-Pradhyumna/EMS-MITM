import { HiOutlineUser } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import Logout from "../features/authentication/Logout";
import { useUserData } from "../features/authentication/useUserData";

import ButtonIcon from "./ButtonIcon";
import DarkModeToggle from "./DarkModeToggle";

const StyledHeaderMenu = styled.ul`
  display: flex;
  gap: 0.4rem;
`;

const StyledUserAvatar = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  font-weight: 500;
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

function HeaderMenu() {
  const navigate = useNavigate();
  const { username } = useUserData();

  return (
    <StyledHeaderMenu>
      <StyledUserAvatar>
        <span>Welcome back, {username}</span>
      </StyledUserAvatar>
      <li>
        <ButtonIcon
          onClick={() => navigate("/account")}
          aria-label="Account"
          title="Account Settings"
        >
          <HiOutlineUser />
        </ButtonIcon>
      </li>
      <li>
        <DarkModeToggle aria-label="Toggle Dark Mode" />
      </li>
      <li>
        <Logout aria-label="Logout" />
      </li>
    </StyledHeaderMenu>
  );
}

export default HeaderMenu;
