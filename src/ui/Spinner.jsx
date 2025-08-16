import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  to {
    transform: rotate(1turn)
  }
`;

const SpinnerOverlay = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(
    --color-grey-50,
    #fff
  ); /* Adapts to theme, fallback if variable missing */
  z-index: 9999;
  transition: background 0.3s;
`;

const MainSpinner = styled.div`
  width: 6.4rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(farthest-side, var(--color-brand-600) 94%, #0000)
      top/10px 10px no-repeat,
    conic-gradient(#0000 30%, var(--color-brand-600));
  -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 10px), #000 0);
  animation: ${rotate} 1.5s infinite linear;
`;

function Spinner() {
  return (
    <SpinnerOverlay>
      <MainSpinner />
    </SpinnerOverlay>
  );
}

export default Spinner;

// import styled, { keyframes } from "styled-components";

// const rotate = keyframes`
//   to {
//     transform: rotate(1turn)
//   }
// `;

// const Spinner = styled.div`
//   margin: 4.8rem auto;

//   width: 6.4rem;
//   aspect-ratio: 1;
//   border-radius: 50%;
//   background: radial-gradient(farthest-side, var(--color-brand-600) 94%, #0000)
//       top/10px 10px no-repeat,
//     conic-gradient(#0000 30%, var(--color-brand-600));
//   -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 10px), #000 0);
//   animation: ${rotate} 1.5s infinite linear;
// `;

// export default Spinner;
