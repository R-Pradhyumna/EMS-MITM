import { useEffect, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

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
  text-transform: uppercase;

  &::placeholder {
    color: #a0aec0;
  }
  &:focus {
    outline: 2px solid var(--color-brand-600);
  }
`;

function SearchBar({ paramKey = "subject_code" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(paramKey) ?? "";

  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      const newSearchParams = new URLSearchParams(searchParams);
      const prevValue = searchParams.get(paramKey) ?? "";

      if (inputValue !== prevValue) {
        // Only reset page if the search value changes
        if (inputValue) newSearchParams.set(paramKey, inputValue);
        else newSearchParams.delete(paramKey);
        newSearchParams.set("page", "1");
        setSearchParams(newSearchParams);
      }
      // If inputValue didn't change from prevValue, don't touch page
    }, 800);

    return () => clearTimeout(handler);
  }, [inputValue, paramKey, setSearchParams]);

  function handleChange(e) {
    setInputValue(e.target.value.toUpperCase());
  }

  return (
    <StyledSearchBar>
      <HiMagnifyingGlass />
      <StyledInput
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Search by subject code..."
        autoComplete="off"
      />
    </StyledSearchBar>
  );
}

export default SearchBar;
