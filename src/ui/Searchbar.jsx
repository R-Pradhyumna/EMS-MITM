// SearchBar.js
import { HiMagnifyingGlass } from "react-icons/hi2";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

const StyledSearchBar = styled.div`
  border: 1px solid var(--color-grey-100);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius-sm);
  padding: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 230px;
  max-width: 320px;
`;

const StyledInput = styled.input`
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 1.4rem;
  padding: 0.44rem 0.8rem;
  background-color: var(--color-grey-0);
  color: #22223b;
  box-shadow: var(--shadow-xs);

  &::placeholder {
    color: #a0aec0;
  }
  &:focus {
    outline: 2px solid var(--color-brand-600);
  }
`;

function SearchBar({
  paramKey = "subject_code", // or subject_code, match your DB+getPapers
  placeholder = "Search by subject code...",
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(paramKey) ?? "";

  function handleChange(e) {
    const next = e.target.value;
    if (next) searchParams.set(paramKey, next);
    else searchParams.delete(paramKey);
    searchParams.set("page", 1); // optionally reset to page 1
    setSearchParams(searchParams);
  }

  return (
    <StyledSearchBar>
      <HiMagnifyingGlass />
      <StyledInput
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Enter subject code"
        autoComplete="off"
      />
    </StyledSearchBar>
  );
}

export default SearchBar;
