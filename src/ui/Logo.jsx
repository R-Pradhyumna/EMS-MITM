import styled from "styled-components";
import { useDarkMode } from "../context/DarkModeContext";
import logoDark from "../assets/Test-Logo.png";
import logoLight from "../assets/logo-light.png";

const StyledLogo = styled.div`
  text-align: center;
`;

const Img = styled.img`
  height: 9.6rem;
  width: auto;
`;

function Logo() {
  const { isDarkMode } = useDarkMode();
  const src = isDarkMode ? logoDark : logoLight;
  return (
    <StyledLogo>
      <Img src={src} alt="EMS Logo" />
    </StyledLogo>
  );
}

export default Logo;
