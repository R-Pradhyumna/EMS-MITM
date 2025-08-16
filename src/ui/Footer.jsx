import styled from "styled-components";

import METLogo from "../assets/MET.webp";
import MITLogo from "../assets/MIT-logo-light.webp";

const StyledFooter = styled.footer`
  background-color: var(--color-grey-0);
  border-top: 1px solid var(--color-grey-100);
  padding: 3.2rem 4.8rem;
  grid-column: 2 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2.4rem;
`;

const PortfolioLink = styled.a`
  color: #fc4545;
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: var(--color-brand-500);
  }
`;

const Credits = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  & p:first-child {
    font-weight: 500;
    margin-bottom: 0.4rem;
    color: var(--color-grey-700);
  }
`;

const UserGuides = styled.div`
  display: flex;
  gap: 2.4rem;
  & a {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    color: var(--color-grey-600);
    font-size: 1.4rem;
    font-weight: 500;
    transition: color 0.3s;
    &:hover {
      color: var(--color-brand-600);
    }
  }
  & svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-brand-700);
  }
`;

const Logos = styled.div`
  display: flex;
  align-items: center;
  gap: 2.4rem;
  & img {
    height: 4.2rem;
    width: auto;
    filter: grayscale(var(--image-grayscale)) opacity(var(--image-opacity));
  }
`;

function Footer() {
  return (
    <StyledFooter>
      <Logos>
        <img src={METLogo} alt="MET Logo" />
      </Logos>

      <Credits>
        <p>
          Developed by{" "}
          <PortfolioLink
            href="https://r-pradhyumna.github.io/My-portfolio/"
            target="blank"
          >
            R Pradhyumna | IS&E
          </PortfolioLink>
        </p>
        <p>Copyright &copy; 2025 MITM. All rights reserved.</p>
      </Credits>

      <Logos>
        <img src={MITLogo} alt="MIT Mysore Logo" />
      </Logos>
    </StyledFooter>
  );
}

export default Footer;
