import { useEffect } from "react";
import {
  HiAcademicCap,
  HiCog6Tooth,
  HiGlobeAlt,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from "react-icons/hi2";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useUserData } from "../features/authentication/useUserData";

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    color: var(--color-grey-600);
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.2rem 2.4rem;
    transition: all 0.3s;
  }

  /* This works because react-router places the active class on the active NavLink */
  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-800);
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-sm);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brand-600);
  }
`;

// Configuration for sidebar links, including allowedRoles
const navLinksConfig = [
  {
    path: "/homepage",
    label: "Home",
    icon: <HiOutlineHome />,
    alwaysShow: true, // Always show Home, even to unauthenticated users
  },
  {
    path: "/faculty",
    label: "Faculty",
    icon: <HiOutlineUsers />,
    allowedRoles: ["faculty"],
  },
  {
    path: "/coe",
    label: "CoE",
    icon: <HiAcademicCap />,
    allowedRoles: ["CoE"],
  },
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <HiCog6Tooth />,
    allowedRoles: ["CoE"],
  },
  {
    path: "/boe",
    label: "BoE",
    icon: <HiOutlineUserGroup />,
    allowedRoles: ["BoE"],
  },
  {
    path: "/principal",
    label: "Principal",
    icon: <HiGlobeAlt />,
    allowedRoles: ["Principal"],
  },
];

function MainNav() {
  const { role, isLoading } = useUserData();

  let activeLinks;

  if (isLoading || !role) {
    // Only show Home when not logged in
    activeLinks = navLinksConfig.filter((link) => link.alwaysShow);
  } else {
    // Show Home + links included in user's allowedRoles (if specified)
    activeLinks = navLinksConfig.filter(
      (link) =>
        link.alwaysShow ||
        !link.allowedRoles ||
        link.allowedRoles
          ?.map((r) => r.toLowerCase())
          .includes(role.toLowerCase())
    );
  }

  return (
    <nav>
      <NavList>
        {activeLinks.map((link) => (
          <li key={link.path}>
            <StyledNavLink to={link.path}>
              {link.icon}
              <span>{link.label}</span>
            </StyledNavLink>
          </li>
        ))}
      </NavList>
    </nav>
  );
}

export default MainNav;
