import styled from "styled-components";

const StyledFileInput = styled.input.attrs({ type: "file" })`
  font-size: 1.4rem;
  padding: 0.4rem;

  /* Ensure browser-default button is visible */
  appearance: auto;
  -webkit-appearance: file-upload;
  cursor: pointer;

  &::file-selector-button {
    font: inherit;
    background-color: var(--color-brand-600);
    color: white;
    border: none;
    padding: 0.4rem 1.2rem;
    border-radius: var(--border-radius-sm);
    margin-right: 1.2rem;
    cursor: pointer;
  }
`;

function FileInput(props) {
  return <StyledFileInput {...props} />;
}

export default FileInput;
