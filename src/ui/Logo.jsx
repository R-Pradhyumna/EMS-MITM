import styled from "styled-components";
import { useDarkMode } from "../context/DarkModeContext";
import logoDark from "../assets/MIT-logo-dark.png";
import logoLight from "../assets/MIT-logo-light.png";

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
      <Img src={src} alt="MIT Logo" />
    </StyledLogo>
  );
}

export default Logo;
