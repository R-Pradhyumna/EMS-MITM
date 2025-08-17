import styled, { keyframes } from "styled-components";
import Heading from "../ui/Heading";
import EMSLogo from "../assets/Main-logo.webp";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const HomePageLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
  align-items: center;
  padding-top: 2rem;
`;

const AnimatedHeading = styled(Heading)`
  /* 1. Animate the main heading */
  animation: ${fadeInUp} 0.6s ease-out forwards;
`;

const WelcomeCard = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 4.8rem;
  display: grid;
  grid-template-columns: 25rem 1fr;
  gap: 5rem;
  align-items: center;
  width: 100%;
  max-width: 100rem;

  /* 2. Animate the card container */
  opacity: 0; /* Start hidden */
  animation: ${fadeInUp} 0.6s 0.3s ease-out forwards; /* Delay start by 0.3s */
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  /* 3. Animate the logo */
  opacity: 0; /* Start hidden */
  animation: ${slideInFromLeft} 0.6s 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    forwards; /* Delay start by 0.8s */

  img {
    width: 100%;
    max-width: 200px;
    height: auto;
  }
`;

const AboutSection = styled.div`
  /* 4. Animate the text section */
  opacity: 0; /* Start hidden */
  animation: ${slideInFromRight} 0.6s 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    forwards; /* Delay start by 0.8s */
  text-align: justify;
  & h2 {
    color: var(--color-brand-600);
    margin-bottom: 1.6rem;
  }

  & p {
    color: var(--color-grey-600);
    line-height: 1.7;
    font-size: 1.5rem;
  }
`;

function HomePage() {
  return (
    <HomePageLayout>
      <AnimatedHeading as="h1">Welcome to ExamSuite</AnimatedHeading>

      <WelcomeCard>
        <LogoContainer>
          <img src={EMSLogo} alt="EMS Logo" />
        </LogoContainer>
        <AboutSection>
          <Heading as="h2">About This System</Heading>
          <p>
            A professional platform for organizing, storing, and managing
            academic exam papers. Designed for educational institutions, it
            ensures secure access, efficient categorization, and streamlined
            document handling for administrators and staff. The system supports
            multi-department coordination, advanced search and filtering, and
            maintains comprehensive records to simplify examination management
            and enhance institutional reliability
          </p>
        </AboutSection>
      </WelcomeCard>
    </HomePageLayout>
  );
}

export default HomePage;
